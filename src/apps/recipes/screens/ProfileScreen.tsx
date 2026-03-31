import type { Session } from "@supabase/supabase-js";

import { Button } from "@/src/components/ui/button";
import { IcMoon, IcSun, IcUser } from "@/src/apps/recipes/icons";
import { Logo } from "@/src/apps/recipes/components/shared";
import { replaceCount } from "@/src/apps/recipes/ui.constants";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";
import type { Language } from "@/src/apps/recipes/ui.types";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  session: Session | null;
  theme: string;
  allSavedRecipesCount: number;
  setLanguage: (l: Language) => void;
  setTheme: (t: "light" | "dark") => void;
  onSignOut: () => void;
};

export function ProfileScreen({
  language,
  ui,
  session,
  theme,
  allSavedRecipesCount,
  setLanguage,
  setTheme,
  onSignOut
}: Props) {
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Logo />
      </div>

      <div className="px-5">
        <div className="flex flex-col items-center py-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/70 bg-card">
            <IcUser className="h-9 w-9 text-muted-foreground" />
          </div>
          <p className="mt-4 font-bold">{session?.user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {replaceCount(ui.profile.recipesSaved, allSavedRecipesCount)}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-sm font-bold">{ui.profile.themeTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {ui.profile.themeDescription}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={theme === "light" ? "default" : "outline"}
              className="h-11 rounded-xl font-bold"
              onClick={() => setTheme("light")}
            >
              <IcSun className="mr-2 h-4 w-4" />
              {ui.profile.light}
            </Button>
            <Button
              type="button"
              variant={theme === "dark" ? "default" : "outline"}
              className="h-11 rounded-xl font-bold"
              onClick={() => setTheme("dark")}
            >
              <IcMoon className="mr-2 h-4 w-4" />
              {ui.profile.dark}
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-sm font-bold">{ui.profile.languageTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {ui.profile.languageDescription}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={language === "ko" ? "default" : "outline"}
              className="h-11 rounded-xl font-bold"
              onClick={() => setLanguage("ko")}
            >
              {ui.profile.korean}
            </Button>
            <Button
              type="button"
              variant={language === "en" ? "default" : "outline"}
              className="h-11 rounded-xl font-bold"
              onClick={() => setLanguage("en")}
            >
              {ui.profile.english}
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 h-12 w-full rounded-xl font-bold"
          onClick={onSignOut}
        >
          {ui.profile.signOut}
        </Button>
      </div>
    </div>
  );
}
