export type SummarizeRecipeRequest = {
  sourceUrl: string;
};

export type SummarizeRecipeResponse = {
  sourceType: "youtube_shorts" | "instagram_reels" | "other";
  titleDraft: string;
  ingredientsDraft: string;
  stepsDraft: string;
  confidence?: number;
};
