export type SourceType = "youtube_shorts" | "instagram_reels" | "other";
export type SummarySource = "manual" | "ai";

export type ApiErrorResponse = {
  code:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "INTERNAL_ERROR";
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
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SummarizeRecipeRequest = {
  sourceUrl: string;
};

export type SaveRecipeUrlRequest = {
  sourceUrl: string;
  title?: string;
  language?: "ko" | "en";
};

export type SummarizeJobStatus =
  | "queued"
  | "extracting"
  | "summarizing"
  | "completed"
  | "insufficient_context"
  | "failed";

export type SummarizeDraftDto = {
  titleDraft: string;
  ingredientsDraft: string;
  stepsDraft: string;
};

export type SummarizeJobHandleResponse = {
  jobId: string;
  status: SummarizeJobStatus;
};

export type SummarizeJobResultResponse = {
  jobId: string;
  status: SummarizeJobStatus;
  sourceUrl: string;
  sourceType: SourceType;
  confidence: number | null;
  draft: SummarizeDraftDto | null;
  error: {
    code: string;
    message: string;
  } | null;
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
