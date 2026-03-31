import { Button } from "@/src/components/ui/button";
import { IcPlus } from "@/src/apps/recipes/icons";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { RecipeCollectionSummary } from "@/src/apps/recipes/ui.types";

type Props = {
  ui: UiCopy[keyof UiCopy];
  collections: RecipeCollectionSummary[];
  collectionError: string;
  onRename: (collection: RecipeCollectionSummary) => void;
  onDelete: (collection: RecipeCollectionSummary) => void;
  onCreateCollection: () => void;
  onClose: () => void;
};

export function EditCollectionsModal({
  ui,
  collections,
  collectionError,
  onRename,
  onDelete,
  onCreateCollection,
  onClose
}: Props) {
  const customCollections = collections.filter((c) => !c.isDefault);

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full rounded-t-3xl border-x border-t border-border/70 bg-card p-6 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h2 className="text-lg font-bold">{ui.saved.editCollectionsTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {ui.saved.editCollectionsDescription}
        </p>

        {customCollections.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border/70 bg-card px-4 py-5 text-center">
            <p className="font-semibold">{ui.saved.customCollectionsEmpty}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {ui.saved.customCollectionsEmptyDescription}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="rounded-2xl border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{collection.name}</p>
                      {collection.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                          {ui.saved.defaultCollectionBadge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {collection.recipeCount}
                    </p>
                  </div>
                  {!collection.isDefault && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg px-3 text-xs font-bold"
                        onClick={() => onRename(collection)}
                      >
                        {ui.saved.renameCollection}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-9 rounded-lg px-3 text-xs font-bold"
                        onClick={() => onDelete(collection)}
                      >
                        {ui.saved.deleteCollection}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

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
            onClick={onCreateCollection}
          >
            <IcPlus className="mr-2 h-4 w-4" />
            {ui.saved.createCollection}
          </Button>
        </div>
      </div>
    </div>
  );
}
