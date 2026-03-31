import { copy } from "@/src/apps/recipes/ui.constants";
import { IcBolt, IcInstagram, IcLink, IcYouTube } from "@/src/apps/recipes/icons";
import type { Language, RecipeItem } from "@/src/apps/recipes/ui.types";

export function SourceBadge({
  sourceType,
  summarySource,
  language,
  overlay = false
}: {
  sourceType: RecipeItem["sourceType"];
  summarySource?: RecipeItem["summarySource"];
  language: Language;
  overlay?: boolean;
}) {
  const base = overlay
    ? "flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
    : "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold";

  return (
    <div className="flex items-center gap-1.5">
      {sourceType === "youtube_shorts" && (
        <span
          className={`${base} ${!overlay ? "bg-[#ff0000]/15 text-[#ff4444]" : ""}`}
        >
          <IcYouTube className="h-3 w-3" />
          {copy[language].sourceBadge.youtube}
        </span>
      )}
      {sourceType === "instagram_reels" && (
        <span
          className={`${base} ${!overlay ? "bg-primary/15 text-primary" : ""}`}
        >
          <IcInstagram className="h-3 w-3" />
          {copy[language].sourceBadge.instagram}
        </span>
      )}
      {sourceType === "other" && (
        <span
          className={`${base} ${!overlay ? "bg-muted text-muted-foreground" : ""}`}
        >
          <IcLink className="h-3 w-3" />
          {copy[language].sourceBadge.link}
        </span>
      )}
      {summarySource === "ai" && (
        <span
          className={`${base} ${!overlay ? "bg-muted text-muted-foreground" : ""}`}
        >
          <IcBolt className="h-3 w-3" />
          {copy[language].sourceBadge.ai}
        </span>
      )}
    </div>
  );
}
