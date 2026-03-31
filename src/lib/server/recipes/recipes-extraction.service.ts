import type { SourceType, SummarizeRecipeInput } from "@/src/apps/recipes/recipes.types";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";

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
  transcript: string;
  evidenceSources: string[];
};

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

async function fetchYouTubeTranscript(baseUrl: string | null): Promise<string> {
  if (!baseUrl) {
    return "";
  }

  try {
    const transcriptXml = await fetchText(baseUrl);
    const lines = Array.from(transcriptXml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map(
      (match) => normalizeWhitespace(match[1] ?? "")
    );

    return lines.filter(Boolean).join(" ");
  } catch {
    return "";
  }
}

async function fetchYouTubeContext(sourceUrl: string): Promise<ExtractedRecipeContext> {
  const videoId = extractYouTubeVideoId(sourceUrl);

  if (!videoId) {
    return {
      sourceType: "youtube_shorts",
      canonicalVideoId: null,
      title: "",
      description: "",
      transcript: "",
      evidenceSources: []
    };
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}&hl=ko`;

  try {
    const html = await fetchText(canonicalUrl);
    const playerResponse = extractJsonAssignment(
      html,
      "var ytInitialPlayerResponse = "
    ) as YouTubePlayerResponse | null;
    const videoDetails = playerResponse?.videoDetails;
    const transcript = await fetchYouTubeTranscript(pickCaptionTrack(playerResponse));
    const evidenceSources = ["youtube_metadata"];

    if (transcript) {
      evidenceSources.push("youtube_captions");
    }

    return {
      sourceType: "youtube_shorts",
      canonicalVideoId: videoId,
      title: normalizeWhitespace(videoDetails?.title ?? ""),
      description: normalizeWhitespace(videoDetails?.shortDescription ?? ""),
      transcript,
      evidenceSources
    };
  } catch {
    return {
      sourceType: "youtube_shorts",
      canonicalVideoId: videoId,
      title: "",
      description: "",
      transcript: "",
      evidenceSources: []
    };
  }
}

export async function extractRecipeContext(
  input: SummarizeRecipeInput
): Promise<ExtractedRecipeContext> {
  const sourceType = inferSourceType(input.sourceUrl);

  if (sourceType === "youtube_shorts") {
    const youtubeContext = await fetchYouTubeContext(input.sourceUrl);

    if (youtubeContext.title || youtubeContext.description || youtubeContext.transcript) {
      return youtubeContext;
    }
  }

  const meta = await fetchPageMeta(input.sourceUrl);

  return {
    sourceType,
    canonicalVideoId: null,
    title: meta.title,
    description: meta.description,
    transcript: "",
    evidenceSources: meta.title || meta.description ? ["page_meta"] : []
  };
}

export function hasSufficientRecipeContext(context: ExtractedRecipeContext): boolean {
  const transcriptScore = context.transcript.length >= 120;
  const metadataScore = `${context.title} ${context.description}`.trim().length >= 24;

  return transcriptScore || metadataScore;
}
