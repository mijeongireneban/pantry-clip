"use client";

import { copy, replaceCount } from "@/src/apps/recipes/ui.constants";
import { IcPlus } from "@/src/apps/recipes/icons";
import type { Language } from "@/src/apps/recipes/ui.types";

export function StepListEditor({
  value,
  onChange,
  language
}: {
  value: string;
  onChange: (v: string) => void;
  language: Language;
}) {
  const items = value.split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim());
  const list = items.length > 0 ? items : [""];
  const editorCopy = copy[language].editors;

  const serialize = (rows: string[]) =>
    rows.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return (
    <div className="space-y-2">
      {list.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {i + 1}
          </span>
          <textarea
            className="min-h-[60px] flex-1 resize-none rounded-lg border border-border/70 bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={step}
            placeholder={replaceCount(editorCopy.stepPlaceholder, i + 1)}
            rows={2}
            onChange={(e) => {
              const next = [...list];
              next[i] = e.target.value;
              onChange(serialize(next));
            }}
          />
          {list.length > 1 && (
            <button
              type="button"
              className="mt-2 text-muted-foreground hover:text-destructive"
              onClick={() =>
                onChange(serialize(list.filter((_, j) => j !== i)))
              }
            >
              <IcPlus className="h-4 w-4 rotate-45" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary"
        onClick={() => onChange(serialize([...list, ""]))}
      >
        <IcPlus className="h-3.5 w-3.5" /> {editorCopy.addStep}
      </button>
    </div>
  );
}
