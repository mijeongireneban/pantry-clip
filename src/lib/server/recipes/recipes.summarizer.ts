import OpenAI from "openai";
import { z } from "zod";

import type { SummarizedRecipeDraft, SummarizeRecipeInput } from "@/src/apps/recipes/recipes.types";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";

const recipeDraftSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

async function fetchPageMeta(url: string): Promise<{ title: string; description: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PantryClip/1.0)" }
    });

    clearTimeout(timeout);

    const html = await response.text();

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

export async function summarizeRecipeFromUrl(
  input: SummarizeRecipeInput
): Promise<SummarizedRecipeDraft> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const sourceType = inferSourceType(input.sourceUrl);
  const meta = await fetchPageMeta(input.sourceUrl);

  const contextLines: string[] = [`URL: ${input.sourceUrl}`];
  if (meta.title) contextLines.push(`제목: ${meta.title}`);
  if (meta.description) contextLines.push(`설명: ${meta.description}`);

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
- 동영상 정보가 부족하면 일반적인 해당 요리 레시피를 작성하되 confidence는 낮게 설정
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

  return {
    sourceType,
    titleDraft: parsed.title,
    ingredientsDraft: parsed.ingredients.map((item) => `- ${item}`).join("\n"),
    stepsDraft: parsed.steps.map((step, i) => `${i + 1}. ${step}`).join("\n"),
    confidence: parsed.confidence
  };
}
