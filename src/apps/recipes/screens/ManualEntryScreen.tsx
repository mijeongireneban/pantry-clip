import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { IcLeft } from "@/src/apps/recipes/icons";
import { Logo, Label } from "@/src/apps/recipes/components/shared";
import { IngredientListEditor } from "@/src/apps/recipes/components/IngredientListEditor";
import { StepListEditor } from "@/src/apps/recipes/components/StepListEditor";
import { inferSourceType } from "@/src/apps/recipes/ui.helpers";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { Language, RecipeDraft } from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  draft: RecipeDraft;
  draftErrors: Partial<Record<keyof RecipeDraft, string>>;
  setDraft: (fn: (d: RecipeDraft) => RecipeDraft) => void;
  onSave: () => void;
  onBack: () => void;
};

export function ManualEntryScreen({
  language,
  ui,
  draft,
  draftErrors,
  setDraft,
  onSave,
  onBack
}: Props) {
  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button type="button" onClick={onBack} className="text-muted-foreground">
          <IcLeft className="h-6 w-6" />
        </button>
        <Logo />
      </div>

      <div className="px-5">
        <h1 className="text-2xl font-bold">{ui.manual.title}</h1>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {ui.manual.eyebrow}
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>{ui.manual.sourceUrl}</Label>
            <Input
              className="h-12 rounded-xl border border-border/70 bg-card focus-visible:ring-1 focus-visible:ring-primary"
              value={draft.sourceUrl}
              onChange={(e) =>
                setDraft((c) => ({
                  ...c,
                  sourceUrl: e.target.value,
                  sourceType: inferSourceType(e.target.value)
                }))
              }
              placeholder="https://..."
            />
            {draftErrors.sourceUrl && (
              <p className="text-xs text-destructive">{draftErrors.sourceUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{ui.manual.titleLabel}</Label>
            <Input
              className="h-12 rounded-xl border border-border/70 bg-card focus-visible:ring-1 focus-visible:ring-primary"
              value={draft.title}
              onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
              placeholder={ui.manual.titlePlaceholder}
            />
            {draftErrors.title && (
              <p className="text-xs text-destructive">{draftErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{ui.manual.ingredientsLabel}</Label>
            <IngredientListEditor
              value={draft.ingredientsText}
              language={language}
              onChange={(v) => setDraft((c) => ({ ...c, ingredientsText: v }))}
            />
            {draftErrors.ingredientsText && (
              <p className="text-xs text-destructive">
                {draftErrors.ingredientsText}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{ui.manual.preparationLabel}</Label>
            <StepListEditor
              value={draft.stepsText}
              language={language}
              onChange={(v) => setDraft((c) => ({ ...c, stepsText: v }))}
            />
            {draftErrors.stepsText && (
              <p className="text-xs text-destructive">{draftErrors.stepsText}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onBack}
          >
            {ui.manual.cancel}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onSave}
          >
            {ui.manual.saveToLibrary}
          </Button>
        </div>
      </div>
    </div>
  );
}
