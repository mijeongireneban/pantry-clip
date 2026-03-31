import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  IcBookmark,
  IcPlus,
  IcSearch,
  IcUtensils
} from "@/src/apps/recipes/icons";
import { Logo } from "@/src/apps/recipes/components/shared";
import { RecipeCardSkeleton } from "@/src/apps/recipes/components/RecipeCardSkeleton";
import { RecipeThumbnail } from "@/src/apps/recipes/components/RecipeThumbnail";
import { SourceBadge } from "@/src/apps/recipes/components/SourceBadge";
import { toUpdatedAtLabel } from "@/src/apps/recipes/ui.helpers";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { Language, RecipeItem } from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  recipes: RecipeItem[];
  libraryRecipes: RecipeItem[];
  searchQuery: string;
  isSearchActive: boolean;
  isInitialRecipesLoading: boolean;
  isLibrarySearchLoading: boolean;
  recipesError: string;
  setSearchQuery: (v: string) => void;
  onAddRecipe: () => void;
  onSelectRecipe: (id: string) => void;
};

export function LibraryScreen({
  language,
  ui,
  recipes,
  libraryRecipes,
  searchQuery,
  isSearchActive,
  isInitialRecipesLoading,
  isLibrarySearchLoading,
  recipesError,
  setSearchQuery,
  onAddRecipe,
  onSelectRecipe
}: Props) {
  return (
    <div className="pb-6">
      <div className="flex items-center px-5 pt-5 pb-4">
        <Logo />
      </div>

      <div className="px-5">
        <h1 className="text-[32px] font-bold leading-tight">{ui.library.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{ui.library.subtitle}</p>

        <Button
          type="button"
          className="mt-5 h-12 w-full gap-2 rounded-xl font-bold"
          onClick={onAddRecipe}
        >
          <IcPlus className="h-4 w-4" />
          {ui.library.addRecipe}
        </Button>

        <div className="relative mt-3">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            <IcSearch className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder={ui.library.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-xl border border-border/70 bg-card pl-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {recipesError && (
          <p className="mt-3 text-sm text-destructive">{recipesError}</p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">
            {isSearchActive ? ui.library.searchResults : ui.library.recentRecipes}
          </h2>
          {/* TODO: View All */}
        </div>

        {(isInitialRecipesLoading || isLibrarySearchLoading) && (
          <div className="mt-4 space-y-4">
            <RecipeCardSkeleton showBookmark />
            <RecipeCardSkeleton showBookmark />
          </div>
        )}

        {!isSearchActive &&
          recipes.length === 0 &&
          !recipesError &&
          !isInitialRecipesLoading && (
            <div className="mt-4 rounded-2xl border border-border/70 bg-card p-6 text-center">
              <p className="font-semibold">{ui.library.noRecipes}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ui.library.noRecipesDescription}
              </p>
            </div>
          )}

        {isSearchActive &&
          libraryRecipes.length === 0 &&
          !recipesError &&
          !isLibrarySearchLoading && (
            <div className="mt-4 rounded-2xl border border-border/70 bg-card p-6 text-center">
              <p className="font-semibold">{ui.library.noMatches}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ui.library.noMatchesDescription}
              </p>
            </div>
          )}

        <div
          className={`mt-4 space-y-4 ${isInitialRecipesLoading || isLibrarySearchLoading ? "hidden" : ""}`}
        >
          {libraryRecipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left transition active:scale-[0.98]"
              onClick={() => onSelectRecipe(recipe.id)}
            >
              <div className="relative h-[160px] w-full">
                <RecipeThumbnail
                  key={recipe.sourceUrl}
                  recipe={recipe}
                  alt={recipe.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-3 top-3">
                  <IcBookmark
                    className={`h-4 w-4 ${recipe.isSaved ? "fill-primary text-primary" : "text-white/75"}`}
                  />
                </div>
                <div className="absolute right-3 top-3">
                  <SourceBadge
                    language={language}
                    sourceType={recipe.sourceType}
                    summarySource={recipe.summarySource}
                    overlay
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold leading-snug">{recipe.title}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {toUpdatedAtLabel(recipe.updatedAt, language)}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Recipe Tip of the Day */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-card p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {ui.library.tipLabel}
          </p>
          <p className="mt-2 font-bold leading-snug">{ui.library.tipTitle}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {ui.library.tipBody}
          </p>
          <button
            type="button"
            className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-primary"
          >
            <IcUtensils className="h-3.5 w-3.5" />
            {ui.library.tipCta}
          </button>
        </div>

        {/* AI Recipe Generator banner */}
        <div className="mt-4 flex items-center justify-between overflow-hidden rounded-2xl bg-primary p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">
              {ui.library.aiBannerLabel}
            </p>
            <p className="mt-1 text-sm font-bold leading-snug text-primary-foreground">
              {ui.library.aiBannerTitle}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 h-9 rounded-lg px-4 text-xs font-bold"
              onClick={onAddRecipe}
            >
              {ui.library.aiBannerCta}
            </Button>
          </div>
          <div className="select-none text-4xl text-primary-foreground/30">✦</div>
        </div>
      </div>
    </div>
  );
}
