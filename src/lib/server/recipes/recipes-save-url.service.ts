import type {
  SaveRecipeUrlInput,
  SourceType,
  UiLanguage
} from "@/src/apps/recipes/recipes.types";
import { createRecipeUrlOnly } from "@/src/lib/server/recipes/recipes.repository";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import { extractRecipeContext } from "@/src/lib/server/recipes/recipes-extraction.service";

function buildFallbackTitle(
  sourceType: SourceType,
  sourceUrl: string,
  language: UiLanguage
): string {
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");

    if (sourceType === "youtube_shorts") {
      return language === "ko" ? "저장한 유튜브 쇼츠" : "Saved YouTube Shorts";
    }

    if (sourceType === "instagram_reels") {
      return language === "ko" ? "저장한 인스타그램 릴스" : "Saved Instagram Reel";
    }

    return language === "ko" ? `${hostname}에서 저장한 링크` : `Saved from ${hostname}`;
  } catch {
    return language === "ko" ? "저장한 레시피 링크" : "Saved recipe link";
  }
}

function normalizeSavedTitle(
  preferredTitle: string | undefined,
  extractedTitle: string,
  sourceType: SourceType,
  sourceUrl: string,
  language: UiLanguage
): string {
  const title = preferredTitle?.trim() || extractedTitle.trim();

  if (title) {
    return title.slice(0, 140);
  }

  return buildFallbackTitle(sourceType, sourceUrl, language);
}

export async function saveRecipeFromUrl(
  userId: string,
  input: SaveRecipeUrlInput
) {
  const sourceUrl = input.sourceUrl.trim();
  const sourceType = inferSourceType(sourceUrl);
  const language = input.language ?? "ko";
  const extracted = await extractRecipeContext(
    { sourceUrl },
    { enableAudioTranscription: false }
  );
  const title = normalizeSavedTitle(
    input.title,
    extracted.title,
    sourceType,
    sourceUrl,
    language
  );

  return createRecipeUrlOnly(userId, {
    sourceUrl,
    sourceType,
    title
  });
}
