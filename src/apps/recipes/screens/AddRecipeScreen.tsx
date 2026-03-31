import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { IcBookmark, IcBolt, IcDot, IcLink } from "@/src/apps/recipes/icons";
import { Logo, Label } from "@/src/apps/recipes/components/shared";
import { IngredientListEditor } from "@/src/apps/recipes/components/IngredientListEditor";
import { StepListEditor } from "@/src/apps/recipes/components/StepListEditor";
import { toSummarizeStatusLabel } from "@/src/apps/recipes/ui.constants";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { SummarizeJobStatus } from "@/src/apps/recipes/recipes.types";
import type { Language, RecipeDraft } from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  addUrl: string;
  urlError: string;
  isGenerating: boolean;
  isSavingUrlOnly: boolean;
  summarizeJobStatus: SummarizeJobStatus | null;
  hasDraft: boolean;
  draft: RecipeDraft;
  draftErrors: Partial<Record<keyof RecipeDraft, string>>;
  setAddUrl: (v: string) => void;
  setDraft: (fn: (d: RecipeDraft) => RecipeDraft) => void;
  onGenerate: () => void;
  onSaveUrlOnly: () => void;
  onSaveAiDraft: () => void;
  onCancelDraft: () => void;
};

export function AddRecipeScreen({
  language,
  ui,
  addUrl,
  urlError,
  isGenerating,
  isSavingUrlOnly,
  summarizeJobStatus,
  hasDraft,
  draft,
  draftErrors,
  setAddUrl,
  setDraft,
  onGenerate,
  onSaveUrlOnly,
  onSaveAiDraft,
  onCancelDraft
}: Props) {
  return (
    <div className="pb-6">
      <div className="flex items-center px-5 pt-5 pb-4">
        <Logo />
      </div>

      <div className="px-5">
        <h1 className="text-[32px] font-bold leading-tight">{ui.add.title}</h1>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {ui.add.eyebrow}
        </p>

        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            {ui.add.aiSupportLabel}
          </p>
          <p className="mt-1 text-sm font-semibold">{ui.add.aiSupportTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {ui.add.aiSupportDescription}
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <Input
              className="h-12 rounded-xl border border-border/70 bg-card pr-12 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              placeholder="https://youtube.com/shorts/..."
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <IcLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {urlError && (
            <p className="mt-2 text-sm text-destructive">{urlError}</p>
          )}

          <Button
            type="button"
            className="mt-3 h-12 w-full gap-2.5 rounded-xl text-[15px] font-bold"
            onClick={onGenerate}
            disabled={isGenerating || isSavingUrlOnly}
          >
            <IcBolt className="h-[18px] w-[18px]" />
            {isGenerating
              ? toSummarizeStatusLabel(summarizeJobStatus, language)
              : ui.add.generateWithAi}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-12 w-full gap-2.5 rounded-xl text-[15px] font-bold"
            onClick={onSaveUrlOnly}
            disabled={isGenerating || isSavingUrlOnly}
          >
            <IcBookmark className="h-[18px] w-[18px]" />
            {isSavingUrlOnly ? ui.add.savingUrlOnly : ui.add.saveUrlOnly}
          </Button>

          {isGenerating && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-[120px] w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-[160px] w-full rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {hasDraft && !isGenerating && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold">{ui.add.reviewDraft}</h2>
              <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1">
                <IcDot className="h-2 w-2 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  {ui.add.draft}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-4">
              <div className="space-y-2">
                <Label>{ui.add.titleLabel}</Label>
                <input
                  className="h-12 w-full rounded-xl border border-border/70 bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((c) => ({ ...c, title: e.target.value }))
                  }
                  placeholder={ui.add.titlePlaceholder}
                />
                {draftErrors.title && (
                  <p className="text-xs text-destructive">{draftErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{ui.add.ingredientsLabel}</Label>
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
                <Label>{ui.add.preparationLabel}</Label>
                <StepListEditor
                  value={draft.stepsText}
                  language={language}
                  onChange={(v) => setDraft((c) => ({ ...c, stepsText: v }))}
                />
                {draftErrors.stepsText && (
                  <p className="text-xs text-destructive">
                    {draftErrors.stepsText}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl font-bold"
                onClick={onCancelDraft}
              >
                {ui.add.cancel}
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 rounded-xl font-bold"
                onClick={onSaveAiDraft}
              >
                {ui.add.saveToLibrary}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
