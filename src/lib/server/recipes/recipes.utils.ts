import type { SourceType } from "@/src/apps/recipes/recipes.types";
import { ApiError } from "@/src/lib/utils/api-error";

export type RecipesCursor = {
  createdAt: string;
  id: string;
};

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

export function encodeRecipesCursor(cursor: RecipesCursor): string {
  const raw = JSON.stringify(cursor);
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function decodeRecipesCursor(encoded: string): RecipesCursor {
  try {
    const raw = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as Partial<RecipesCursor>;

    if (!parsed.createdAt || !parsed.id) {
      throw new Error("Missing cursor fields");
    }

    return {
      createdAt: parsed.createdAt,
      id: parsed.id
    };
  } catch {
    throw new ApiError("VALIDATION_ERROR", "Invalid cursor", 400);
  }
}
