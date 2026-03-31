import type { SourceType, SummarizeRecipeInput } from "@/src/apps/recipes/recipes.types";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import type { SummarizeJobStage } from "@/src/lib/server/recipes/recipes-summarize-jobs.types";
import { transcribeRecipeAudio } from "@/src/lib/server/recipes/recipes-transcription.service";
import {
  downloadYouTubeRecipeAudio,
  type RecipeAudioDownloadIssue
} from "@/src/lib/server/recipes/recipes-youtube-audio.service";

const MIN_RECIPE_NARRATIVE_LENGTH = 120;

type YouTubeCaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
};

type YouTubePlayerResponse = {
  videoDetails?: {
    title?: string;
    shortDescription?: string;
  };
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: YouTubeCaptionTrack[];
    };
  };
};

export type ExtractedRecipeContext = {
  sourceType: SourceType;
  canonicalVideoId: string | null;
  title: string;
  description: string;
  subtitleText: string;
  transcriptText: string;
  evidenceSources: string[];
  extractionIssue: RecipeExtractionIssue | null;
};

type ExtractRecipeContextOptions = {
  onStageChange?: (stage: SummarizeJobStage) => Promise<void> | void;
};

export type RecipeExtractionIssue = {
  failureKind: RecipeAudioDownloadIssue["failureKind"];
  providerCode: string;
  providerMessage: string;
  mediaDebug?: Record<string, unknown>;
};

function emptyRecipeContext(
  sourceType: SourceType,
  canonicalVideoId: string | null = null
): ExtractedRecipeContext {
  return {
    sourceType,
    canonicalVideoId,
    title: "",
    description: "",
    subtitleText: "",
    transcriptText: "",
    evidenceSources: [],
    extractionIssue: null
  };
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PantryClip/1.0)" }
    });

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPageMeta(url: string): Promise<{ title: string; description: string }> {
  try {
    const html = await fetchText(url);

    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const metaTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1];

    return {
      title: (ogTitle ?? metaTitle ?? "").trim(),
      description: (ogDesc ?? metaDesc ?? "").trim()
    };
  } catch {
    return { title: "", description: "" };
  }
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/").filter(Boolean)[1] ?? null;
      }

      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractJsonAssignment(html: string, marker: string): unknown | null {
  const start = html.indexOf(marker);

  if (start === -1) {
    return null;
  }

  const firstBrace = html.indexOf("{", start);

  if (firstBrace === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = firstBrace; i < html.length; i += 1) {
    const char = html[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === "\"") {
        inString = false;
      }

      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        try {
          return JSON.parse(html.slice(firstBrace, i + 1));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function normalizeWhitespace(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickCaptionTrack(playerResponse: YouTubePlayerResponse | null): string | null {
  const captionTracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
    return null;
  }

  const preferredTrack =
    captionTracks.find((track) => track.languageCode === "ko") ??
    captionTracks.find((track) => `${track.languageCode}`.startsWith("ko")) ??
    captionTracks.find((track) => !track.kind) ??
    captionTracks[0];

  return preferredTrack?.baseUrl ?? null;
}

async function fetchYouTubeTranscript(
  baseUrl: string | null,
  options: ExtractRecipeContextOptions
): Promise<string> {
  if (!baseUrl) {
    return "";
  }

  try {
    await options.onStageChange?.("extracting_subtitles");
    const transcriptXml = await fetchText(baseUrl);
    const lines = Array.from(transcriptXml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map(
      (match) => normalizeWhitespace(match[1] ?? "")
    );

    return lines.filter(Boolean).join(" ");
  } catch {
    return "";
  }
}

async function maybeTranscribeYouTubeAudio(
  context: Pick<ExtractedRecipeContext, "canonicalVideoId" | "title" | "description" | "subtitleText">,
  options: ExtractRecipeContextOptions
): Promise<{
  transcriptText: string;
  extractionIssue: RecipeExtractionIssue | null;
}> {
  if (!context.canonicalVideoId || context.subtitleText.length >= MIN_RECIPE_NARRATIVE_LENGTH) {
    return {
      transcriptText: "",
      extractionIssue: null
    };
  }

  await options.onStageChange?.("downloading_media");
  const { audio, issue } = await downloadYouTubeRecipeAudio(context.canonicalVideoId);

  if (!audio) {
    return {
      transcriptText: "",
      extractionIssue: issue
    };
  }

  try {
    await options.onStageChange?.("transcribing_audio");
    return {
      transcriptText: await transcribeRecipeAudio(audio, {
        title: context.title,
        description: context.description
      }),
      extractionIssue: null
    };
  } catch (error) {
    console.error("Recipe audio transcription failed", error);

    return {
      transcriptText: "",
      extractionIssue: {
        failureKind: "transcription_failed",
        providerCode: "OPENAI_TRANSCRIPTION_FAILED",
        providerMessage:
          error instanceof Error ? error.message : "Audio transcription failed.",
        mediaDebug: {
          canonicalVideoId: context.canonicalVideoId,
          model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-transcribe"
        }
      }
    };
  }
}

async function fetchYouTubeContext(
  sourceUrl: string,
  options: ExtractRecipeContextOptions
): Promise<ExtractedRecipeContext> {
  const videoId = extractYouTubeVideoId(sourceUrl);

  if (!videoId) {
    return emptyRecipeContext("youtube_shorts");
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}&hl=ko`;

  try {
    await options.onStageChange?.("extracting_metadata");
    const html = await fetchText(canonicalUrl);
    const playerResponse = extractJsonAssignment(
      html,
      "var ytInitialPlayerResponse = "
    ) as YouTubePlayerResponse | null;
    const videoDetails = playerResponse?.videoDetails;
    const subtitleText = await fetchYouTubeTranscript(
      pickCaptionTrack(playerResponse),
      options
    );
    const title = normalizeWhitespace(videoDetails?.title ?? "");
    const description = normalizeWhitespace(videoDetails?.shortDescription ?? "");
    const { transcriptText, extractionIssue } = await maybeTranscribeYouTubeAudio(
      {
        canonicalVideoId: videoId,
        title,
        description,
        subtitleText
      },
      options
    );
    const evidenceSources: string[] = [];

    if (title || description) {
      evidenceSources.push("youtube_metadata");
    }

    if (subtitleText) {
      evidenceSources.push("youtube_captions");
    }

    if (transcriptText) {
      evidenceSources.push("openai_audio_transcription");
    }

    return {
      sourceType: "youtube_shorts",
      canonicalVideoId: videoId,
      title,
      description,
      subtitleText,
      transcriptText,
      evidenceSources,
      extractionIssue
    };
  } catch {
    const { transcriptText, extractionIssue } = await maybeTranscribeYouTubeAudio(
      emptyRecipeContext("youtube_shorts", videoId),
      options
    );

    return {
      ...emptyRecipeContext("youtube_shorts", videoId),
      transcriptText,
      evidenceSources: transcriptText ? ["openai_audio_transcription"] : [],
      extractionIssue
    };
  }
}

export async function extractRecipeContext(
  input: SummarizeRecipeInput,
  options: ExtractRecipeContextOptions = {}
): Promise<ExtractedRecipeContext> {
  const sourceType = inferSourceType(input.sourceUrl);

  if (sourceType === "youtube_shorts") {
    const youtubeContext = await fetchYouTubeContext(input.sourceUrl, options);

    if (
      youtubeContext.title ||
      youtubeContext.description ||
      youtubeContext.subtitleText ||
      youtubeContext.transcriptText
    ) {
      return youtubeContext;
    }

    const meta = await fetchPageMeta(input.sourceUrl);

    return {
      ...youtubeContext,
      title: meta.title,
      description: meta.description,
      evidenceSources: [
        ...youtubeContext.evidenceSources,
        ...(meta.title || meta.description ? ["page_meta"] : [])
      ]
    };
  }
  const meta = await fetchPageMeta(input.sourceUrl);

  return {
    sourceType,
    canonicalVideoId: null,
    title: meta.title,
    description: meta.description,
    subtitleText: "",
    transcriptText: "",
    evidenceSources: meta.title || meta.description ? ["page_meta"] : [],
    extractionIssue: null
  };
}

export function hasSufficientRecipeContext(context: ExtractedRecipeContext): boolean {
  const narrativeText = [context.subtitleText, context.transcriptText]
    .filter(Boolean)
    .join(" ");
  const transcriptScore = narrativeText.length >= MIN_RECIPE_NARRATIVE_LENGTH;
  const metadataScore = `${context.title} ${context.description}`.trim().length >= 24;

  return transcriptScore || metadataScore;
}
