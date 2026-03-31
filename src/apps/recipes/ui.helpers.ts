import { isYouTubeShortsUrl } from "@/src/apps/recipes/recipes.schemas";
import type { Language, RecipeDraft, RecipeItem } from "@/src/apps/recipes/ui.types";

export function inferSourceType(
  url: string
): "youtube_shorts" | "instagram_reels" | "other" {
  const n = url.toLowerCase();
  if (isYouTubeShortsUrl(url)) return "youtube_shorts";
  if (n.includes("instagram.com/reel")) return "instagram_reels";
  return "other";
}

export function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host.includes("youtube.com")) {
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;

      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) return embedMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function getRecipeThumbnailCandidates(
  recipe: Pick<RecipeItem, "sourceType" | "sourceUrl">
) {
  if (recipe.sourceType !== "youtube_shorts") return [];

  const videoId = extractYouTubeVideoId(recipe.sourceUrl);
  if (!videoId) return [];

  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/default.jpg`
  ];
}

export function toIngredientItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
}

export function toStepItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

export function validateDraft(d: RecipeDraft, language: Language) {
  const e: Partial<Record<keyof RecipeDraft, string>> = {};
  if (!d.sourceUrl.trim())
    e.sourceUrl =
      language === "ko" ? "URL을 입력해주세요." : "Please enter a URL.";
  if (!d.title.trim())
    e.title =
      language === "ko" ? "제목을 입력해주세요." : "Please enter a title.";
  if (!d.ingredientsText.trim())
    e.ingredientsText =
      language === "ko" ? "재료를 입력해주세요." : "Please enter ingredients.";
  if (!d.stepsText.trim())
    e.stepsText =
      language === "ko"
        ? "조리 과정을 입력해주세요."
        : "Please enter preparation steps.";
  return e;
}

export function toUpdatedAtLabel(updatedAt: string, language: Language) {
  return new Date(updatedAt).toLocaleDateString(
    language === "ko" ? "ko-KR" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function matchesRecipeSearchQuery(
  recipe: Pick<RecipeItem, "title">,
  query: string
) {
  const needle = query.trim().toLowerCase();
  return needle === "" || recipe.title.toLowerCase().includes(needle);
}

export function upsertRecipeInList(recipes: RecipeItem[], nextRecipe: RecipeItem) {
  const existingIndex = recipes.findIndex((recipe) => recipe.id === nextRecipe.id);

  if (existingIndex === -1) {
    return [nextRecipe, ...recipes];
  }

  return recipes.map((recipe) =>
    recipe.id === nextRecipe.id ? nextRecipe : recipe
  );
}

export function removeRecipeFromList(recipes: RecipeItem[], recipeId: string) {
  return recipes.filter((recipe) => recipe.id !== recipeId);
}
