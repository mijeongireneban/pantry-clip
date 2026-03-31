import type { RecipeCollectionDto } from "@/src/apis/@types/recipe-collections";
import type { RecipeDto } from "@/src/apis/@types/recipes";
import type { RecipeCollectionSummary, RecipeItem } from "@/src/apps/recipes/ui.types";

export function toRecipeItem(dto: RecipeDto): RecipeItem {
  return {
    id: dto.id,
    sourceUrl: dto.sourceUrl,
    sourceType: dto.sourceType,
    title: dto.title,
    ingredientsText: dto.ingredientsText,
    stepsText: dto.stepsText,
    summarySource: dto.summarySource,
    isSaved: dto.isSaved,
    collectionIds: dto.collectionIds,
    updatedAt: dto.updatedAt
  };
}

export function toRecipeCollectionSummary(
  collection: RecipeCollectionDto
): RecipeCollectionSummary {
  return {
    id: collection.id,
    name: collection.name,
    isDefault: collection.isDefault,
    recipeCount: collection.recipeCount
  };
}
