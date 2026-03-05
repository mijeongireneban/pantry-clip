"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
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

type Screen =
  | "auth"
  | "list"
  | "add"
  | "loading"
  | "review"
  | "detail"
  | "edit";

type RecipeDraft = {
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
};

const MOCK_RECIPES: Recipe[] = [
  {
    id: "r1",
    sourceType: "youtube_shorts",
    sourceUrl: "https://youtube.com/shorts/abc123",
    title: "Spicy Tuna Mayo Rice Bowl",
    ingredientsText:
      "- 1 can tuna (drained)\n- 2 tbsp Japanese mayo\n- 1 tsp sriracha\n- 1 tsp soy sauce\n- 1 cup cooked short-grain rice\n- 1 tsp sesame oil\n- 2 sheets nori, torn\n- 1 tsp toasted sesame seeds\n- Sliced green onions",
    stepsText:
      "1. Drain tuna and mix with mayo, sriracha, and soy sauce.\n2. Scoop warm rice into a bowl and drizzle sesame oil.\n3. Spoon tuna mayo mix on top.\n4. Add torn nori around the bowl.\n5. Finish with sesame seeds and green onions.",
    summarySource: "ai",
    updatedAtLabel: "Updated Feb 28, 2026"
  },
  {
    id: "r2",
    sourceType: "instagram_reels",
    sourceUrl: "https://instagram.com/reel/xyz456",
    title: "10-Minute Soy Butter Udon",
    ingredientsText: "- Udon\n- Soy sauce\n- Butter\n- Garlic",
    stepsText: "1. Boil udon.\n2. Melt butter and cook garlic.\n3. Add soy sauce and toss noodles.",
    summarySource: "manual",
    updatedAtLabel: "Updated Feb 25, 2026"
  },
  {
    id: "r3",
    sourceType: "other",
    sourceUrl: "https://example.com/recipe",
    title: "Crispy Tofu Gochujang Stir-fry",
    ingredientsText: "- Tofu\n- Gochujang\n- Soy sauce\n- Sesame oil",
    stepsText: "1. Pan-fry tofu.\n2. Mix sauce.\n3. Toss and reduce.",
    summarySource: "manual",
    updatedAtLabel: "Updated Feb 20, 2026"
  }
];

function inferSourceType(sourceUrl: string): SourceType {
  const normalized = sourceUrl.toLowerCase();
  if (normalized.includes("youtube.com/shorts") || normalized.includes("youtu.be/")) {
    return "youtube_shorts";
  }
  if (normalized.includes("instagram.com/reel")) {
    return "instagram_reels";
  }
  return "other";
}

function sourceBadge(sourceType: SourceType) {
  if (sourceType === "youtube_shorts") {
    return { label: "YouTube", className: "bg-red-100 text-red-700" };
  }
  if (sourceType === "instagram_reels") {
    return { label: "Instagram", className: "bg-pink-100 text-pink-700" };
  }
  return { label: "Manual", className: "bg-stone-200 text-stone-700" };
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

export function RecipesHomeContainer() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(MOCK_RECIPES[0]?.id ?? "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("you@example.com");
  const [authPassword, setAuthPassword] = useState("••••••");
  const [addUrl, setAddUrl] = useState("");
  const [urlError, setUrlError] = useState("");
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

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  const goToDetail = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setScreen("detail");
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
        "- 1 can tuna (drained)\n- 2 tbsp Japanese mayo\n- 1 tsp sriracha\n- 1 tsp soy sauce\n- 1 cup cooked short-grain rice",
      stepsText:
        "1. Mix tuna, mayo, sriracha, and soy sauce.\n2. Add warm rice to a bowl.\n3. Top with tuna mixture and serve.",
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
      const shouldFail = sourceUrl.includes("fail");
      if (shouldFail) {
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

  const handleSaveDraft = () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const newRecipe: Recipe = {
      id: `r${Date.now()}`,
      sourceUrl: draft.sourceUrl.trim(),
      sourceType: draft.sourceType,
      title: draft.title.trim(),
      ingredientsText: draft.ingredientsText.trim(),
      stepsText: draft.stepsText.trim(),
      summarySource: draft.summarySource,
      updatedAtLabel: "Updated just now"
    };

    setRecipes((current) => [newRecipe, ...current]);
    setSelectedRecipeId(newRecipe.id);
    setScreen("detail");
    showToast("Recipe saved");
    resetDraft();
  };

  const handleSaveEdit = () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);

    if (Object.keys(errors).length > 0 || !selectedRecipe) {
      return;
    }

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              sourceUrl: draft.sourceUrl.trim(),
              sourceType: draft.sourceType,
              title: draft.title.trim(),
              ingredientsText: draft.ingredientsText.trim(),
              stepsText: draft.stepsText.trim(),
              summarySource: draft.summarySource,
              updatedAtLabel: "Updated just now"
            }
          : recipe
      )
    );
    setScreen("detail");
    showToast("Recipe updated");
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

  const handleDelete = () => {
    if (!selectedRecipe) {
      return;
    }

    setRecipes((current) => current.filter((recipe) => recipe.id !== selectedRecipe.id));
    setShowDeleteModal(false);
    setScreen("list");
    showToast("Recipe deleted");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_15%,color-mix(in_oklch,var(--secondary)_18%,transparent),transparent_38%),radial-gradient(circle_at_85%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_42%),var(--background)] px-4 py-8 text-foreground md:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-80px] top-20 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute right-[-90px] top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {screen === "auth" ? (
          <Card className="mx-auto mt-8 max-w-md rounded-3xl border-border/70 bg-card/95 p-6 shadow-[0_8px_28px_-16px_var(--foreground)] backdrop-blur md:mt-12">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
                🍴
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">PantryClip</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Turn recipe videos into your personal cookbook.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  className="h-12 rounded-2xl bg-muted/40 px-4 text-base"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  className="h-12 rounded-2xl bg-muted/40 px-4 text-base"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  type="password"
                />
              </div>
              <Button
                className="h-12 w-full rounded-2xl text-base font-semibold"
                onClick={() => setScreen("list")}
                type="button"
              >
                Sign in
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button className="h-auto p-0 text-primary underline-offset-4 hover:underline" type="button" variant="ghost">
                  Sign up
                </Button>
              </p>
            </div>
          </Card>
        ) : null}

        {screen === "list" ? (
          <section className="space-y-4 md:space-y-5">
            <header className="sticky top-3 z-20 flex items-center justify-between rounded-2xl border border-border/50 bg-background/85 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍴</span>
                <h1 className="text-2xl font-semibold">PantryClip</h1>
              </div>
              <Button
                className="h-10 rounded-full px-4 text-sm font-semibold"
                onClick={() => {
                  resetDraft();
                  setScreen("add");
                }}
                type="button"
              >
                + Add
              </Button>
            </header>

            <Card className="p-3">
              <Input
                placeholder="Search recipes by title"
                className="h-11 rounded-xl border-border/70 bg-background/80"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </Card>

            <div className="space-y-3">
              {recipes.length === 0 ? (
                <Card className="border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No recipes yet.</p>
                  <Button
                    className="mt-3 rounded-full px-4 py-2 text-sm font-semibold"
                    onClick={() => setScreen("add")}
                    type="button"
                  >
                    Add your first recipe
                  </Button>
                </Card>
              ) : null}

              {recipes.length > 0 && filteredRecipes.length === 0 ? (
                <Card className="border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">No results for &quot;{searchQuery}&quot;.</p>
                </Card>
              ) : null}

              {filteredRecipes.map((recipe) => {
                const badge = sourceBadge(recipe.sourceType);

                return (
                  <Card
                    key={recipe.id}
                    className="cursor-pointer border-border/70 bg-card/95 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_12px_30px_-24px_var(--foreground)]"
                    onClick={() => goToDetail(recipe.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{recipe.title}</h2>
                      <span className="text-muted-foreground">›</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={badge.className} variant="outline">
                        {badge.label}
                      </Badge>
                      <span>{recipe.updatedAtLabel.replace("Updated ", "")}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : null}

        {screen === "add" ? (
          <section className="space-y-4 pb-36 md:space-y-5">
            <header className="flex items-center gap-3">
              <Button
                className="h-9 w-9 rounded-full"
                onClick={() => setScreen("list")}
                size="icon"
                variant="outline"
                type="button"
              >
                ←
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Add Recipe</h1>
                <p className="text-sm text-muted-foreground">Paste a link to get started</p>
              </div>
            </header>

            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                placeholder="https://www.youtube.com/shorts/..."
                className="h-12 rounded-2xl border-border/70 bg-card/95 px-4 text-base"
                value={addUrl}
                onChange={(event) => setAddUrl(event.target.value)}
              />
              {urlError ? <p className="text-sm text-destructive">{urlError}</p> : null}
            </div>

            <Card className="border-border/70 bg-card/85 p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Supported links</p>
              <p className="mt-1 font-mono text-xs">youtube.com/shorts/... or youtu.be/...</p>
              <p className="font-mono text-xs">instagram.com/reels/...</p>
            </Card>

            <div className="fixed inset-x-0 bottom-0 border-t border-border/70 bg-background/90 p-4 backdrop-blur-lg">
              <div className="mx-auto w-full max-w-xl space-y-3">
                <Button
                  className="h-12 w-full rounded-2xl text-base font-semibold"
                  onClick={handleGenerate}
                  type="button"
                >
                  ✦ Generate with AI
                </Button>
                <Button
                  className="mx-auto block h-auto p-0 text-sm text-muted-foreground underline-offset-4 hover:underline"
                  onClick={handleContinueManual}
                  type="button"
                  variant="ghost"
                >
                  Continue manually
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {screen === "loading" ? (
          <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Analyzing video and drafting recipe...</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              You can edit everything before saving.
            </p>
          </section>
        ) : null}

        {screen === "review" || screen === "edit" ? (
          <section className="space-y-4 pb-24 md:space-y-5">
            <header className="flex items-center gap-3">
              <Button
                className="h-9 w-9 rounded-full"
                onClick={() => setScreen(screen === "edit" ? "detail" : "add")}
                size="icon"
                variant="outline"
                type="button"
              >
                ←
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  {screen === "edit" ? "Edit Recipe" : "Review & Edit Draft"}
                </h1>
                {screen === "review" ? (
                  <p className="text-sm text-muted-foreground">AI draft is editable before save.</p>
                ) : null}
              </div>
            </header>

            {screen === "review" ? (
              <Badge className="bg-primary/15 px-3 py-1 text-primary" variant="outline">
                AI Draft
              </Badge>
            ) : null}

            <div className="space-y-3">
              <Label>Title</Label>
              <Input
                className="h-12 rounded-2xl border-border/70 bg-card/95 px-4"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
              {draftErrors.title ? <p className="text-sm text-destructive">{draftErrors.title}</p> : null}
            </div>

            <div className="space-y-3">
              <Label>Ingredients</Label>
              <Textarea
                className="min-h-32 rounded-2xl border-border/70 bg-card/95 p-4"
                value={draft.ingredientsText}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, ingredientsText: event.target.value }))
                }
              />
              {draftErrors.ingredientsText ? (
                <p className="text-sm text-destructive">{draftErrors.ingredientsText}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>Steps</Label>
              <Textarea
                className="min-h-40 rounded-2xl border-border/70 bg-card/95 p-4"
                value={draft.stepsText}
                onChange={(event) => setDraft((current) => ({ ...current, stepsText: event.target.value }))}
              />
              {draftErrors.stepsText ? <p className="text-sm text-destructive">{draftErrors.stepsText}</p> : null}
            </div>

            <div className="fixed inset-x-0 bottom-0 border-t border-border/70 bg-background/90 p-4 backdrop-blur-lg">
              <div className="mx-auto flex w-full max-w-xl gap-2">
                <Button
                  className="h-12 flex-1 rounded-2xl font-semibold"
                  onClick={screen === "edit" ? handleSaveEdit : handleSaveDraft}
                  type="button"
                >
                  {screen === "edit" ? "Save Changes" : "Save Recipe"}
                </Button>
                {screen === "review" ? (
                  <Button
                    className="h-12 rounded-2xl px-4 text-sm font-medium"
                    onClick={handleGenerate}
                    type="button"
                    variant="outline"
                  >
                    Regenerate
                  </Button>
                ) : (
                  <Button
                    className="h-12 rounded-2xl px-4 text-sm font-medium"
                    onClick={() => setScreen("detail")}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {screen === "detail" && selectedRecipe ? (
          <section className="space-y-4 pb-8 md:space-y-5">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  className="h-9 w-9 rounded-full"
                  onClick={() => setScreen("list")}
                  size="icon"
                  variant="outline"
                  type="button"
                >
                  ←
                </Button>
                <p className="text-sm text-muted-foreground">Recipe</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-9 w-9 rounded-full"
                  onClick={openEdit}
                  size="icon"
                  variant="outline"
                  type="button"
                >
                  ✎
                </Button>
                <Button
                  className="h-9 w-9 rounded-full border-destructive/30 text-destructive"
                  onClick={() => setShowDeleteModal(true)}
                  size="icon"
                  variant="outline"
                  type="button"
                >
                  🗑
                </Button>
              </div>
            </header>

            <Separator />

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{selectedRecipe.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className={sourceBadge(selectedRecipe.sourceType).className} variant="outline">
                  {sourceBadge(selectedRecipe.sourceType).label}
                </Badge>
                <span>{selectedRecipe.updatedAtLabel}</span>
              </div>
              <a
                className="inline-block pt-1 text-sm text-primary underline-offset-4 hover:underline"
                href={selectedRecipe.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                ↗ View original source
              </a>
            </div>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingredients</h2>
              <Card className="border-border/70 bg-card/95 p-4">
                <ul className="space-y-3">
                  {toIngredientItems(selectedRecipe.ingredientsText).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Steps</h2>
              <div className="space-y-2">
                {toStepItems(selectedRecipe.stepsText).map((step, index) => (
                  <Card
                    key={`${step}-${index + 1}`}
                    className="border-border/70 bg-card/95 p-4 transition hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <Badge className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full p-0 text-xs font-semibold" variant="default">
                        {index + 1}
                      </Badge>
                      <p>{step}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </section>
        ) : null}
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 backdrop-blur-[1px] sm:items-center">
          <Card className="w-full max-w-sm border-border/80 bg-card/98 p-5 shadow-[0_20px_45px_-22px_var(--foreground)]">
            <h3 className="text-lg font-semibold">Delete recipe?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This action cannot be undone in this draft prototype.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                className="h-11 flex-1 rounded-xl font-medium"
                onClick={() => setShowDeleteModal(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl font-semibold"
                onClick={handleDelete}
                type="button"
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </main>
  );
}
