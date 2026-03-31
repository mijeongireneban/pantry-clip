import type { z } from "zod";

import {
  createRecipeCollectionSchema,
  listRecipeCollectionRecipesQuerySchema,
  setRecipeCollectionsSchema,
  toggleRecipeSavedSchema,
  updateRecipeCollectionSchema
} from "@/src/apps/recipe-collections/recipe-collections.schemas";

export type CreateRecipeCollectionInput = z.infer<
  typeof createRecipeCollectionSchema
>;
export type UpdateRecipeCollectionInput = z.infer<
  typeof updateRecipeCollectionSchema
>;
export type SetRecipeCollectionsInput = z.infer<
  typeof setRecipeCollectionsSchema
>;
export type ToggleRecipeSavedInput = z.infer<typeof toggleRecipeSavedSchema>;
export type ListRecipeCollectionRecipesQuery = z.infer<
  typeof listRecipeCollectionRecipesQuerySchema
>;

export type RecipeCollection = {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type RecipeCollectionList = {
  items: RecipeCollection[];
  allRecipesCount: number;
  defaultCollectionId: string;
};
