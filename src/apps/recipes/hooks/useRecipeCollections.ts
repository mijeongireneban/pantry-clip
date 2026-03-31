"use client";

import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import {
  listRecipeCollectionRecipes as listRecipeCollectionRecipesRequest,
  listRecipeCollections as listRecipeCollectionsRequest
} from "@/src/apis/recipe-collections";
import { toRecipeCollectionSummary, toRecipeItem } from "@/src/apps/recipes/ui.adapters";
import { copy } from "@/src/apps/recipes/ui.constants";
import { isAbortError } from "@/src/apps/recipes/ui.helpers";
import type { Language, RecipeCollectionSummary, RecipeItem } from "@/src/apps/recipes/ui.types";

const SAVED_RECIPES_PAGE_SIZE = 50;

export function useRecipeCollections({
  session,
  isReady,
  language,
  ALL_SAVED_COLLECTION_ID
}: {
  session: Session | null;
  isReady: boolean;
  language: Language;
  ALL_SAVED_COLLECTION_ID: string;
}) {
  const [collections, setCollections] = useState<RecipeCollectionSummary[]>([]);
  const [allSavedRecipesCount, setAllSavedRecipesCount] = useState(0);
  const [defaultCollectionId, setDefaultCollectionId] = useState("");
  const [selectedSavedCollectionId, setSelectedSavedCollectionId] =
    useState<string>(ALL_SAVED_COLLECTION_ID);
  const [savedRecipes, setSavedRecipes] = useState<RecipeItem[] | null>(null);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
  const [isSavedRecipesLoading, setIsSavedRecipesLoading] = useState(false);
  const [savedError, setSavedError] = useState("");

  const ui = copy[language];

  const refreshCollections = async () => {
    const res = await listRecipeCollectionsRequest();
    setCollections(res.items.map(toRecipeCollectionSummary));
    setAllSavedRecipesCount(res.allRecipesCount);
    setDefaultCollectionId(res.defaultCollectionId);
    setSelectedSavedCollectionId((currentCollectionId) => {
      if (currentCollectionId === ALL_SAVED_COLLECTION_ID) return currentCollectionId;
      return res.items.some((c) => c.id === currentCollectionId)
        ? currentCollectionId
        : ALL_SAVED_COLLECTION_ID;
    });
  };

  const refreshSavedRecipes = async (
    collectionId = selectedSavedCollectionId
  ) => {
    const res = await listRecipeCollectionRecipesRequest({
      collectionId:
        collectionId === ALL_SAVED_COLLECTION_ID ? undefined : collectionId,
      limit: SAVED_RECIPES_PAGE_SIZE
    });
    setSavedRecipes(res.items.map(toRecipeItem));
  };

  // Reset on sign-out, load collections on sign-in
  useEffect(() => {
    if (!isReady || !session) {
      setCollections([]);
      setAllSavedRecipesCount(0);
      setDefaultCollectionId("");
      setSelectedSavedCollectionId(ALL_SAVED_COLLECTION_ID);
      setSavedRecipes(null);
      setIsCollectionsLoading(false);
      setIsSavedRecipesLoading(false);
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setIsCollectionsLoading(true);
        setSavedError("");
        const res = await listRecipeCollectionsRequest({
          signal: controller.signal
        });
        if (controller.signal.aborted) return;
        setCollections(res.items.map(toRecipeCollectionSummary));
        setAllSavedRecipesCount(res.allRecipesCount);
        setDefaultCollectionId(res.defaultCollectionId);
        setSelectedSavedCollectionId((currentCollectionId) => {
          if (currentCollectionId === ALL_SAVED_COLLECTION_ID)
            return currentCollectionId;
          return res.items.some((c) => c.id === currentCollectionId)
            ? currentCollectionId
            : ALL_SAVED_COLLECTION_ID;
        });
      } catch (err) {
        if (isAbortError(err)) return;
        setSavedError(
          err instanceof Error ? err.message : ui.library.loadError
        );
      } finally {
        if (!controller.signal.aborted) setIsCollectionsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [ALL_SAVED_COLLECTION_ID, isReady, session, ui.library.loadError]);

  // Load saved recipes when selected collection changes
  useEffect(() => {
    if (!isReady || !session) return;

    const controller = new AbortController();

    void (async () => {
      try {
        setIsSavedRecipesLoading(true);
        setSavedError("");
        setSavedRecipes(null);
        const res = await listRecipeCollectionRecipesRequest(
          {
            collectionId:
              selectedSavedCollectionId === ALL_SAVED_COLLECTION_ID
                ? undefined
                : selectedSavedCollectionId,
            limit: SAVED_RECIPES_PAGE_SIZE
          },
          { signal: controller.signal }
        );
        if (controller.signal.aborted) return;
        setSavedRecipes(res.items.map(toRecipeItem));
      } catch (err) {
        if (isAbortError(err)) return;
        setSavedRecipes([]);
        setSavedError(
          err instanceof Error ? err.message : ui.library.loadError
        );
      } finally {
        if (!controller.signal.aborted) setIsSavedRecipesLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    ALL_SAVED_COLLECTION_ID,
    isReady,
    selectedSavedCollectionId,
    session,
    ui.library.loadError
  ]);

  return {
    collections,
    setCollections,
    allSavedRecipesCount,
    setAllSavedRecipesCount,
    defaultCollectionId,
    setDefaultCollectionId,
    selectedSavedCollectionId,
    setSelectedSavedCollectionId,
    savedRecipes,
    setSavedRecipes,
    isCollectionsLoading,
    isSavedRecipesLoading,
    savedError,
    setSavedError,
    refreshCollections,
    refreshSavedRecipes
  };
}
