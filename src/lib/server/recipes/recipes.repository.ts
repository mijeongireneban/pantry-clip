import { randomUUID } from "node:crypto";
import type {
  CreateRecipeInput,
  ListRecipesQuery,
  PaginatedRecipes,
  Recipe,
  UpdateRecipeInput
} from "@/src/apps/recipes/recipes.types";
import { decodeRecipesCursor, encodeRecipesCursor } from "@/src/lib/server/recipes/recipes.utils";

const recipes = new Map<string, Recipe>();

export async function createRecipe(userId: string, input: CreateRecipeInput): Promise<Recipe> {
  const now = new Date().toISOString();
  const recipe: Recipe = {
    id: randomUUID(),
    userId,
    sourceUrl: input.sourceUrl.trim(),
    sourceType: input.sourceType,
    title: input.title.trim(),
    ingredientsText: input.ingredientsText.trim(),
    stepsText: input.stepsText.trim(),
    summarySource: input.summarySource,
    aiConfidence: input.aiConfidence ?? null,
    createdAt: now,
    updatedAt: now
  };

  recipes.set(recipe.id, recipe);
  return recipe;
}

export async function listRecipes(userId: string, query: ListRecipesQuery): Promise<PaginatedRecipes> {
  const needle = query.q?.toLowerCase();
  const cursor = query.cursor ? decodeRecipesCursor(query.cursor) : null;

  const sorted = [...recipes.values()]
    .filter((recipe) => recipe.userId === userId)
    .filter((recipe) => (needle ? recipe.title.toLowerCase().includes(needle) : true))
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) {
        return a.id < b.id ? 1 : -1;
      }

      return a.createdAt < b.createdAt ? 1 : -1;
    });

  const filtered = cursor
    ? sorted.filter((recipe) => {
        if (recipe.createdAt < cursor.createdAt) {
          return true;
        }

        if (recipe.createdAt === cursor.createdAt && recipe.id < cursor.id) {
          return true;
        }

        return false;
      })
    : sorted;

  const window = filtered.slice(0, query.limit + 1);
  const hasMore = window.length > query.limit;
  const items = hasMore ? window.slice(0, query.limit) : window;
  const tail = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && tail ? encodeRecipesCursor({ createdAt: tail.createdAt, id: tail.id }) : undefined
  };
}

export async function getRecipeById(userId: string, id: string): Promise<Recipe | null> {
  const recipe = recipes.get(id);
  return recipe && recipe.userId === userId ? recipe : null;
}

export async function updateRecipe(
  userId: string,
  id: string,
  patch: UpdateRecipeInput
): Promise<Recipe | null> {
  const current = recipes.get(id);
  if (!current || current.userId !== userId) {
    return null;
  }

  const updated: Recipe = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };

  recipes.set(id, updated);
  return updated;
}

export async function deleteRecipe(userId: string, id: string): Promise<boolean> {
  const current = recipes.get(id);
  if (!current || current.userId !== userId) {
    return false;
  }

  recipes.delete(id);
  return true;
}
