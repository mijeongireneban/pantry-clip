import type { Recipe } from "@/src/apps/recipes/recipes.types";
import { extractYouTubeVideoId } from "@/src/apps/recipes/recipes.utils";
import { listAllSavedRecipes } from "@/src/lib/server/recipe-collections/recipe-collections.repository";
import { getYouTubeVideoMetrics } from "@/src/lib/server/recipes/recipes-youtube-metrics.service";

type RecipeSpotlightSource = "youtube_popular" | "saved_fallback" | "none";

export type RecipeSpotlightResult = {
  recipe: Recipe | null;
  source: RecipeSpotlightSource;
  stats: {
    viewCount: number | null;
    likeCount: number | null;
  } | null;
};

type YouTubeCandidate = {
  recipe: Recipe;
  videoId: string;
};

function compareSpotlightCandidates(
  left: YouTubeCandidate & {
    viewCount: number | null;
    likeCount: number | null;
  },
  right: YouTubeCandidate & {
    viewCount: number | null;
    likeCount: number | null;
  }
) {
  const leftViews = left.viewCount ?? -1;
  const rightViews = right.viewCount ?? -1;

  if (leftViews !== rightViews) {
    return rightViews - leftViews;
  }

  const leftLikes = left.likeCount ?? -1;
  const rightLikes = right.likeCount ?? -1;

  if (leftLikes !== rightLikes) {
    return rightLikes - leftLikes;
  }

  const leftUpdatedAt = Date.parse(left.recipe.updatedAt);
  const rightUpdatedAt = Date.parse(right.recipe.updatedAt);

  if (leftUpdatedAt !== rightUpdatedAt) {
    return rightUpdatedAt - leftUpdatedAt;
  }

  return right.recipe.id.localeCompare(left.recipe.id);
}

function pickFallbackRecipe(savedRecipes: Recipe[]) {
  return savedRecipes[0] ?? null;
}

function toYouTubeCandidates(savedRecipes: Recipe[]) {
  const candidates: YouTubeCandidate[] = [];
  const seenVideoIds = new Set<string>();

  for (const recipe of savedRecipes) {
    const videoId = extractYouTubeVideoId(recipe.sourceUrl);

    if (!videoId || seenVideoIds.has(videoId)) {
      continue;
    }

    seenVideoIds.add(videoId);
    candidates.push({ recipe, videoId });
  }

  return candidates;
}

export async function getRecipeSpotlight(
  userId: string
): Promise<RecipeSpotlightResult> {
  const savedRecipes = await listAllSavedRecipes(userId);
  const fallbackRecipe = pickFallbackRecipe(savedRecipes);

  if (!fallbackRecipe) {
    return {
      recipe: null,
      source: "none",
      stats: null
    };
  }

  const youtubeCandidates = toYouTubeCandidates(savedRecipes);

  if (youtubeCandidates.length === 0) {
    return {
      recipe: fallbackRecipe,
      source: "saved_fallback",
      stats: null
    };
  }

  try {
    const metricsByVideoId = await getYouTubeVideoMetrics(
      youtubeCandidates.map((candidate) => candidate.videoId)
    );
    const rankedCandidates = youtubeCandidates
      .map((candidate) => ({
        ...candidate,
        viewCount: metricsByVideoId.get(candidate.videoId)?.viewCount ?? null,
        likeCount: metricsByVideoId.get(candidate.videoId)?.likeCount ?? null
      }))
      .filter(
        (candidate) =>
          candidate.viewCount !== null || candidate.likeCount !== null
      )
      .sort(compareSpotlightCandidates);

    const spotlight = rankedCandidates[0];

    if (spotlight) {
      return {
        recipe: spotlight.recipe,
        source: "youtube_popular",
        stats: {
          viewCount: spotlight.viewCount,
          likeCount: spotlight.likeCount
        }
      };
    }
  } catch {
    // Fall back to local saved-recipes ordering when the external metrics lookup fails.
  }

  return {
    recipe: fallbackRecipe,
    source: "saved_fallback",
    stats: null
  };
}
