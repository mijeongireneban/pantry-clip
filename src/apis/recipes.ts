import type {
  ApiErrorResponse,
  CreateRecipeRequest,
  DeleteRecipeResponse,
  ListRecipesRequest,
  ListRecipesResponse,
  RecipeDto,
  SummarizeJobHandleResponse,
  SummarizeJobResultResponse,
  SummarizeRecipeRequest,
  UpdateRecipeRequest
} from "@/src/apis/@types/recipes";

async function toErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return error.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function toQueryString(query: ListRecipesRequest) {
  const params = new URLSearchParams();

  if (query.q) {
    params.set("q", query.q);
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

export async function createSummarizeJob(payload: SummarizeRecipeRequest) {
  const response = await fetch("/api/recipes/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to summarize recipe."));
  }

  return (await response.json()) as SummarizeJobHandleResponse;
}

export async function getSummarizeJob(jobId: string) {
  const response = await fetch(`/api/recipes/summarize/${jobId}`);

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to load summarize job."));
  }

  return (await response.json()) as SummarizeJobResultResponse;
}

export async function createRecipe(payload: CreateRecipeRequest) {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to create recipe."));
  }

  return (await response.json()) as RecipeDto;
}

export async function listRecipes(query: ListRecipesRequest = {}) {
  const response = await fetch(`/api/recipes${toQueryString(query)}`);

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to load recipes."));
  }

  return (await response.json()) as ListRecipesResponse;
}

export async function getRecipeById(id: string) {
  const response = await fetch(`/api/recipes/${id}`);

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to load recipe."));
  }

  return (await response.json()) as RecipeDto;
}

export async function updateRecipe(id: string, payload: UpdateRecipeRequest) {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to update recipe."));
  }

  return (await response.json()) as RecipeDto;
}

export async function toggleSaveRecipe(id: string, isSaved: boolean) {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isSaved })
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to update recipe."));
  }

  return (await response.json()) as RecipeDto;
}

export async function deleteRecipe(id: string) {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Failed to delete recipe."));
  }

  return (await response.json()) as DeleteRecipeResponse;
}
