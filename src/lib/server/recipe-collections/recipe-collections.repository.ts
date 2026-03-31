import { Prisma } from "@prisma/client";

import type {
  CreateRecipeCollectionInput,
  ListRecipeCollectionRecipesQuery,
  RecipeCollection,
  RecipeCollectionList,
  UpdateRecipeCollectionInput
} from "@/src/apps/recipe-collections/recipe-collections.types";
import type { PaginatedRecipes } from "@/src/apps/recipes/recipes.types";
import { prisma } from "@/src/lib/server/prisma";
import { getRecipeById } from "@/src/lib/server/recipes/recipes.repository";
import {
  decodeRecipesCursor,
  encodeRecipesCursor
} from "@/src/lib/server/recipes/recipes.utils";
import { ApiError } from "@/src/lib/utils/api-error";

export const DEFAULT_RECIPE_COLLECTION_NAME = "Saved";

const recipeCollectionWithItemsSelect = {
  items: {
    where: {
      recipe: {
        deletedAt: null
      }
    },
    select: {
      recipeId: true
    }
  }
} satisfies Prisma.RecipeCollectionInclude;

type RecipeCollectionRecord = Prisma.RecipeCollectionGetPayload<{
  include: typeof recipeCollectionWithItemsSelect;
}>;

function toRecipeCollection(record: RecipeCollectionRecord): RecipeCollection {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    isDefault: record.isDefault,
    recipeCount: record.items.length,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export async function ensureDefaultRecipeCollection(userId: string) {
  const existingDefault = await prisma.recipeCollection.findFirst({
    where: {
      userId,
      isDefault: true
    },
    include: recipeCollectionWithItemsSelect
  });

  if (existingDefault) {
    return toRecipeCollection(existingDefault);
  }

  const existingSaved = await prisma.recipeCollection.findFirst({
    where: {
      userId,
      name: DEFAULT_RECIPE_COLLECTION_NAME
    },
    include: recipeCollectionWithItemsSelect
  });

  if (existingSaved) {
    const updated = await prisma.recipeCollection.update({
      where: {
        id: existingSaved.id
      },
      data: {
        isDefault: true,
        updatedAt: new Date()
      },
      include: recipeCollectionWithItemsSelect
    });

    return toRecipeCollection(updated);
  }

  const created = await prisma.recipeCollection.create({
    data: {
      userId,
      name: DEFAULT_RECIPE_COLLECTION_NAME,
      isDefault: true
    },
    include: recipeCollectionWithItemsSelect
  });

  return toRecipeCollection(created);
}

export async function listRecipeCollections(
  userId: string
): Promise<RecipeCollectionList> {
  const defaultCollection = await ensureDefaultRecipeCollection(userId);
  const collections = await prisma.recipeCollection.findMany({
    where: {
      userId
    },
    include: recipeCollectionWithItemsSelect,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }, { id: "asc" }]
  });
  const allRecipesCount = await prisma.recipe.count({
    where: {
      userId,
      deletedAt: null,
      collectionItems: {
        some: {
          collection: {
            userId
          }
        }
      }
    }
  });

  return {
    items: collections.map(toRecipeCollection),
    allRecipesCount,
    defaultCollectionId: defaultCollection.id
  };
}

export async function createRecipeCollection(
  userId: string,
  input: CreateRecipeCollectionInput
): Promise<RecipeCollection> {
  try {
    const created = await prisma.recipeCollection.create({
      data: {
        userId,
        name: input.name.trim()
      },
      include: recipeCollectionWithItemsSelect
    });

    return toRecipeCollection(created);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "A collection with this name already exists.",
        400
      );
    }

    throw error;
  }
}

export async function updateRecipeCollection(
  userId: string,
  id: string,
  input: UpdateRecipeCollectionInput
): Promise<RecipeCollection | null> {
  const collection = await prisma.recipeCollection.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!collection) {
    return null;
  }

  if (collection.isDefault) {
    throw new ApiError(
      "FORBIDDEN",
      "The default Saved collection cannot be renamed.",
      403
    );
  }

  try {
    const updated = await prisma.recipeCollection.update({
      where: {
        id
      },
      data: {
        name: input.name.trim(),
        updatedAt: new Date()
      },
      include: recipeCollectionWithItemsSelect
    });

    return toRecipeCollection(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "A collection with this name already exists.",
        400
      );
    }

    throw error;
  }
}

export async function deleteRecipeCollection(
  userId: string,
  id: string
): Promise<boolean> {
  const collection = await prisma.recipeCollection.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!collection) {
    return false;
  }

  if (collection.isDefault) {
    throw new ApiError(
      "FORBIDDEN",
      "The default Saved collection cannot be deleted.",
      403
    );
  }

  await prisma.recipeCollection.delete({
    where: {
      id
    }
  });

  return true;
}

export async function listSavedRecipes(
  userId: string,
  query: ListRecipeCollectionRecipesQuery
): Promise<PaginatedRecipes> {
  const cursor = query.cursor ? decodeRecipesCursor(query.cursor) : null;
  const where: Prisma.RecipeWhereInput = {
    userId,
    deletedAt: null,
    collectionItems: {
      some: query.collectionId
        ? {
            collectionId: query.collectionId,
            collection: {
              userId
            }
          }
        : {
            collection: {
              userId
            }
          }
    },
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
    include: {
      collectionItems: {
        select: {
          collectionId: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: query.limit + 1
  });
  const hasMore = window.length > query.limit;
  const items = (hasMore ? window.slice(0, query.limit) : window).map(
    (record) => ({
      id: record.id,
      userId: record.userId,
      sourceUrl: record.sourceUrl,
      sourceType: record.sourceType,
      title: record.title,
      ingredientsText: record.ingredientsText,
      stepsText: record.stepsText,
      summarySource: record.summarySource,
      aiConfidence: record.aiConfidence,
      isSaved: record.collectionItems.length > 0,
      collectionIds: record.collectionItems.map((item) => item.collectionId),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    })
  );
  const tail = items[items.length - 1];

  return {
    items,
    nextCursor:
      hasMore && tail
        ? encodeRecipesCursor({ createdAt: tail.createdAt, id: tail.id })
        : undefined
  };
}

async function validateCollectionOwnership(
  userId: string,
  collectionIds: string[]
) {
  const uniqueCollectionIds = [...new Set(collectionIds)];

  if (uniqueCollectionIds.length === 0) {
    return uniqueCollectionIds;
  }

  const count = await prisma.recipeCollection.count({
    where: {
      userId,
      id: {
        in: uniqueCollectionIds
      }
    }
  });

  if (count !== uniqueCollectionIds.length) {
    throw new ApiError("NOT_FOUND", "Collection not found", 404);
  }

  return uniqueCollectionIds;
}

export async function setRecipeCollections(
  userId: string,
  recipeId: string,
  collectionIds: string[]
) {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      userId,
      deletedAt: null
    }
  });

  if (!recipe) {
    return null;
  }

  const ownedCollectionIds = await validateCollectionOwnership(
    userId,
    collectionIds
  );

  await prisma.$transaction(async (tx) => {
    await tx.recipeCollectionItem.deleteMany({
      where: {
        recipeId,
        collection: {
          userId
        }
      }
    });

    if (ownedCollectionIds.length > 0) {
      await tx.recipeCollectionItem.createMany({
        data: ownedCollectionIds.map((collectionId) => ({
          collectionId,
          recipeId
        })),
        skipDuplicates: true
      });
    }

    await tx.recipe.update({
      where: {
        id: recipeId
      },
      data: {
        updatedAt: new Date()
      }
    });
  });

  return getRecipeById(userId, recipeId);
}

export async function toggleRecipeSaved(
  userId: string,
  recipeId: string,
  isSaved: boolean
) {
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      userId,
      deletedAt: null
    }
  });

  if (!recipe) {
    return null;
  }

  if (!isSaved) {
    await prisma.$transaction(async (tx) => {
      await tx.recipeCollectionItem.deleteMany({
        where: {
          recipeId,
          collection: {
            userId
          }
        }
      });

      await tx.recipe.update({
        where: {
          id: recipeId
        },
        data: {
          updatedAt: new Date()
        }
      });
    });

    return getRecipeById(userId, recipeId);
  }

  const defaultCollection = await ensureDefaultRecipeCollection(userId);

  await prisma.$transaction(async (tx) => {
    await tx.recipeCollectionItem.upsert({
      where: {
        collectionId_recipeId: {
          collectionId: defaultCollection.id,
          recipeId
        }
      },
      update: {},
      create: {
        collectionId: defaultCollection.id,
        recipeId
      }
    });

    await tx.recipe.update({
      where: {
        id: recipeId
      },
      data: {
        updatedAt: new Date()
      }
    });
  });

  return getRecipeById(userId, recipeId);
}
