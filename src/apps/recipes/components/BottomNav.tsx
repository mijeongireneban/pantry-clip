import { copy } from "@/src/apps/recipes/ui.constants";
import {
  IcBook,
  IcBookmark,
  IcBolt,
  IcPlus,
  IcUser
} from "@/src/apps/recipes/icons";
import type { Language, Tab } from "@/src/apps/recipes/ui.types";

export function BottomNav({
  activeTab,
  language,
  onLibrary,
  onAdd,
  onScrap,
  onProfile
}: {
  activeTab: Tab;
  language: Language;
  onLibrary: () => void;
  onAdd: () => void;
  onScrap: () => void;
  onProfile: () => void;
}) {
  const navCopy = copy[language].bottomNav;
  const tabs = [
    {
      id: "library" as Tab,
      label: navCopy.library,
      icon: <IcBook className="h-[22px] w-[22px]" />,
      action: onLibrary
    },
    {
      id: "add" as Tab,
      label: navCopy.add,
      icon: <IcPlus className="h-[22px] w-[22px]" />,
      action: onAdd
    },
    {
      id: "scrap" as Tab,
      label: navCopy.scrap,
      icon: <IcBookmark className="h-[22px] w-[22px]" />,
      action: onScrap
    },
    {
      id: "profile" as Tab,
      label: navCopy.profile,
      icon: <IcUser className="h-[22px] w-[22px]" />,
      action: onProfile
    }
  ];

  return (
    <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl border border-border/70 bg-card px-1 py-2">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const isAdd = tab.id === "add";

        if (isAdd) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.action}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
              >
                <IcBolt className="h-[22px] w-[22px]" />
              </div>
              <span
                className={`text-[9px] font-bold tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={tab.action}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
            >
              {tab.icon}
            </div>
            <span
              className={`text-[9px] font-bold tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
