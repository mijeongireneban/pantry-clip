import type { SummarizeRecipeRequest, SummarizeRecipeResponse } from "@/src/apis/@types/recipes";

export async function summarizeRecipe(payload: SummarizeRecipeRequest) {
  const response = await fetch("/api/recipes/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to summarize recipe.");
  }

  return (await response.json()) as SummarizeRecipeResponse;
}
