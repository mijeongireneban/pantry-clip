import type { SaveRecipeUrlInput, SourceType } from "@/src/apps/recipes/recipes.types";
import { createRecipeUrlOnly } from "@/src/lib/server/recipes/recipes.repository";
import { inferSourceType } from "@/src/lib/server/recipes/recipes.utils";
import { extractRecipeContext } from "@/src/lib/server/recipes/recipes-extraction.service";

function buildFallbackTitle(sourceType: SourceType, sourceUrl: string): string {
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");

    if (sourceType === "youtube_shorts") {
      return "Saved YouTube Shorts";
    }

    if (sourceType === "instagram_reels") {
      return "Saved Instagram Reel";
    }

    return `Saved from ${hostname}`;
  } catch {
    return "Saved recipe link";
  }
}

function normalizeSavedTitle(
  preferredTitle: string | undefined,
  extractedTitle: string,
  sourceType: SourceType,
  sourceUrl: string
): string {
  const title = preferredTitle?.trim() || extractedTitle.trim();

  if (title) {
    return title.slice(0, 140);
  }

  return buildFallbackTitle(sourceType, sourceUrl);
}

export async function saveRecipeFromUrl(
  userId: string,
  input: SaveRecipeUrlInput
) {
  const sourceUrl = input.sourceUrl.trim();
  const sourceType = inferSourceType(sourceUrl);
  const extracted = await extractRecipeContext(
    { sourceUrl },
    { enableAudioTranscription: false }
  );
  const title = normalizeSavedTitle(input.title, extracted.title, sourceType, sourceUrl);

  return createRecipeUrlOnly(userId, {
    sourceUrl,
    sourceType,
    title
  });
}
