import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { IcBookmark, IcFolder, IcPlus } from "@/src/apps/recipes/icons";
import { Logo } from "@/src/apps/recipes/components/shared";
import { RecipeCardSkeleton } from "@/src/apps/recipes/components/RecipeCardSkeleton";
import { RecipeThumbnail } from "@/src/apps/recipes/components/RecipeThumbnail";
import { SourceBadge } from "@/src/apps/recipes/components/SourceBadge";
import { toUpdatedAtLabel } from "@/src/apps/recipes/ui.helpers";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type {
  Language,
  RecipeCollectionSummary,
  RecipeItem
} from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  collections: RecipeCollectionSummary[];
  allSavedRecipesCount: number;
  selectedSavedCollectionId: string;
  savedCollectionRecipes: RecipeItem[];
  isCollectionsLoading: boolean;
  isSavedRecipesLoading: boolean;
  isSavedEmpty: boolean;
  savedError: string;
  ALL_SAVED_COLLECTION_ID: string;
  setSelectedSavedCollectionId: (id: string) => void;
  onSelectRecipe: (id: string) => void;
  onCreateCollection: () => void;
  onManageCollections: () => void;
};

export function SavedScreen({
  language,
  ui,
  collections,
  allSavedRecipesCount,
  selectedSavedCollectionId,
  savedCollectionRecipes,
  isCollectionsLoading,
  isSavedRecipesLoading,
  isSavedEmpty,
  savedError,
  ALL_SAVED_COLLECTION_ID,
  setSelectedSavedCollectionId,
  onSelectRecipe,
  onCreateCollection,
  onManageCollections
}: Props) {
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Logo />
      </div>

      <div className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-bold leading-tight">{ui.saved.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{ui.saved.subtitle}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-3 font-bold"
              onClick={onManageCollections}
            >
              {ui.saved.manageCollections}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-3 font-bold"
              onClick={onCreateCollection}
            >
              <IcPlus className="mr-2 h-4 w-4" />
              {ui.saved.createCollection}
            </Button>
          </div>
        </div>

        {isCollectionsLoading ? (
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        ) : (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                selectedSavedCollectionId === ALL_SAVED_COLLECTION_ID
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-foreground"
              }`}
              onClick={() => setSelectedSavedCollectionId(ALL_SAVED_COLLECTION_ID)}
            >
              <span>{ui.saved.allRecipes}</span>
              <span className="text-xs opacity-80">{allSavedRecipesCount}</span>
            </button>
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedSavedCollectionId === collection.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-foreground"
                }`}
                onClick={() => setSelectedSavedCollectionId(collection.id)}
              >
                <span>{collection.name}</span>
                <span className="text-xs opacity-80">{collection.recipeCount}</span>
              </button>
            ))}
          </div>
        )}

        {savedError && (
          <p className="mt-3 text-sm text-destructive">{savedError}</p>
        )}

        {isSavedRecipesLoading ? (
          <div className="mt-4 space-y-4">
            <RecipeCardSkeleton showBookmark />
            <RecipeCardSkeleton showBookmark />
          </div>
        ) : isSavedEmpty ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-card">
              <IcFolder className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">
                {selectedSavedCollectionId === ALL_SAVED_COLLECTION_ID
                  ? ui.saved.emptyTitle
                  : ui.saved.noRecipesInCollection}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedSavedCollectionId === ALL_SAVED_COLLECTION_ID
                  ? ui.saved.emptyDescription
                  : ui.saved.noRecipesInCollectionDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {savedCollectionRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left transition active:scale-[0.98]"
                onClick={() => onSelectRecipe(recipe.id)}
              >
                <div className="relative h-[140px] w-full">
                  <RecipeThumbnail
                    key={recipe.sourceUrl}
                    recipe={recipe}
                    alt={recipe.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3">
                    <SourceBadge
                      language={language}
                      sourceType={recipe.sourceType}
                      summarySource={recipe.summarySource}
                      overlay
                    />
                  </div>
                  <div className="absolute left-3 top-3">
                    <IcBookmark className="h-4 w-4 fill-primary text-primary" />
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
        )}
      </div>
    </div>
  );
}
