import OpenAI from "openai";
import { z } from "zod";

import type { SummarizedRecipeDraft } from "@/src/apps/recipes/recipes.types";
import type { ExtractedRecipeContext } from "@/src/lib/server/recipes/recipes-extraction.service";
import { ApiError } from "@/src/lib/utils/api-error";

const recipeDraftSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export async function summarizeRecipeFromContext(
  sourceUrl: string,
  context: ExtractedRecipeContext
): Promise<SummarizedRecipeDraft> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const contextLines: string[] = [`URL: ${sourceUrl}`];

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
