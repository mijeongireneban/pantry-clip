"use client";

import { useEffect, useMemo, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import { listRecipes as listRecipesRequest } from "@/src/apis/recipes";
import { toRecipeItem } from "@/src/apps/recipes/ui.adapters";
import { copy } from "@/src/apps/recipes/ui.constants";
import { isAbortError, matchesRecipeSearchQuery } from "@/src/apps/recipes/ui.helpers";
import type { Language, RecipeItem } from "@/src/apps/recipes/ui.types";

const RECIPES_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;

export function useRecipeLibrary({
  session,
  isReady,
  language
}: {
  session: Session | null;
  isReady: boolean;
  language: Language;
}) {
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [searchResults, setSearchResults] = useState<RecipeItem[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [recipesError, setRecipesError] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState("");

  const ui = copy[language];
  const normalizedSearchQuery = searchQuery.trim();
  const isSearchActive = normalizedSearchQuery.length > 0;

  const libraryRecipes = useMemo(
    () => (isSearchActive ? (searchResults ?? []) : recipes),
    [isSearchActive, recipes, searchResults]
  );

  const isInitialRecipesLoading =
    !isSearchActive && isRecipesLoading && recipes.length === 0;
  const isLibrarySearchLoading =
    isSearchActive && (isSearchLoading || searchResults === null);

  // Search debounce
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset state on sign-out, load on sign-in
  useEffect(() => {
    if (!isReady || !session) {
      setRecipes([]);
      setSearchResults(null);
      setSelectedRecipeId("");
      setIsRecipesLoading(false);
      setIsSearchLoading(false);
      setRecipesError("");
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setIsRecipesLoading(true);
        setRecipesError("");
        const res = await listRecipesRequest(
          { limit: RECIPES_PAGE_SIZE },
          { signal: controller.signal }
        );
        const items = res.items.map(toRecipeItem);
        if (controller.signal.aborted) return;
        setRecipes(items);
        setSelectedRecipeId((c) => c || items[0]?.id || "");
      } catch (err) {
        if (isAbortError(err)) return;
        setRecipesError(
          err instanceof Error ? err.message : ui.library.loadError
        );
      } finally {
        if (!controller.signal.aborted) setIsRecipesLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isReady, session, ui.library.loadError]);

  // Search
  useEffect(() => {
    if (!isReady || !session) return;

    if (!debouncedSearchQuery) {
      setSearchResults(null);
      setIsSearchLoading(false);
      setRecipesError("");
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setIsSearchLoading(true);
        setRecipesError("");
        setSearchResults(null);
        const res = await listRecipesRequest(
          { q: debouncedSearchQuery, limit: RECIPES_PAGE_SIZE },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setSearchResults(res.items.map(toRecipeItem));
      } catch (err) {
        if (isAbortError(err)) return;
        setSearchResults([]);
        setRecipesError(
          err instanceof Error ? err.message : ui.library.loadError
        );
      } finally {
        if (!controller.signal.aborted) setIsSearchLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedSearchQuery, isReady, session, ui.library.loadError]);

  const filterSearchResults = (recipe: RecipeItem) =>
    matchesRecipeSearchQuery(recipe, debouncedSearchQuery);

  return {
    recipes,
    setRecipes,
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isRecipesLoading,
    isSearchLoading,
    recipesError,
    setRecipesError,
    selectedRecipeId,
    setSelectedRecipeId,
    normalizedSearchQuery,
    isSearchActive,
    libraryRecipes,
    isInitialRecipesLoading,
    isLibrarySearchLoading,
    filterSearchResults
  };
}
