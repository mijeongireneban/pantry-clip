import { Button } from "@/src/components/ui/button";
import { IcBookmark, IcLeft, IcLink, IcShare } from "@/src/apps/recipes/icons";
import { Label } from "@/src/apps/recipes/components/shared";
import { RecipeThumbnail } from "@/src/apps/recipes/components/RecipeThumbnail";
import { SourceBadge } from "@/src/apps/recipes/components/SourceBadge";
import {
  toIngredientItems,
  toStepItems,
  toUpdatedAtLabel
} from "@/src/apps/recipes/ui.helpers";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { Language, RecipeItem } from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  recipe: RecipeItem;
  onBack: () => void;
  onToggleSave: () => void;
  onOpenCollections: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function DetailScreen({
  language,
  ui,
  recipe,
  onBack,
  onToggleSave,
  onOpenCollections,
  onEdit,
  onDelete
}: Props) {
  const ingredientItems = toIngredientItems(recipe.ingredientsText);
  const stepItems = toStepItems(recipe.stepsText);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 font-bold text-primary"
        >
          <IcLeft className="h-5 w-5" />
          <span className="text-sm">{ui.detail.title}</span>
        </button>
        <div className="flex items-center gap-4">
          <button type="button" className="text-muted-foreground">
            <IcShare className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className={recipe.isSaved ? "text-primary" : "text-muted-foreground"}
          >
            <IcBookmark
              className={`h-5 w-5 ${recipe.isSaved ? "fill-primary" : ""}`}
            />
          </button>
        </div>
      </div>

      <RecipeThumbnail
        key={recipe.sourceUrl}
        recipe={recipe}
        alt={recipe.title}
        className="mx-5 h-[220px] w-[calc(100%-2.5rem)] rounded-2xl object-cover"
      />

      <div className="mt-5 px-5">
        <div className="flex items-center justify-between">
          <SourceBadge
            language={language}
            sourceType={recipe.sourceType}
            summarySource={recipe.summarySource}
          />
          <span className="text-[11px] text-muted-foreground">
            {toUpdatedAtLabel(recipe.updatedAt, language)}
          </span>
        </div>

        <h1 className="mt-3 text-[26px] font-bold leading-tight">{recipe.title}</h1>

        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
        >
          <IcLink className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{recipe.sourceUrl}</span>
        </a>

        {/* TODO: Add nutrition data (calories, protein, carbs) to data model */}

        <div className="mt-6">
          <Label>{ui.detail.ingredients}</Label>
          {ingredientItems.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {ingredientItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3"
                >
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-border/70 bg-card px-4 py-4 text-sm text-muted-foreground">
              {ui.detail.noIngredients}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Label>{ui.detail.preparation}</Label>
          {stepItems.length > 0 ? (
            <div className="mt-3 space-y-2">
              {stepItems.map((step, i) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-xl border border-border/70 bg-card px-4 py-3.5"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-border/70 bg-card px-4 py-4 text-sm text-muted-foreground">
              {ui.detail.noSteps}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold"
            onClick={onOpenCollections}
          >
            {ui.detail.collections}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl font-bold"
            onClick={onEdit}
          >
            {ui.detail.edit}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-12 rounded-xl font-bold"
            onClick={onDelete}
          >
            {ui.detail.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}
