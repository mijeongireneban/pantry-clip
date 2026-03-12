export type SourceType = "youtube_shorts" | "instagram_reels" | "other";
export type SummarySource = "manual" | "ai";

export type ApiErrorResponse = {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
  message: string;
  details?: unknown;
};

export type RecipeDto = {
  id: string;
  userId: string;
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
  aiConfidence: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SummarizeRecipeRequest = {
  sourceUrl: string;
};

export type SummarizeRecipeResponse = {
  sourceType: SourceType;
  titleDraft: string;
  ingredientsDraft: string;
  stepsDraft: string;
  confidence?: number;
};

export type CreateRecipeRequest = {
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
  aiConfidence?: number | null;
};

export type UpdateRecipeRequest = Partial<CreateRecipeRequest>;

export type ListRecipesRequest = {
  q?: string;
  limit?: number;
  cursor?: string;
};

export type ListRecipesResponse = {
  items: RecipeDto[];
  nextCursor?: string;
};

export type DeleteRecipeResponse = {
  ok: true;
};
