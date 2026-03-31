import { Readable } from "node:stream";

import ytdl from "@distube/ytdl-core";

import type { SummarizeJobFailureKind } from "@/src/lib/server/recipes/recipes-summarize-jobs.types";

const MAX_TRANSCRIPTION_AUDIO_BYTES = 24 * 1024 * 1024;
const YOUTUBE_REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; PantryClip/1.0)",
  "Accept-Language": "ko,en-US;q=0.9,en;q=0.8"
};

type YouTubeAudioFormat = Awaited<ReturnType<typeof ytdl.getInfo>>["formats"][number];

export type DownloadedRecipeAudio = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  estimatedBytes: number | null;
};

export type RecipeAudioDownloadIssue = {
  failureKind: SummarizeJobFailureKind;
  providerCode: string;
  providerMessage: string;
  mediaDebug?: Record<string, unknown>;
};

export type DownloadYouTubeRecipeAudioResult = {
  audio: DownloadedRecipeAudio | null;
  issue: RecipeAudioDownloadIssue | null;
};

function parsePositiveInteger(value: string | number | null | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

function estimateFormatSizeBytes(format: YouTubeAudioFormat): number | null {
  const contentLength = parsePositiveInteger(format.contentLength);

  if (contentLength) {
    return contentLength;
  }

  const durationMs = parsePositiveInteger(format.approxDurationMs);
  const bitrate = format.audioBitrate
    ? format.audioBitrate * 1_000
    : format.averageBitrate ?? format.bitrate ?? null;

  if (!durationMs || !bitrate) {
    return null;
  }

  return Math.ceil((bitrate / 8) * (durationMs / 1_000));
}

function containerToExtension(container: string | undefined): string {
  if (!container) {
    return "webm";
  }

  if (container === "mp4") {
    return "m4a";
  }

  return container;
}

function containerToMimeType(container: string | undefined): string {
  switch (container) {
    case "mp4":
      return "audio/mp4";
    case "webm":
      return "audio/webm";
    default:
      return "application/octet-stream";
  }
}

function containerPreference(container: string | undefined): number {
  if (container === "mp4") {
    return 2;
  }

  if (container === "webm") {
    return 1;
  }

  return 0;
}

function pickPreferredAudioFormat(formats: YouTubeAudioFormat[]): YouTubeAudioFormat | null {
  const candidates = formats
    .filter((format) => Boolean(format.url) && !format.isHLS && !format.isDashMPD)
    .map((format) => ({
      format,
      estimatedBytes: estimateFormatSizeBytes(format),
      bitrateScore: format.audioBitrate ?? format.averageBitrate ?? format.bitrate ?? 0,
      containerScore: containerPreference(format.container)
    }));

  const withinLimit = candidates.filter(
    ({ estimatedBytes }) => estimatedBytes === null || estimatedBytes <= MAX_TRANSCRIPTION_AUDIO_BYTES
  );
  const pool = withinLimit.length > 0 ? withinLimit : candidates;

  pool.sort((left, right) => {
    if (right.bitrateScore !== left.bitrateScore) {
      return right.bitrateScore - left.bitrateScore;
    }

    if (right.containerScore !== left.containerScore) {
      return right.containerScore - left.containerScore;
    }

    if (left.estimatedBytes === null) {
      return 1;
    }

    if (right.estimatedBytes === null) {
      return -1;
    }

    return left.estimatedBytes - right.estimatedBytes;
  });

  return pool[0]?.format ?? null;
}

async function readStreamToBuffer(stream: Readable, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    stream.on("data", (chunk: Buffer | string) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.byteLength;

      if (totalBytes > maxBytes) {
        stream.destroy(new Error("Audio stream exceeded transcription size limit."));
        return;
      }

      chunks.push(buffer);
    });

    stream.once("error", reject);
    stream.once("end", () => resolve(Buffer.concat(chunks)));
  });
}

function normalizeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown media download error";
}

function readStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as { statusCode?: unknown; status?: unknown };

  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode;
  }

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  return null;
}

function inferDownloadIssue(
  canonicalVideoId: string,
  error: unknown
): RecipeAudioDownloadIssue {
  const message = normalizeErrorMessage(error);
  const statusCode = readStatusCode(error);
  const lowerMessage = message.toLowerCase();
  const mediaDebug = {
    canonicalVideoId,
    statusCode,
    errorName: error instanceof Error ? error.name : null
  } satisfies Record<string, unknown>;

  if (statusCode === 429 || lowerMessage.includes("status code: 429")) {
    return {
      failureKind: "source_rate_limited",
      providerCode: "YOUTUBE_RATE_LIMITED",
      providerMessage: message,
      mediaDebug
    };
  }

  if (
    statusCode === 403 ||
    statusCode === 404 ||
    statusCode === 410 ||
    lowerMessage.includes("video unavailable") ||
    lowerMessage.includes("private video")
  ) {
    return {
      failureKind: "source_unavailable",
      providerCode: "YOUTUBE_SOURCE_UNAVAILABLE",
      providerMessage: message,
      mediaDebug
    };
  }

  return {
    failureKind: "media_download_failed",
    providerCode: "YOUTUBE_AUDIO_DOWNLOAD_FAILED",
    providerMessage: message,
    mediaDebug
  };
}

export async function downloadYouTubeRecipeAudio(
  canonicalVideoId: string
): Promise<DownloadYouTubeRecipeAudioResult> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${canonicalVideoId}&hl=ko`;
    const info = await ytdl.getInfo(watchUrl, {
      lang: "ko",
      playerClients: ["WEB", "IOS"],
      requestOptions: {
        headers: YOUTUBE_REQUEST_HEADERS
      }
    });
    const format = pickPreferredAudioFormat(ytdl.filterFormats(info.formats, "audioonly"));

    if (!format) {
      return {
        audio: null,
        issue: {
          failureKind: "media_download_failed",
          providerCode: "YOUTUBE_AUDIO_FORMAT_UNAVAILABLE",
          providerMessage: "No supported YouTube audio format was available.",
          mediaDebug: { canonicalVideoId }
        }
      };
    }

    const estimatedBytes = estimateFormatSizeBytes(format);

    if (estimatedBytes && estimatedBytes > MAX_TRANSCRIPTION_AUDIO_BYTES) {
      return {
        audio: null,
        issue: {
          failureKind: "media_download_failed",
          providerCode: "YOUTUBE_AUDIO_TOO_LARGE",
          providerMessage: "The selected YouTube audio stream exceeded the transcription size limit.",
          mediaDebug: {
            canonicalVideoId,
            estimatedBytes,
            maxBytes: MAX_TRANSCRIPTION_AUDIO_BYTES
          }
        }
      };
    }

    const buffer = await readStreamToBuffer(
      ytdl.downloadFromInfo(info, {
        format,
        quality: format.itag,
        highWaterMark: 1 << 25
      }),
      MAX_TRANSCRIPTION_AUDIO_BYTES
    );

    return {
      audio: {
        buffer,
        fileName: `short-${canonicalVideoId}.${containerToExtension(format.container)}`,
        mimeType: format.mimeType?.split(";")[0] ?? containerToMimeType(format.container),
        estimatedBytes
      },
      issue: null
    };
  } catch (error) {
    console.error("YouTube audio download failed", error);
    return {
      audio: null,
      issue: inferDownloadIssue(canonicalVideoId, error)
    };
  }
}
