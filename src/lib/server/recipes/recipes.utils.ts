import type { SourceType } from "@/src/apps/recipes/recipes.types";

export function inferSourceType(sourceUrl: string): SourceType {
  const normalized = sourceUrl.toLowerCase();

  if (normalized.includes("youtube.com/shorts") || normalized.includes("youtu.be/")) {
    return "youtube_shorts";
  }

  if (normalized.includes("instagram.com/reel")) {
    return "instagram_reels";
  }

  return "other";
}
