import { Button } from "@/src/components/ui/button";
import { replaceTitle } from "@/src/apps/recipes/ui.constants";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { RecipeItem } from "@/src/apps/recipes/ui.types";

type Props = {
  ui: UiCopy[keyof UiCopy];
  recipe: RecipeItem;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteRecipeModal({ ui, recipe, onConfirm, onCancel }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full rounded-t-3xl border-x border-t border-border/70 bg-card p-6 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h2 className="text-lg font-bold">{ui.deleteModal.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {replaceTitle(ui.deleteModal.description, recipe.title)}
        </p>
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
            variant="destructive"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onConfirm}
          >
            {ui.deleteModal.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}
