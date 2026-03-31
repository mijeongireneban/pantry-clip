import { Prisma } from "@prisma/client";

import type {
  CreateRecipeInput,
  ListRecipesQuery,
  PaginatedRecipes,
  Recipe,
  SourceType,
  UpdateRecipeInput
} from "@/src/apps/recipes/recipes.types";
import { prisma } from "@/src/lib/server/prisma";
import {
  decodeRecipesCursor,
  encodeRecipesCursor
} from "@/src/lib/server/recipes/recipes.utils";

const recipeWithCollectionsSelect = {
  collectionItems: {
    select: {
      collectionId: true
    }
  }
} satisfies Prisma.RecipeInclude;

type RecipeRecord = Prisma.RecipeGetPayload<{
  include: typeof recipeWithCollectionsSelect;
}>;

function toRecipe(record: RecipeRecord): Recipe {
  const collectionIds = record.collectionItems.map((item) => item.collectionId);

  return {
    id: record.id,
    userId: record.userId,
    sourceUrl: record.sourceUrl,
    sourceType: record.sourceType,
    title: record.title,
    ingredientsText: record.ingredientsText,
    stepsText: record.stepsText,
    summarySource: record.summarySource,
    aiConfidence: record.aiConfidence,
    isSaved: collectionIds.length > 0,
    collectionIds,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function createRecipe(
  userId: string,
  input: CreateRecipeInput
): Promise<Recipe> {
  const recipe = await prisma.recipe.create({
    data: {
      userId,
      sourceUrl: input.sourceUrl.trim(),
      sourceType: input.sourceType,
      title: input.title.trim(),
      ingredientsText: input.ingredientsText.trim(),
      stepsText: input.stepsText.trim(),
      summarySource: input.summarySource,
      aiConfidence: input.aiConfidence ?? null
    },
    include: recipeWithCollectionsSelect
  });

  return toRecipe(recipe);
}

export async function createRecipeUrlOnly(
  userId: string,
  input: {
    sourceUrl: string;
    sourceType: SourceType;
    title: string;
  }
): Promise<Recipe> {
  const recipe = await prisma.recipe.create({
    data: {
      userId,
      sourceUrl: input.sourceUrl.trim(),
      sourceType: input.sourceType,
      title: input.title.trim(),
      ingredientsText: "",
      stepsText: "",
      summarySource: "manual",
      aiConfidence: null
    },
    include: recipeWithCollectionsSelect
  });

  return toRecipe(recipe);
}

export async function listRecipes(
  userId: string,
  query: ListRecipesQuery
): Promise<PaginatedRecipes> {
  const needle = query.q?.toLowerCase();
  const cursor = query.cursor ? decodeRecipesCursor(query.cursor) : null;
  const where: Prisma.RecipeWhereInput = {
    userId,
    deletedAt: null,
    ...(needle
      ? {
          title: {
            contains: needle,
            mode: "insensitive"
          }
        }
      : {}),
    ...(cursor
      ? {
          OR: [
            {
              createdAt: {
                lt: new Date(cursor.createdAt)
              }
            },
            {
              createdAt: new Date(cursor.createdAt),
              id: {
                lt: cursor.id
              }
            }
          ]
        }
      : {})
  };

  const window = await prisma.recipe.findMany({
    where,
    include: recipeWithCollectionsSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.limit + 1
  });
  const hasMore = window.length > query.limit;
  const items = (hasMore ? window.slice(0, query.limit) : window).map(toRecipe);
  const tail = items[items.length - 1];

  return {
    items,
    nextCursor:
      hasMore && tail
        ? encodeRecipesCursor({ createdAt: tail.createdAt, id: tail.id })
        : undefined
  };
}

export async function getRecipeById(
  userId: string,
  id: string
): Promise<Recipe | null> {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      userId,
      deletedAt: null
    },
    include: recipeWithCollectionsSelect
  });

  return recipe ? toRecipe(recipe) : null;
}

export async function updateRecipe(
  userId: string,
  id: string,
  patch: UpdateRecipeInput
): Promise<Recipe | null> {
  const current = await prisma.recipe.findFirst({
    where: {
      id,
      userId,
      deletedAt: null
    }
  });

  if (!current) {
    return null;
  }

  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      ...(patch.sourceUrl !== undefined
        ? { sourceUrl: patch.sourceUrl.trim() }
        : {}),
      ...(patch.sourceType !== undefined
        ? { sourceType: patch.sourceType }
        : {}),
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.ingredientsText !== undefined
        ? { ingredientsText: patch.ingredientsText.trim() }
        : {}),
      ...(patch.stepsText !== undefined
        ? { stepsText: patch.stepsText.trim() }
        : {}),
      ...(patch.summarySource !== undefined
        ? { summarySource: patch.summarySource }
        : {}),
      ...(patch.aiConfidence !== undefined
        ? { aiConfidence: patch.aiConfidence }
        : {}),
      updatedAt: new Date()
    },
    include: recipeWithCollectionsSelect
  });

  return toRecipe(updated);
}

export async function deleteRecipe(
  userId: string,
  id: string
): Promise<boolean> {
  const deleted = await prisma.recipe.updateMany({
    where: {
      id,
      userId,
      deletedAt: null
    },
    data: {
      deletedAt: new Date(),
      updatedAt: new Date()
    }
  });

  if (deleted.count === 0) {
    return false;
  }

  return true;
}
