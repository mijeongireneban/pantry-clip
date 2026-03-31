"use client";

import { useMemo, useState } from "react";

import {
  createRecipe as createRecipeRequest,
  createSummarizeJob as createSummarizeJobRequest,
  deleteRecipe as deleteRecipeRequest,
  getSummarizeJob as getSummarizeJobRequest,
  saveRecipeUrl as saveRecipeUrlRequest,
  toggleSaveRecipe as toggleSaveRecipeRequest,
  updateRecipe as updateRecipeRequest
} from "@/src/apis/recipes";
import {
  createRecipeCollection as createRecipeCollectionRequest,
  deleteRecipeCollection as deleteRecipeCollectionRequest,
  setRecipeCollections as setRecipeCollectionsRequest,
  updateRecipeCollection as updateRecipeCollectionRequest
} from "@/src/apis/recipe-collections";
import { useAuth } from "@/src/apps/app/auth.provider";
import { useTheme } from "@/src/apps/app/theme.provider";
import { IcBook } from "@/src/apps/recipes/icons";
import { BottomNav } from "@/src/apps/recipes/components/BottomNav";
import { useLanguage } from "@/src/apps/recipes/hooks/useLanguage";
import { useRecipeLibrary } from "@/src/apps/recipes/hooks/useRecipeLibrary";
import { useRecipeCollections } from "@/src/apps/recipes/hooks/useRecipeCollections";
import { AuthScreen } from "@/src/apps/recipes/screens/AuthScreen";
import { LibraryScreen } from "@/src/apps/recipes/screens/LibraryScreen";
import { AddRecipeScreen } from "@/src/apps/recipes/screens/AddRecipeScreen";
import { ManualEntryScreen } from "@/src/apps/recipes/screens/ManualEntryScreen";
import { EditScreen } from "@/src/apps/recipes/screens/EditScreen";
import { DetailScreen } from "@/src/apps/recipes/screens/DetailScreen";
import { SavedScreen } from "@/src/apps/recipes/screens/SavedScreen";
import { ProfileScreen } from "@/src/apps/recipes/screens/ProfileScreen";
import { DeleteRecipeModal } from "@/src/apps/recipes/modals/DeleteRecipeModal";
import { CollectionModal } from "@/src/apps/recipes/modals/CollectionModal";
import { EditCollectionsModal } from "@/src/apps/recipes/modals/EditCollectionsModal";
import { ManageRecipeCollectionsModal } from "@/src/apps/recipes/modals/ManageRecipeCollectionsModal";
import { DeleteCollectionModal } from "@/src/apps/recipes/modals/DeleteCollectionModal";
import { toRecipeItem } from "@/src/apps/recipes/ui.adapters";
import { copy } from "@/src/apps/recipes/ui.constants";
import {
  inferSourceType,
  isAbortError,
  matchesRecipeSearchQuery,
  removeRecipeFromList,
  sleep,
  upsertRecipeInList,
  validateDraft
} from "@/src/apps/recipes/ui.helpers";
import type { SummarizeJobStatus } from "@/src/apps/recipes/recipes.types";
import type {
  Language,
  RecipeCollectionSummary,
  RecipeDraft,
  RecipeItem,
  Screen,
  Tab
} from "@/src/apps/recipes/ui.types";

const ALL_SAVED_COLLECTION_ID = "all";

export function RecipesHomeContainer() {
  const { isReady, session, signInWithPassword, signOut, signUpWithPassword } =
    useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [screen, setScreen] = useState<Screen>("auth");

  // ─── Auth form state ──────────────────────────────────────────────────────
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Recipe library ───────────────────────────────────────────────────────
  const library = useRecipeLibrary({ session, isReady, language });

  // ─── Collections ──────────────────────────────────────────────────────────
  const collections = useRecipeCollections({
    session,
    isReady,
    language,
    ALL_SAVED_COLLECTION_ID
  });

  // ─── Draft state ──────────────────────────────────────────────────────────
  const [addUrl, setAddUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingUrlOnly, setIsSavingUrlOnly] = useState(false);
  const [summarizeJobStatus, setSummarizeJobStatus] =
    useState<SummarizeJobStatus | null>(null);
  const [draft, setDraft] = useState<RecipeDraft>({
    sourceUrl: "",
    sourceType: "other",
    title: "",
    ingredientsText: "",
    stepsText: "",
    summarySource: "ai"
  });
  const [draftErrors, setDraftErrors] = useState<
    Partial<Record<keyof RecipeDraft, string>>
  >({});

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] =
    useState(false);
  const [showEditCollectionsModal, setShowEditCollectionsModal] =
    useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [collectionModalMode, setCollectionModalMode] = useState<
    "create" | "rename"
  >("create");
  const [editingCollection, setEditingCollection] =
    useState<RecipeCollectionSummary | null>(null);
  const [pendingDeleteCollection, setPendingDeleteCollection] =
    useState<RecipeCollectionSummary | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSelection, setCollectionSelection] = useState<string[]>([]);
  const [collectionError, setCollectionError] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState("");

  // ─── Derived ─────────────────────────────────────────────────────────────
  const ui = copy[language];
  const hasDraft = draft.sourceUrl.trim() !== "";

  const selectedRecipe = useMemo(
    () =>
      collections.savedRecipes?.find(
        (r) => r.id === library.selectedRecipeId
      ) ??
      library.searchResults?.find((r) => r.id === library.selectedRecipeId) ??
      library.recipes.find((r) => r.id === library.selectedRecipeId) ??
      null,
    [
      collections.savedRecipes,
      library.recipes,
      library.searchResults,
      library.selectedRecipeId
    ]
  );

  const savedCollectionRecipes = collections.savedRecipes ?? [];

  const isSavedEmpty =
    !collections.isSavedRecipesLoading &&
    !collections.savedError &&
    savedCollectionRecipes.length === 0 &&
    collections.collections.length > 0;

  const activeTab = useMemo<Tab>(() => {
    if (["list", "detail", "edit"].includes(screen)) return "library";
    if (["add", "review"].includes(screen)) return "add";
    if (screen === "scrap") return "scrap";
    if (screen === "profile") return "profile";
    return "library";
  }, [screen]);

  const matchesSavedCollectionFilter = (recipe: RecipeItem) => {
    if (collections.selectedSavedCollectionId === ALL_SAVED_COLLECTION_ID) {
      return recipe.isSaved;
    }
    return recipe.collectionIds.includes(
      collections.selectedSavedCollectionId
    );
  };

  // ─── Cross-list recipe state mutations ───────────────────────────────────

  const upsertRecipeCollections = (
    nextRecipe: RecipeItem,
    options?: { insertIntoBase?: boolean }
  ) => {
    library.setRecipes((current) => {
      const exists = current.some((r) => r.id === nextRecipe.id);
      if (!exists && !options?.insertIntoBase) return current;
      return upsertRecipeInList(current, nextRecipe);
    });
    library.setSearchResults((current) => {
      if (current === null) return current;
      if (!matchesRecipeSearchQuery(nextRecipe, library.debouncedSearchQuery)) {
        return removeRecipeFromList(current, nextRecipe.id);
      }
      return upsertRecipeInList(current, nextRecipe);
    });
    collections.setSavedRecipes((current) => {
      if (current === null) return current;
      if (!matchesSavedCollectionFilter(nextRecipe)) {
        return removeRecipeFromList(current, nextRecipe.id);
      }
      return upsertRecipeInList(current, nextRecipe);
    });
  };

  const removeRecipeCollections = (recipeId: string) => {
    library.setRecipes((current) => removeRecipeFromList(current, recipeId));
    library.setSearchResults((current) =>
      current === null ? current : removeRecipeFromList(current, recipeId)
    );
    collections.setSavedRecipes((current) =>
      current === null ? current : removeRecipeFromList(current, recipeId)
    );
  };

  const removeCollectionFromLoadedRecipes = (collectionId: string) => {
    const patch = (recipe: RecipeItem) => {
      if (!recipe.collectionIds.includes(collectionId)) return recipe;
      const nextIds = recipe.collectionIds.filter((id) => id !== collectionId);
      return { ...recipe, collectionIds: nextIds, isSaved: nextIds.length > 0 };
    };

    library.setRecipes((current) => current.map(patch));
    library.setSearchResults((current) =>
      current === null ? current : current.map(patch)
    );
    collections.setSavedRecipes((current) =>
      current === null
        ? current
        : current.map(patch).filter(matchesSavedCollectionFilter)
    );
    setCollectionSelection((current) =>
      current.filter((id) => id !== collectionId)
    );
  };

  // ─── Toast helper ─────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(""), 2400);
  };

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const openLibraryForRecipe = (recipeId: string) => {
    library.setSearchQuery("");
    library.setSearchResults(null);
    library.setSelectedRecipeId(recipeId);
    setScreen("list");
  };

  const openCollectionsModal = () => {
    if (!selectedRecipe) return;
    setCollectionSelection(selectedRecipe.collectionIds);
    setCollectionError("");
    setShowCollectionsModal(true);
  };

  // ─── Draft helpers ────────────────────────────────────────────────────────

  const resetDraft = () => {
    setDraft({
      sourceUrl: "",
      sourceType: "other",
      title: "",
      ingredientsText: "",
      stepsText: "",
      summarySource: "manual"
    });
    setDraftErrors({});
    setAddUrl("");
    setUrlError("");
    setSummarizeJobStatus(null);
  };

  const openManualDraft = (sourceUrl: string) => {
    setDraft({
      sourceUrl,
      sourceType: inferSourceType(sourceUrl),
      title: "",
      ingredientsText: "",
      stepsText: "",
      summarySource: "manual"
    });
    setDraftErrors({});
  };

  // ─── Auth handler ─────────────────────────────────────────────────────────

  const handleAuthSubmit = async () => {
    setAuthError("");
    setAuthNotice("");
    setAuthBusy(true);
    try {
      if (authMode === "sign_up") {
        await signUpWithPassword(authEmail.trim(), authPassword);
        setAuthNotice(ui.auth.signUpNotice);
        setAuthPassword("");
        return;
      }
      await signInWithPassword(authEmail.trim(), authPassword);
      setScreen("list");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : ui.auth.authFailed);
    } finally {
      setAuthBusy(false);
    }
  };

  // ─── AI generation handler ────────────────────────────────────────────────

  const handleGenerate = async () => {
    const sourceUrl = addUrl.trim();
    if (!sourceUrl) {
      setUrlError(ui.add.urlRequired);
      return;
    }
    if (!/^https?:\/\//i.test(sourceUrl)) {
      setUrlError(ui.add.urlProtocol);
      return;
    }
    if (inferSourceType(sourceUrl) !== "youtube_shorts") {
      setUrlError(ui.add.aiOnlySupport);
      openManualDraft(sourceUrl);
      return;
    }

    setUrlError("");
    setIsGenerating(true);
    setSummarizeJobStatus("queued");

    try {
      const handle = await createSummarizeJobRequest({ sourceUrl });
      let nextStatus = handle.status;
      let polls = 0;

      while (polls < 15) {
        await sleep(polls < 10 ? 2000 : 4000);
        const job = await getSummarizeJobRequest(handle.jobId);
        nextStatus = job.status;
        setSummarizeJobStatus(job.status);

        if (job.status === "completed" && job.draft) {
          setDraft({
            sourceUrl,
            sourceType: job.sourceType,
            title: job.draft.titleDraft,
            ingredientsText: job.draft.ingredientsDraft,
            stepsText: job.draft.stepsDraft,
            summarySource: "ai"
          });
          setDraftErrors({});
          return;
        }

        if (job.status === "insufficient_context") {
          setUrlError(job.error?.message ?? ui.add.insufficientContext);
          openManualDraft(sourceUrl);
          return;
        }

        if (job.status === "failed") {
          setUrlError(job.error?.message ?? ui.add.aiFailed);
          openManualDraft(sourceUrl);
          return;
        }

        polls += 1;
      }

      setUrlError(
        nextStatus === "queued" ||
          nextStatus === "extracting" ||
          nextStatus === "summarizing"
          ? ui.add.delayed
          : ui.add.aiFailed
      );
      openManualDraft(sourceUrl);
    } catch (err) {
      if (!isAbortError(err)) {
        setUrlError(err instanceof Error ? err.message : ui.add.aiFailed);
        openManualDraft(sourceUrl);
      }
    } finally {
      setIsGenerating(false);
      setSummarizeJobStatus(null);
    }
  };

  // ─── Save URL only ────────────────────────────────────────────────────────

  const handleSaveUrlOnly = async () => {
    const sourceUrl = addUrl.trim();
    if (!sourceUrl) {
      setUrlError(ui.add.urlRequired);
      return;
    }
    if (!/^https?:\/\//i.test(sourceUrl)) {
      setUrlError(ui.add.urlProtocol);
      return;
    }

    setUrlError("");
    setIsSavingUrlOnly(true);

    try {
      const created = await saveRecipeUrlRequest({
        sourceUrl,
        title:
          draft.sourceUrl.trim() === sourceUrl
            ? draft.title.trim() || undefined
            : undefined,
        language
      });
      const next = toRecipeItem(created);
      upsertRecipeCollections(next, { insertIntoBase: true });
      resetDraft();
      openLibraryForRecipe(next.id);
      showToast(ui.add.saveUrlOnlySuccess);
    } catch (err) {
      setUrlError(
        err instanceof Error ? err.message : ui.add.saveUrlOnlyFailed
      );
    } finally {
      setIsSavingUrlOnly(false);
    }
  };

  // ─── Save draft (AI or manual) ────────────────────────────────────────────

  const handleSaveDraft = async () => {
    const errors = validateDraft(draft, language);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const created = await createRecipeRequest({
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });
      const next = toRecipeItem(created);
      upsertRecipeCollections(next, { insertIntoBase: true });
      resetDraft();
      openLibraryForRecipe(next.id);
      showToast(ui.actions.recipeSaved);
    } catch (err) {
      setDraftErrors((c) => ({
        ...c,
        title: err instanceof Error ? err.message : ui.actions.saveFailed
      }));
    }
  };

  // ─── Save edit ────────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    const errors = validateDraft(draft, language);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0 || !selectedRecipe) return;
    try {
      const updated = await updateRecipeRequest(selectedRecipe.id, {
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });
      const next = toRecipeItem(updated);
      upsertRecipeCollections(next);
      library.setSelectedRecipeId(next.id);
      setScreen("detail");
      showToast(ui.edit.success);
    } catch (err) {
      setDraftErrors((c) => ({
        ...c,
        title: err instanceof Error ? err.message : ui.edit.failure
      }));
    }
  };

  // ─── Toggle save ──────────────────────────────────────────────────────────

  const handleToggleSave = async () => {
    if (!selectedRecipe) return;
    const next = !selectedRecipe.isSaved;
    const optimisticRecipe = {
      ...selectedRecipe,
      isSaved: next,
      collectionIds: next
        ? selectedRecipe.collectionIds.length > 0
          ? selectedRecipe.collectionIds
          : collections.defaultCollectionId
            ? [collections.defaultCollectionId]
            : []
        : []
    };
    upsertRecipeCollections(optimisticRecipe);
    try {
      const updated = await toggleSaveRecipeRequest(selectedRecipe.id, next);
      const nextRecipe = toRecipeItem(updated);
      upsertRecipeCollections(nextRecipe);
      await collections.refreshCollections();
      await collections.refreshSavedRecipes();
      showToast(next ? ui.actions.savedOn : ui.actions.unsaved);
    } catch {
      upsertRecipeCollections(selectedRecipe);
    }
  };

  // ─── Open edit ────────────────────────────────────────────────────────────

  const openEdit = () => {
    if (!selectedRecipe) return;
    setDraft({
      sourceUrl: selectedRecipe.sourceUrl,
      sourceType: selectedRecipe.sourceType,
      title: selectedRecipe.title,
      ingredientsText: selectedRecipe.ingredientsText,
      stepsText: selectedRecipe.stepsText,
      summarySource: selectedRecipe.summarySource
    });
    setDraftErrors({});
    setScreen("edit");
  };

  // ─── Delete recipe ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    try {
      await deleteRecipeRequest(selectedRecipe.id);
      const remaining = removeRecipeFromList(library.recipes, selectedRecipe.id);
      removeRecipeCollections(selectedRecipe.id);
      await collections.refreshCollections();
      await collections.refreshSavedRecipes();
      library.setSelectedRecipeId(remaining[0]?.id ?? "");
      setShowDeleteModal(false);
      setScreen("list");
      showToast(ui.actions.deleted);
    } catch (err) {
      library.setRecipesError(
        err instanceof Error ? err.message : ui.actions.deleteFailed
      );
      setShowDeleteModal(false);
    }
  };

  // ─── Collection CRUD ──────────────────────────────────────────────────────

  const openCreateCollectionModal = () => {
    setCollectionModalMode("create");
    setEditingCollection(null);
    setCollectionName("");
    setCollectionError("");
    setShowEditCollectionsModal(false);
    setPendingDeleteCollection(null);
    setShowCreateCollectionModal(true);
  };

  const openRenameCollectionModal = (collection: RecipeCollectionSummary) => {
    setCollectionModalMode("rename");
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setCollectionError("");
    setShowEditCollectionsModal(false);
    setShowCreateCollectionModal(true);
  };

  const handleSubmitCollection = async () => {
    const trimmedName = collectionName.trim();
    if (!trimmedName) {
      setCollectionError(
        language === "ko"
          ? "컬렉션 이름을 입력해주세요."
          : "Please enter a collection name."
      );
      return;
    }

    setCollectionError("");
    setIsCreatingCollection(true);

    try {
      if (collectionModalMode === "rename" && editingCollection) {
        await updateRecipeCollectionRequest(editingCollection.id, {
          name: trimmedName
        });
        await collections.refreshCollections();
        setCollectionName("");
        setEditingCollection(null);
        setShowCreateCollectionModal(false);
        showToast(ui.actions.collectionRenamed);
        return;
      }

      const created = await createRecipeCollectionRequest({ name: trimmedName });
      await collections.refreshCollections();
      setCollectionName("");
      setShowCreateCollectionModal(false);
      collections.setSelectedSavedCollectionId(created.id);
      showToast(ui.actions.collectionCreated);
    } catch (err) {
      setCollectionError(
        err instanceof Error ? err.message : ui.actions.saveFailed
      );
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!pendingDeleteCollection) return;

    setCollectionError("");
    setIsDeletingCollection(true);

    try {
      await deleteRecipeCollectionRequest(pendingDeleteCollection.id);
      const nextCollectionId =
        collections.selectedSavedCollectionId === pendingDeleteCollection.id
          ? ALL_SAVED_COLLECTION_ID
          : collections.selectedSavedCollectionId;

      removeCollectionFromLoadedRecipes(pendingDeleteCollection.id);
      setPendingDeleteCollection(null);
      collections.setSelectedSavedCollectionId(nextCollectionId);
      await collections.refreshCollections();
      await collections.refreshSavedRecipes(nextCollectionId);
      showToast(ui.actions.collectionDeleted);
    } catch (err) {
      setCollectionError(
        err instanceof Error ? err.message : ui.actions.deleteFailed
      );
    } finally {
      setIsDeletingCollection(false);
    }
  };

  const handleSaveRecipeCollections = async () => {
    if (!selectedRecipe) return;

    setCollectionError("");
    setIsUpdatingCollections(true);

    try {
      const updated = await setRecipeCollectionsRequest(selectedRecipe.id, {
        collectionIds: collectionSelection
      });
      const nextRecipe = toRecipeItem(updated);
      upsertRecipeCollections(nextRecipe);
      await collections.refreshCollections();
      await collections.refreshSavedRecipes();
      library.setSelectedRecipeId(nextRecipe.id);
      setShowCollectionsModal(false);
      showToast(
        nextRecipe.isSaved ? ui.actions.collectionsUpdated : ui.actions.unsaved
      );
    } catch (err) {
      setCollectionError(
        err instanceof Error ? err.message : ui.actions.saveFailed
      );
    } finally {
      setIsUpdatingCollections(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/60">
        <div className="flex flex-col items-center gap-3">
          <IcBook className="h-8 w-8 text-primary" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-muted/60">
      <div className="relative flex h-screen w-full max-w-[390px] flex-col overflow-hidden rounded-[28px] bg-background shadow-2xl">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {screen === "auth" && (
            <AuthScreen
              language={language}
              ui={ui}
              isReady={isReady}
              authMode={authMode}
              authEmail={authEmail}
              authPassword={authPassword}
              authError={authError}
              authNotice={authNotice}
              authBusy={authBusy}
              showPassword={showPassword}
              setAuthEmail={setAuthEmail}
              setAuthPassword={setAuthPassword}
              setShowPassword={setShowPassword}
              setAuthMode={setAuthMode}
              setAuthError={setAuthError}
              setAuthNotice={setAuthNotice}
              onSubmit={() => void handleAuthSubmit()}
            />
          )}

          {screen === "list" && (
            <LibraryScreen
              language={language}
              ui={ui}
              recipes={library.recipes}
              libraryRecipes={library.libraryRecipes}
              searchQuery={library.searchQuery}
              isSearchActive={library.isSearchActive}
              isInitialRecipesLoading={library.isInitialRecipesLoading}
              isLibrarySearchLoading={library.isLibrarySearchLoading}
              recipesError={library.recipesError}
              setSearchQuery={library.setSearchQuery}
              onAddRecipe={() => {
                resetDraft();
                setScreen("add");
              }}
              onSelectRecipe={(id) => {
                library.setSelectedRecipeId(id);
                setScreen("detail");
              }}
            />
          )}

          {screen === "add" && (
            <AddRecipeScreen
              language={language}
              ui={ui}
              addUrl={addUrl}
              urlError={urlError}
              isGenerating={isGenerating}
              isSavingUrlOnly={isSavingUrlOnly}
              summarizeJobStatus={summarizeJobStatus}
              hasDraft={hasDraft}
              draft={draft}
              draftErrors={draftErrors}
              setAddUrl={setAddUrl}
              setDraft={setDraft}
              onGenerate={() => void handleGenerate()}
              onSaveUrlOnly={() => void handleSaveUrlOnly()}
              onSaveAiDraft={() => void handleSaveDraft()}
              onCancelDraft={resetDraft}
            />
          )}

          {screen === "review" && (
            <ManualEntryScreen
              language={language}
              ui={ui}
              draft={draft}
              draftErrors={draftErrors}
              setDraft={setDraft}
              onSave={() => void handleSaveDraft()}
              onBack={() => setScreen("add")}
            />
          )}

          {screen === "edit" && (
            <EditScreen
              language={language}
              ui={ui}
              draft={draft}
              draftErrors={draftErrors}
              setDraft={setDraft}
              onSave={() => void handleSaveEdit()}
              onBack={() => setScreen("detail")}
            />
          )}

          {screen === "detail" && selectedRecipe && (
            <DetailScreen
              language={language}
              ui={ui}
              recipe={selectedRecipe}
              onBack={() => setScreen("list")}
              onToggleSave={() => void handleToggleSave()}
              onOpenCollections={openCollectionsModal}
              onEdit={openEdit}
              onDelete={() => setShowDeleteModal(true)}
            />
          )}

          {screen === "scrap" && (
            <SavedScreen
              language={language}
              ui={ui}
              collections={collections.collections}
              allSavedRecipesCount={collections.allSavedRecipesCount}
              selectedSavedCollectionId={collections.selectedSavedCollectionId}
              savedCollectionRecipes={savedCollectionRecipes}
              isCollectionsLoading={collections.isCollectionsLoading}
              isSavedRecipesLoading={collections.isSavedRecipesLoading}
              isSavedEmpty={isSavedEmpty}
              savedError={collections.savedError}
              ALL_SAVED_COLLECTION_ID={ALL_SAVED_COLLECTION_ID}
              setSelectedSavedCollectionId={
                collections.setSelectedSavedCollectionId
              }
              onSelectRecipe={(id) => {
                library.setSelectedRecipeId(id);
                setScreen("detail");
              }}
              onCreateCollection={openCreateCollectionModal}
              onManageCollections={() => {
                setCollectionError("");
                setShowEditCollectionsModal(true);
              }}
            />
          )}

          {screen === "profile" && (
            <ProfileScreen
              language={language}
              ui={ui}
              session={session}
              theme={theme}
              allSavedRecipesCount={collections.allSavedRecipesCount}
              setLanguage={setLanguage}
              setTheme={setTheme}
              onSignOut={() => void signOut()}
            />
          )}
        </div>

        {!!session && screen !== "auth" && (
          <BottomNav
            activeTab={activeTab}
            language={language}
            onLibrary={() => setScreen("list")}
            onAdd={() => {
              resetDraft();
              setScreen("add");
            }}
            onScrap={() => setScreen("scrap")}
            onProfile={() => setScreen("profile")}
          />
        )}

        {showDeleteModal && selectedRecipe && (
          <DeleteRecipeModal
            ui={ui}
            recipe={selectedRecipe}
            onConfirm={() => void handleDelete()}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {showCreateCollectionModal && (
          <CollectionModal
            ui={ui}
            mode={collectionModalMode}
            collectionName={collectionName}
            collectionError={collectionError}
            isSubmitting={isCreatingCollection}
            setCollectionName={setCollectionName}
            onConfirm={() => void handleSubmitCollection()}
            onCancel={() => {
              setShowCreateCollectionModal(false);
              setEditingCollection(null);
              setCollectionError("");
            }}
          />
        )}

        {showEditCollectionsModal && (
          <EditCollectionsModal
            ui={ui}
            collections={collections.collections}
            collectionError={collectionError}
            onRename={openRenameCollectionModal}
            onDelete={(collection) => {
              setCollectionError("");
              setPendingDeleteCollection(collection);
              setShowEditCollectionsModal(false);
            }}
            onCreateCollection={openCreateCollectionModal}
            onClose={() => {
              setShowEditCollectionsModal(false);
              setCollectionError("");
            }}
          />
        )}

        {showCollectionsModal && selectedRecipe && (
          <ManageRecipeCollectionsModal
            ui={ui}
            collections={collections.collections}
            collectionSelection={collectionSelection}
            collectionError={collectionError}
            isUpdating={isUpdatingCollections}
            setCollectionSelection={setCollectionSelection}
            onSave={() => void handleSaveRecipeCollections()}
            onClose={() => setShowCollectionsModal(false)}
          />
        )}

        {pendingDeleteCollection && (
          <DeleteCollectionModal
            ui={ui}
            collection={pendingDeleteCollection}
            collectionError={collectionError}
            isDeleting={isDeletingCollection}
            onConfirm={() => void handleDeleteCollection()}
            onCancel={() => {
              setPendingDeleteCollection(null);
              setCollectionError("");
            }}
          />
        )}

        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
