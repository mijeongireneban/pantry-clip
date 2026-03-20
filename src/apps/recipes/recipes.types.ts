import type { z } from "zod";

import {
  createRecipeSchema,
  listRecipesQuerySchema,
  sourceTypeSchema,
  summarizeRecipeSchema,
  summarySourceSchema,
  updateRecipeSchema
} from "@/src/apps/recipes/recipes.schemas";

export type SourceType = z.infer<typeof sourceTypeSchema>;
export type SummarySource = z.infer<typeof summarySourceSchema>;

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type SummarizeRecipeInput = z.infer<typeof summarizeRecipeSchema>;
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
  createdAt: string;
  updatedAt: string;
};

export type PaginatedRecipes = {
  items: Recipe[];
  nextCursor?: string;
};
