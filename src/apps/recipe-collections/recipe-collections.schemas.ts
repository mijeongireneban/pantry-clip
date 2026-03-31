import { z } from "zod";

export const recipeCollectionNameSchema = z.string().trim().min(1).max(80);

export const createRecipeCollectionSchema = z.object({
  name: recipeCollectionNameSchema
});

export const updateRecipeCollectionSchema = z.object({
  name: recipeCollectionNameSchema
});

export const setRecipeCollectionsSchema = z.object({
  collectionIds: z.array(z.string().uuid()).max(50)
});

export const toggleRecipeSavedSchema = z.object({
  isSaved: z.boolean()
});

export const listRecipeCollectionRecipesQuerySchema = z.object({
  collectionId: z.string().uuid().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});
