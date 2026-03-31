import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { RecipeCollectionSummary } from "@/src/apps/recipes/ui.types";

type Props = {
  ui: UiCopy[keyof UiCopy];
  collections: RecipeCollectionSummary[];
  collectionSelection: string[];
  collectionError: string;
  isUpdating: boolean;
  setCollectionSelection: (fn: (ids: string[]) => string[]) => void;
  onSave: () => void;
  onClose: () => void;
};

export function ManageRecipeCollectionsModal({
  ui,
  collections,
  collectionSelection,
  collectionError,
  isUpdating,
  setCollectionSelection,
  onSave,
  onClose
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full rounded-t-3xl border-x border-t border-border/70 bg-card p-6 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h2 className="text-lg font-bold">{ui.saved.manageCollectionsTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {ui.saved.manageCollectionsDescription}
        </p>
        <div className="mt-5 space-y-3">
          {collections.map((collection) => {
            const selected = collectionSelection.includes(collection.id);
            return (
              <button
                key={collection.id}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-card"
                }`}
                onClick={() =>
                  setCollectionSelection((current) =>
                    current.includes(collection.id)
                      ? current.filter((id) => id !== collection.id)
                      : [...current, collection.id]
                  )
                }
              >
                <div>
                  <p className="font-semibold">{collection.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {collection.recipeCount}
                  </p>
                </div>
                <Checkbox
                  checked={selected}
                  className="pointer-events-none"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </button>
            );
          })}
        </div>
        {collectionError && (
          <p className="mt-4 text-sm text-destructive">{collectionError}</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onClose}
          >
            {ui.deleteModal.cancel}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onSave}
            disabled={isUpdating}
          >
            {ui.detail.collections}
          </Button>
        </div>
      </div>
    </div>
  );
}
