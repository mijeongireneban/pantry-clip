// ─── UI-only types for the recipes home container ────────────────────────────
// These are view-layer types, separate from server/API types.

export type Language = "ko" | "en";

// "add" handles inline draft review. "review" is manual/write-text entry only.
export type Screen =
  | "auth"
  | "list"
  | "add"
  | "review"
  | "detail"
  | "edit"
  | "scrap"
  | "profile";

export type Tab = "library" | "add" | "scrap" | "profile";

export type RecipeItem = {
  id: string;
  sourceType: "youtube_shorts" | "instagram_reels" | "other";
  sourceUrl: string;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: "manual" | "ai";
  isSaved: boolean;
  collectionIds: string[];
  updatedAt: string;
};

export type RecipeCollectionSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  recipeCount: number;
};

export type RecipeDraft = {
  sourceUrl: string;
  sourceType: "youtube_shorts" | "instagram_reels" | "other";
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: "manual" | "ai";
};
