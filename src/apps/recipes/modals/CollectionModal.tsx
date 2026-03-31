import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/apps/recipes/components/shared";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";

type Props = {
  ui: UiCopy[keyof UiCopy];
  mode: "create" | "rename";
  collectionName: string;
  collectionError: string;
  isSubmitting: boolean;
  setCollectionName: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CollectionModal({
  ui,
  mode,
  collectionName,
  collectionError,
  isSubmitting,
  setCollectionName,
  onConfirm,
  onCancel
}: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full rounded-t-3xl border-x border-t border-border/70 bg-card p-6 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h2 className="text-lg font-bold">
          {mode === "rename"
            ? ui.saved.renameCollectionTitle
            : ui.saved.createCollectionTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "rename"
            ? ui.saved.renameCollectionDescription
            : ui.saved.createCollectionDescription}
        </p>
        <div className="mt-5 space-y-2">
          <Label>{ui.saved.collectionNameLabel}</Label>
          <Input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder={ui.saved.collectionNamePlaceholder}
            className="h-12 rounded-xl border border-border/70 bg-card focus-visible:ring-1 focus-visible:ring-primary"
          />
          {collectionError && (
            <p className="text-sm text-destructive">{collectionError}</p>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onCancel}
          >
            {ui.deleteModal.cancel}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {mode === "rename"
              ? ui.saved.renameCollection
              : ui.saved.createCollection}
          </Button>
        </div>
      </div>
    </div>
  );
}
