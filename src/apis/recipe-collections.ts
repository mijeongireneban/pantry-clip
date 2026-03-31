import type {
  CreateRecipeCollectionRequest,
  ListRecipeCollectionRecipesRequest,
  ListRecipeCollectionRecipesResponse,
  ListRecipeCollectionsResponse,
  RecipeCollectionDto,
  SetRecipeCollectionsRequest,
  SetRecipeCollectionsResponse,
  UpdateRecipeCollectionRequest
} from "@/src/apis/@types/recipe-collections";
import type { ApiErrorResponse } from "@/src/apis/@types/recipes";

async function toErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function toQueryString(query: ListRecipeCollectionRecipesRequest) {
  const params = new URLSearchParams();

  if (query.collectionId) {
    params.set("collectionId", query.collectionId);
  }

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.cursor) {
    params.set("cursor", query.cursor);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listRecipeCollections(options?: {
  signal?: AbortSignal;
}) {
  const response = await fetch("/api/recipe-collections", {
    signal: options?.signal
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to load recipe collections.")
    );
  }

  return (await response.json()) as ListRecipeCollectionsResponse;
}

export async function createRecipeCollection(
  payload: CreateRecipeCollectionRequest
) {
  const response = await fetch("/api/recipe-collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to create recipe collection.")
    );
  }

  return (await response.json()) as RecipeCollectionDto;
}

export async function updateRecipeCollection(
  id: string,
  payload: UpdateRecipeCollectionRequest
) {
  const response = await fetch(`/api/recipe-collections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to update recipe collection.")
    );
  }

  return (await response.json()) as RecipeCollectionDto;
}

export async function deleteRecipeCollection(id: string) {
  const response = await fetch(`/api/recipe-collections/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to delete recipe collection.")
    );
  }

  return (await response.json()) as { ok: true };
}

export async function listRecipeCollectionRecipes(
  query: ListRecipeCollectionRecipesRequest = {},
  options?: { signal?: AbortSignal }
) {
  const response = await fetch(
    `/api/recipe-collections/recipes${toQueryString(query)}`,
    {
      signal: options?.signal
    }
  );

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to load saved recipes.")
    );
  }

  return (await response.json()) as ListRecipeCollectionRecipesResponse;
}

export async function setRecipeCollections(
  recipeId: string,
  payload: SetRecipeCollectionsRequest
) {
  const response = await fetch(`/api/recipes/${recipeId}/collections`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Failed to update recipe collections.")
    );
  }

  return (await response.json()) as SetRecipeCollectionsResponse;
}
