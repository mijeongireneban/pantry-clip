import type { SummarizedRecipeDraft, SummarizeRecipeInput } from "@/src/apps/recipes/recipes.types";
import {
  extractRecipeContext,
  hasSufficientRecipeContext
} from "@/src/lib/server/recipes/recipes-extraction.service";
import { summarizeRecipeFromContext } from "@/src/lib/server/recipes/recipes-summarizer.service";
import { ApiError } from "@/src/lib/utils/api-error";

export async function summarizeRecipeFromUrl(
  input: SummarizeRecipeInput
): Promise<SummarizedRecipeDraft> {
  const context = await extractRecipeContext(input);

  if (!hasSufficientRecipeContext(context)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "영상에서 레시피 정보를 충분히 추출하지 못했습니다. 직접 입력으로 계속해주세요.",
      400
    );
  }

  return summarizeRecipeFromContext(input.sourceUrl, context);
}
