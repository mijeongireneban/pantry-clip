import type { z } from "zod";

import {
  createRecipeSchema,
  listRecipesQuerySchema,
  saveRecipeUrlSchema,
  sourceTypeSchema,
  summarizeDraftResultSchema,
  summarizeJobHandleSchema,
  summarizeJobResultSchema,
  summarizeJobStatusSchema,
  summarizeRecipeSchema,
  summarySourceSchema,
  uiLanguageSchema,
  updateRecipeSchema
} from "@/src/apps/recipes/recipes.schemas";

export type SourceType = z.infer<typeof sourceTypeSchema>;
export type SummarySource = z.infer<typeof summarySourceSchema>;
export type UiLanguage = z.infer<typeof uiLanguageSchema>;

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type SaveRecipeUrlInput = z.infer<typeof saveRecipeUrlSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type SummarizeRecipeInput = z.infer<typeof summarizeRecipeSchema>;
export type SummarizeJobStatus = z.infer<typeof summarizeJobStatusSchema>;
export type SummarizeJobHandle = z.infer<typeof summarizeJobHandleSchema>;
export type SummarizeDraftResult = z.infer<typeof summarizeDraftResultSchema>;
export type SummarizeJobResult = z.infer<typeof summarizeJobResultSchema>;
export type ListRecipesQuery = z.infer<typeof listRecipesQuerySchema>;
export type SummarizedRecipeDraft = {
  sourceType: SourceType;
  titleDraft: string;
  ingredientsDraft: string;
  stepsDraft: string;
  confidence?: number;
};

export type Recipe = {
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

export type PaginatedRecipes = {
  items: Recipe[];
  nextCursor?: string;
};
