"use client";

import { useEffect, useMemo, useState } from "react";

import type { RecipeDto } from "@/src/apis/@types/recipes";
import {
  createRecipe as createRecipeRequest,
  deleteRecipe as deleteRecipeRequest,
  listRecipes as listRecipesRequest,
  updateRecipe as updateRecipeRequest
} from "@/src/apis/recipes";
import { useAuth } from "@/src/apps/app/auth.provider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

type SourceType = "youtube_shorts" | "instagram_reels" | "other";
type SummarySource = "manual" | "ai";

type Recipe = {
  id: string;
  sourceType: SourceType;
  sourceUrl: string;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
  updatedAtLabel: string;
};

type Screen = "auth" | "list" | "add" | "loading" | "review" | "detail" | "edit";

type RecipeDraft = {
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
};

function inferSourceType(sourceUrl: string): SourceType {
  const normalized = sourceUrl.toLowerCase();
  if (normalized.includes("youtube.com/shorts") || normalized.includes("youtu.be/")) {
    return "youtube_shorts";
  }
  if (normalized.includes("instagram.com/reel") || normalized.includes("instagram.com/reels")) {
    return "instagram_reels";
  }
  return "other";
}

function sourceBadge(sourceType: SourceType) {
  if (sourceType === "youtube_shorts") {
    return "YouTube";
  }
  if (sourceType === "instagram_reels") {
    return "Instagram";
  }
  return "Manual";
}

function toIngredientItems(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
}

function toStepItems(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

function validateDraft(draft: RecipeDraft) {
  const errors: Partial<Record<keyof RecipeDraft, string>> = {};

  if (!draft.sourceUrl.trim()) {
    errors.sourceUrl = "Please add a video URL.";
  }
  if (!draft.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!draft.ingredientsText.trim()) {
    errors.ingredientsText = "Ingredients are required.";
  }
  if (!draft.stepsText.trim()) {
    errors.stepsText = "Steps are required.";
  }

  return errors;
}

function toUpdatedAtLabel(updatedAt: string) {
  return `Updated ${new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function toRecipe(dto: RecipeDto): Recipe {
  return {
    id: dto.id,
    sourceUrl: dto.sourceUrl,
    sourceType: dto.sourceType,
    title: dto.title,
    ingredientsText: dto.ingredientsText,
    stepsText: dto.stepsText,
    summarySource: dto.summarySource,
    updatedAtLabel: toUpdatedAtLabel(dto.updatedAt)
  };
}

export function RecipesHomeContainer() {
  const { isReady, session, signInWithPassword, signOut, signUpWithPassword } = useAuth();
  const [screen, setScreen] = useState<Screen>("auth");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("you@example.com");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [authBusy, setAuthBusy] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [recipesError, setRecipesError] = useState("");
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof RecipeDraft, string>>>({});
  const [toastMessage, setToastMessage] = useState("");
  const [draft, setDraft] = useState<RecipeDraft>({
    sourceUrl: "",
    sourceType: "other",
    title: "",
    ingredientsText: "",
    stepsText: "",
    summarySource: "ai"
  });

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return recipes;
    }
    return recipes.filter((recipe) => recipe.title.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (session) {
      setScreen((current) => (current === "auth" ? "list" : current));
      return;
    }
    setScreen("auth");
  }, [isReady, session]);

  useEffect(() => {
    if (!isReady || !session) {
      setRecipes([]);
      setSelectedRecipeId("");
      return;
    }

    void (async () => {
      try {
        setRecipesError("");
        const response = await listRecipesRequest();
        const items = response.items.map(toRecipe);
        setRecipes(items);
        setSelectedRecipeId((current) => current || items[0]?.id || "");
      } catch (error) {
        setRecipesError(error instanceof Error ? error.message : "Failed to load recipes.");
      }
    })();
  }, [isReady, session]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  const handleAuthSubmit = async () => {
    setAuthError("");
    setAuthNotice("");
    setAuthBusy(true);

    try {
      if (authMode === "sign_up") {
        await signUpWithPassword(authEmail.trim(), authPassword);
        setAuthNotice("Account created. Check your email to confirm sign-up before logging in.");
        setAuthPassword("");
        return;
      }

      await signInWithPassword(authEmail.trim(), authPassword);
      setScreen("list");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthBusy(false);
    }
  };

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
  };

  const fillAiDraft = (sourceUrl: string) => {
    setDraft({
      sourceUrl,
      sourceType: inferSourceType(sourceUrl),
      title: "Spicy Tuna Mayo Rice Bowl",
      ingredientsText:
        "- 1 can tuna (drained)\n- 2 tbsp Japanese mayo\n- 1 tsp sriracha\n- 1 tsp soy sauce\n- 1 cup cooked rice",
      stepsText:
        "1. Mix tuna, mayo, sriracha, and soy sauce.\n2. Add warm rice to a bowl.\n3. Spoon the tuna mixture over the rice.",
      summarySource: "ai"
    });
  };

  const handleGenerate = () => {
    const sourceUrl = addUrl.trim();

    if (!sourceUrl) {
      setUrlError("Please add a video URL.");
      return;
    }
    if (!/^https?:\/\//i.test(sourceUrl)) {
      setUrlError("Enter a valid URL starting with http:// or https://");
      return;
    }

    setUrlError("");
    setScreen("loading");

    window.setTimeout(() => {
      if (sourceUrl.includes("fail")) {
        setScreen("add");
        setUrlError("AI draft failed. Retry or continue manually.");
        return;
      }

      fillAiDraft(sourceUrl);
      setDraftErrors({});
      setScreen("review");
    }, 1200);
  };

  const handleContinueManual = () => {
    const sourceUrl = addUrl.trim();
    setDraft({
      sourceUrl,
      sourceType: inferSourceType(sourceUrl),
      title: "",
      ingredientsText: "",
      stepsText: "",
      summarySource: "manual"
    });
    setDraftErrors({});
    setScreen("review");
  };

  const handleSaveDraft = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const created = await createRecipeRequest({
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });

      const nextRecipe = toRecipe(created);
      setRecipes((current) => [nextRecipe, ...current]);
      setSelectedRecipeId(nextRecipe.id);
      setScreen("detail");
      showToast("Recipe saved");
      resetDraft();
    } catch (error) {
      setDraftErrors((current) => ({
        ...current,
        title: error instanceof Error ? error.message : "Failed to save recipe."
      }));
    }
  };

  const handleSaveEdit = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);

    if (Object.keys(errors).length > 0 || !selectedRecipe) {
      return;
    }

    try {
      const updated = await updateRecipeRequest(selectedRecipe.id, {
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });

      const nextRecipe = toRecipe(updated);
      setRecipes((current) => current.map((recipe) => (recipe.id === selectedRecipe.id ? nextRecipe : recipe)));
      setSelectedRecipeId(nextRecipe.id);
      setScreen("detail");
      showToast("Recipe updated");
    } catch (error) {
      setDraftErrors((current) => ({
        ...current,
        title: error instanceof Error ? error.message : "Failed to update recipe."
      }));
    }
  };

  const openEdit = () => {
    if (!selectedRecipe) {
      return;
    }

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

  const handleDelete = async () => {
    if (!selectedRecipe) {
      return;
    }

    try {
      await deleteRecipeRequest(selectedRecipe.id);
      const remaining = recipes.filter((recipe) => recipe.id !== selectedRecipe.id);
      setRecipes(remaining);
      setSelectedRecipeId(remaining[0]?.id ?? "");
      setShowDeleteModal(false);
      setScreen("list");
      showToast("Recipe deleted");
    } catch (error) {
      setRecipesError(error instanceof Error ? error.message : "Failed to delete recipe.");
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground md:px-6 md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center space-y-6">
        {screen === "auth" ? (
          <Card className="mx-auto max-w-md rounded-2xl p-6 md:p-8">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                ✦
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">PantryClip</h1>
              <p className="text-sm text-muted-foreground">
                {authMode === "sign_in"
                  ? "Sign in to manage your saved recipe clips."
                  : "Create an account to save recipe clips as structured notes."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input className="h-11 rounded-xl" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input className="h-11 rounded-xl" type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} />
              </div>
              <Button className="h-11 w-full" onClick={() => void handleAuthSubmit()} disabled={!isReady || authBusy} type="button">
                {!isReady ? "Loading..." : authBusy ? "Working..." : authMode === "sign_in" ? "Sign in" : "Create account"}
              </Button>
              {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
              {authNotice ? <p className="text-sm text-muted-foreground">{authNotice}</p> : null}
              <Button
                className="h-11 w-full"
                variant="ghost"
                type="button"
                onClick={() => {
                  setAuthMode((current) => (current === "sign_in" ? "sign_up" : "sign_in"));
                  setAuthError("");
                  setAuthNotice("");
                }}
              >
                {authMode === "sign_in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </Card>
        ) : null}

        {screen === "list" ? (
          <Card className="rounded-2xl p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border p-4 md:p-6">
                  <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
                      <p className="text-sm text-muted-foreground">{recipes.length} saved recipes</p>
                    </div>
                    <Button className="h-11" variant="outline" onClick={() => void signOut()} type="button">
                      Sign out
                    </Button>
                  </div>
                  <Button
                    className="h-11 w-full"
                    onClick={() => {
                      resetDraft();
                      setScreen("add");
                    }}
                    type="button"
                  >
                    Add recipe
                  </Button>
                  <Input className="h-11 rounded-xl" placeholder="Search by title" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                    {recipesError ? <p className="text-sm text-destructive">{recipesError}</p> : null}
                  </div>
                </div>

                {recipes.length === 0 ? (
                  <div className="rounded-2xl border border-border p-4 md:p-6">
                  <h2 className="font-semibold">No recipes yet</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Start by adding a recipe link or create one manually.</p>
                  </div>
                ) : null}

                {recipes.length > 0 && filteredRecipes.length === 0 ? (
                  <div className="rounded-2xl border border-border p-4 md:p-6">
                  <h2 className="font-semibold">No matches</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Try a different search term.</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      className={`block w-full rounded-2xl border p-4 md:p-6 text-left transition ${recipe.id === selectedRecipeId ? "border-foreground" : "border-border"}`}
                      onClick={() => {
                        setSelectedRecipeId(recipe.id);
                        setScreen("detail");
                      }}
                      type="button"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">{sourceBadge(recipe.sourceType)}</Badge>
                          <span className="text-xs text-muted-foreground">{recipe.summarySource}</span>
                        </div>
                        <h2 className="font-semibold">{recipe.title}</h2>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.sourceUrl}</p>
                        <p className="text-xs text-muted-foreground">{recipe.updatedAtLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4 md:p-6">
                {selectedRecipe ? (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{sourceBadge(selectedRecipe.sourceType)}</Badge>
                          <span className="text-sm text-muted-foreground">{selectedRecipe.summarySource}</span>
                        </div>
                        <h2 className="text-3xl font-semibold tracking-tight">{selectedRecipe.title}</h2>
                        <p className="text-sm text-muted-foreground">{selectedRecipe.sourceUrl}</p>
                      </div>
                      <div className="flex gap-2">
                    <Button className="h-11" variant="outline" onClick={openEdit} type="button">
                          Edit
                        </Button>
                      <Button className="h-11" variant="destructive" onClick={() => setShowDeleteModal(true)} type="button">
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border p-4 md:p-6">
                        <h3 className="font-semibold">Ingredients</h3>
                        <ul className="mt-3 space-y-2 text-sm">
                          {toIngredientItems(selectedRecipe.ingredientsText).map((ingredient) => (
                            <li key={ingredient}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-border p-4 md:p-6">
                        <h3 className="font-semibold">Steps</h3>
                        <ol className="mt-3 space-y-2 text-sm">
                          {toStepItems(selectedRecipe.stepsText).map((step, index) => (
                            <li key={step}>
                              {index + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Select a recipe to view details.</div>
                )}
              </div>
            </div>
          </Card>
        ) : null}

        {screen === "add" ? (
          <Card className="mx-auto max-w-2xl rounded-2xl p-6 md:p-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Add recipe</h1>
              <p className="text-sm text-muted-foreground">Paste a video link to generate a draft or continue manually.</p>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input className="h-11 rounded-xl" placeholder="https://www.youtube.com/shorts/..." value={addUrl} onChange={(event) => setAddUrl(event.target.value)} />
                {urlError ? <p className="text-sm text-destructive">{urlError}</p> : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-11 flex-1" onClick={handleGenerate} type="button">
                  Generate with AI
                </Button>
                <Button className="h-11 flex-1" variant="outline" onClick={handleContinueManual} type="button">
                  Continue manually
                </Button>
              </div>
              <Button className="h-11" variant="ghost" onClick={() => setScreen("list")} type="button">
                Back to list
              </Button>
            </div>
          </Card>
        ) : null}

        {screen === "loading" ? (
          <Card className="mx-auto max-w-lg rounded-2xl p-6 text-center md:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">Generating draft</h1>
            <p className="mt-2 text-sm text-muted-foreground">Preparing a recipe draft from the link.</p>
          </Card>
        ) : null}

        {(screen === "review" || screen === "edit") && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-2xl p-6 md:p-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">{screen === "review" ? "Review draft" : "Edit recipe"}</h1>
                <p className="text-sm text-muted-foreground">Check the recipe before saving.</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Source URL</Label>
                  <Input
                    className="h-11 rounded-xl"
                    value={draft.sourceUrl}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        sourceUrl: event.target.value,
                        sourceType: inferSourceType(event.target.value)
                      }))
                    }
                  />
                  {draftErrors.sourceUrl ? <p className="text-sm text-destructive">{draftErrors.sourceUrl}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input className="h-11 rounded-xl" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                  {draftErrors.title ? <p className="text-sm text-destructive">{draftErrors.title}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label>Ingredients</Label>
                  <Textarea
                    className="min-h-[180px] rounded-xl"
                    value={draft.ingredientsText}
                    onChange={(event) => setDraft((current) => ({ ...current, ingredientsText: event.target.value }))}
                  />
                  {draftErrors.ingredientsText ? <p className="text-sm text-destructive">{draftErrors.ingredientsText}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label>Steps</Label>
                  <Textarea
                    className="min-h-[220px] rounded-xl"
                    value={draft.stepsText}
                    onChange={(event) => setDraft((current) => ({ ...current, stepsText: event.target.value }))}
                  />
                  {draftErrors.stepsText ? <p className="text-sm text-destructive">{draftErrors.stepsText}</p> : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button className="h-11 flex-1" onClick={() => void (screen === "review" ? handleSaveDraft() : handleSaveEdit())} type="button">
                  {screen === "review" ? "Save recipe" : "Save changes"}
                </Button>
                <Button className="h-11 flex-1" variant="outline" onClick={() => setScreen(screen === "review" ? "add" : "detail")} type="button">
                  Cancel
                </Button>
              </div>
            </Card>

            <div className="rounded-2xl border border-border p-4 md:p-6">
              <h2 className="font-semibold">Preview</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="font-medium">{draft.title || "Untitled recipe"}</p>
                  <p className="mt-1 text-muted-foreground">{draft.sourceUrl || "No source URL"}</p>
                </div>
                <div>
                  <p className="font-medium">Ingredients</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {toIngredientItems(draft.ingredientsText).map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Steps</p>
                  <ol className="mt-2 space-y-1 text-muted-foreground">
                    {toStepItems(draft.stepsText).map((step, index) => (
                      <li key={step}>
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === "detail" && selectedRecipe ? (
          <Card className="rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <Button className="h-11" variant="outline" onClick={() => setScreen("list")} type="button">
                Back
              </Button>
              <div className="flex gap-2">
                <Button className="h-11" variant="outline" onClick={openEdit} type="button">
                  Edit
                </Button>
                <Button className="h-11" variant="destructive" onClick={() => setShowDeleteModal(true)} type="button">
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{sourceBadge(selectedRecipe.sourceType)}</Badge>
                <span className="text-sm text-muted-foreground">{selectedRecipe.updatedAtLabel}</span>
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{selectedRecipe.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{selectedRecipe.sourceUrl}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border p-4 md:p-6">
                  <h2 className="font-semibold">Ingredients</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {toIngredientItems(selectedRecipe.ingredientsText).map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border p-4 md:p-6">
                  <h2 className="font-semibold">Steps</h2>
                  <ol className="mt-3 space-y-2 text-sm">
                    {toStepItems(selectedRecipe.stepsText).map((step, index) => (
                      <li key={step}>
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      {showDeleteModal && selectedRecipe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <Card className="w-full max-w-md rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Delete recipe?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This will remove “{selectedRecipe.title}” from your saved recipes.</p>
            <div className="mt-6 flex gap-3">
              <Button className="h-11 flex-1" variant="outline" onClick={() => setShowDeleteModal(false)} type="button">
                Cancel
              </Button>
              <Button className="h-11 flex-1" variant="destructive" onClick={() => void handleDelete()} type="button">
                Delete
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-background">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}
