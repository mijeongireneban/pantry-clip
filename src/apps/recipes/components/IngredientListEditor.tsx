"use client";

import { copy, replaceCount } from "@/src/apps/recipes/ui.constants";
import { IcPlus } from "@/src/apps/recipes/icons";
import type { Language } from "@/src/apps/recipes/ui.types";

export function IngredientListEditor({
  value,
  onChange,
  language
}: {
  value: string;
  onChange: (v: string) => void;
  language: Language;
}) {
  const items = value.split("\n").map((l) => l.replace(/^-+\s*/, "").trim());
  const list = items.length > 0 ? items : [""];
  const editorCopy = copy[language].editors;

  const serialize = (rows: string[]) => rows.map((i) => `- ${i}`).join("\n");

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">–</span>
          <input
            className="h-10 flex-1 rounded-lg border border-border/70 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={item}
            placeholder={replaceCount(editorCopy.ingredientPlaceholder, i + 1)}
            onChange={(e) => {
              const next = [...list];
              next[i] = e.target.value;
              onChange(serialize(next));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = [...list];
                next.splice(i + 1, 0, "");
                onChange(serialize(next));
              }
              if (e.key === "Backspace" && item === "" && list.length > 1) {
                e.preventDefault();
                const next = list.filter((_, j) => j !== i);
                onChange(serialize(next));
              }
            }}
          />
          {list.length > 1 && (
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
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
        <IcPlus className="h-3.5 w-3.5" /> {editorCopy.addIngredient}
      </button>
    </div>
  );
}
