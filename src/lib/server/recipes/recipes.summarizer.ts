import OpenAI from "openai";
import { z } from "zod";

import type { SummarizedRecipeDraft, SummarizeRecipeInput } from "@/src/apps/recipes/recipes.types";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import { ApiError } from "@/src/lib/utils/api-error";

const recipeDraftSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

type ExtractedRecipeContext = {
  title: string;
  description: string;
  transcript: string;
  sourceType: SummarizeRecipeInput["sourceUrl"] extends string ? ReturnType<typeof inferSourceType> : never;
};

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

async function fetchYouTubeContext(sourceUrl: string): Promise<{ title: string; description: string; transcript: string }> {
  const videoId = extractYouTubeVideoId(sourceUrl);

  if (!videoId) {
    return { title: "", description: "", transcript: "" };
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}&hl=ko`;

  try {
    const html = await fetchText(canonicalUrl);
    const playerResponse = extractJsonAssignment(
      html,
      "var ytInitialPlayerResponse = "
    ) as YouTubePlayerResponse | null;
    const videoDetails = playerResponse?.videoDetails;

    const title = normalizeWhitespace(videoDetails?.title ?? "");
    const description = normalizeWhitespace(videoDetails?.shortDescription ?? "");
    const transcript = await fetchYouTubeTranscript(pickCaptionTrack(playerResponse));

    return { title, description, transcript };
  } catch {
    return { title: "", description: "", transcript: "" };
  }
}

async function extractRecipeContext(input: SummarizeRecipeInput): Promise<ExtractedRecipeContext> {
  const sourceType = inferSourceType(input.sourceUrl);

  if (sourceType === "youtube_shorts") {
    const youtubeContext = await fetchYouTubeContext(input.sourceUrl);

    if (youtubeContext.title || youtubeContext.description || youtubeContext.transcript) {
      return { ...youtubeContext, sourceType };
    }
  }

  const meta = await fetchPageMeta(input.sourceUrl);

  return {
    title: meta.title,
    description: meta.description,
    transcript: "",
    sourceType
  };
}

function hasSufficientRecipeContext(context: ExtractedRecipeContext): boolean {
  const transcriptScore = context.transcript.length >= 120;
  const metadataScore = `${context.title} ${context.description}`.trim().length >= 24;

  return transcriptScore || metadataScore;
}

export async function summarizeRecipeFromUrl(
  input: SummarizeRecipeInput
): Promise<SummarizedRecipeDraft> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const context = await extractRecipeContext(input);

  if (!hasSufficientRecipeContext(context)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "영상에서 레시피 정보를 충분히 추출하지 못했습니다. 직접 입력으로 계속해주세요.",
      400
    );
  }

  const contextLines: string[] = [`URL: ${input.sourceUrl}`];
  if (context.title) contextLines.push(`제목: ${context.title}`);
  if (context.description) contextLines.push(`설명: ${context.description}`);
  if (context.transcript) contextLines.push(`자막/음성 전사: ${context.transcript}`);

  const prompt = `당신은 요리 레시피 전문가입니다. 아래 동영상 링크 정보를 바탕으로 레시피 초안을 작성해주세요. 모든 내용은 한국어로 작성합니다.

${contextLines.join("\n")}

다음 JSON 형식으로만 응답하세요:
{
  "title": "레시피 제목 (간결하게, 최대 40자)",
  "ingredients": ["재료1", "재료2", ...],
  "steps": ["1단계 설명", "2단계 설명", ...],
  "confidence": 0.0~1.0 사이의 숫자 (URL 정보 기반 신뢰도)
}

규칙:
- 재료는 개별 항목으로 나열 (각 항목 앞에 "- " 불필요)
- 조리 단계는 순서대로, 각 단계는 명확하고 구체적으로
- 문맥에서 확인되지 않은 재료나 단계를 추측으로 채우지 마세요
- 정확한 요리 종류를 식별할 수 없으면 빈 제목과 빈 배열을 반환하고 confidence를 0으로 설정하세요
- 제목은 요리 이름만 (예: "간장 계란밥", "떡볶이")`;

  const completion = await client.chat.completions.create(
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    },
    { timeout: 15000 }
  );

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  const parsed = recipeDraftSchema.parse(raw);

  if (!parsed.title.trim() || parsed.ingredients.length === 0 || parsed.steps.length === 0) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "영상 문맥이 부족해 정확한 레시피 초안을 만들 수 없었습니다. 직접 입력으로 계속해주세요.",
      400
    );
  }

  return {
    sourceType: context.sourceType,
    titleDraft: parsed.title,
    ingredientsDraft: parsed.ingredients.map((item) => `- ${item}`).join("\n"),
    stepsDraft: parsed.steps.map((step, i) => `${i + 1}. ${step}`).join("\n"),
    confidence: parsed.confidence
  };
}
