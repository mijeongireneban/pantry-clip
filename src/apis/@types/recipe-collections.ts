import type { ListRecipesResponse, RecipeDto } from "@/src/apis/@types/recipes";

export type RecipeCollectionDto = {
  id: string;
  userId: string;
  name: string;
  isDefault: boolean;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ListRecipeCollectionsResponse = {
  items: RecipeCollectionDto[];
  allRecipesCount: number;
  defaultCollectionId: string;
};

export type CreateRecipeCollectionRequest = {
  name: string;
};

export type UpdateRecipeCollectionRequest = {
  name: string;
};

export type SetRecipeCollectionsRequest = {
  collectionIds: string[];
};

export type ToggleRecipeSavedRequest = {
  isSaved: boolean;
};

export type ListRecipeCollectionRecipesRequest = {
  collectionId?: string;
  cursor?: string;
  limit?: number;
};

export type ListRecipeCollectionRecipesResponse = ListRecipesResponse;
export type SetRecipeCollectionsResponse = RecipeDto;
export type ToggleRecipeSavedResponse = RecipeDto;
