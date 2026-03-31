"use client";

import { useEffect, useMemo, useState } from "react";

import type { RecipeDto, SummarizeJobStatus } from "@/src/apis/@types/recipes";
import {
  createRecipe as createRecipeRequest,
  createSummarizeJob as createSummarizeJobRequest,
  deleteRecipe as deleteRecipeRequest,
  getSummarizeJob as getSummarizeJobRequest,
  listRecipes as listRecipesRequest,
  saveRecipeUrl as saveRecipeUrlRequest,
  toggleSaveRecipe as toggleSaveRecipeRequest,
  updateRecipe as updateRecipeRequest
} from "@/src/apis/recipes";
import { useAuth } from "@/src/apps/app/auth.provider";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────────────────────

type SourceType = "youtube_shorts" | "instagram_reels" | "other";
type SummarySource = "manual" | "ai";
// "add" now handles inline draft review. "review" is manual/write-text entry only.
type Screen = "auth" | "list" | "add" | "review" | "detail" | "edit" | "scrap" | "profile";
type Tab = "library" | "add" | "scrap" | "profile";

type Recipe = {
  id: string;
  sourceType: SourceType;
  sourceUrl: string;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
  isSaved: boolean;
  updatedAtLabel: string;
};

type RecipeDraft = {
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  ingredientsText: string;
  stepsText: string;
  summarySource: SummarySource;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferSourceType(url: string): SourceType {
  const n = url.toLowerCase();
  if (n.includes("youtube.com/shorts") || n.includes("youtu.be/")) return "youtube_shorts";
  if (n.includes("instagram.com/reel")) return "instagram_reels";
  return "other";
}

function toIngredientItems(text: string) {
  return text.split("\n").map((l) => l.replace(/^-+\s*/, "").trim()).filter(Boolean);
}

function toStepItems(text: string) {
  return text.split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
}

function validateDraft(d: RecipeDraft) {
  const e: Partial<Record<keyof RecipeDraft, string>> = {};
  if (!d.sourceUrl.trim()) e.sourceUrl = "URL을 입력해주세요.";
  if (!d.title.trim()) e.title = "제목을 입력해주세요.";
  if (!d.ingredientsText.trim()) e.ingredientsText = "재료를 입력해주세요.";
  if (!d.stepsText.trim()) e.stepsText = "조리 과정을 입력해주세요.";
  return e;
}

function toUpdatedAtLabel(updatedAt: string) {
  return new Date(updatedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toSummarizeStatusLabel(status: SummarizeJobStatus | null) {
  if (status === "queued") return "Queueing...";
  if (status === "extracting") return "Extracting...";
  if (status === "summarizing") return "Generating...";
  return "Generating...";
}

function toRecipe(dto: RecipeDto): Recipe {
  return {
    id: dto.id,
    sourceUrl: dto.sourceUrl,
    sourceType: dto.sourceType,
    title: dto.title,
    ingredientsText: dto.ingredientsText,
    stepsText: dto.stepsText,
    summarySource: dto.summarySource,
    isSaved: dto.isSaved,
    updatedAtLabel: toUpdatedAtLabel(dto.updatedAt)
  };
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IcBook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const IcSearch = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcBell = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IcSettings = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IcLink = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IcBolt = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const IcLeft = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcShare = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const IcBookmark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcPlus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcUser = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcMail = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IcLock = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IcEye = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IcEyeOff = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IcArrow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcUtensils = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
const IcDot = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="3"/></svg>
);
const IcYouTube = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
  </svg>
);
const IcInstagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

// ─── List editors ────────────────────────────────────────────────────────────

function IngredientListEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = value.split("\n").map((l) => l.replace(/^-+\s*/, "").trim());
  const list = items.length > 0 ? items : [""];

  // Serialize: keep empty rows while editing, only strip on save (validateDraft handles that)
  const serialize = (rows: string[]) => rows.map((i) => `- ${i}`).join("\n");

  return (
    <div className="space-y-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">–</span>
          <input
            className="h-10 flex-1 rounded-lg border-0 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={item}
            placeholder={`재료 ${i + 1}`}
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
              onClick={() => onChange(serialize(list.filter((_, j) => j !== i)))}
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
        <IcPlus className="h-3.5 w-3.5" /> Add ingredient
      </button>
    </div>
  );
}

function StepListEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = value.split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim());
  const list = items.length > 0 ? items : [""];

  const serialize = (rows: string[]) => rows.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return (
    <div className="space-y-2">
      {list.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {i + 1}
          </span>
          <textarea
            className="min-h-[60px] flex-1 resize-none rounded-lg border-0 bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={step}
            placeholder={`${i + 1}단계 설명`}
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
              onClick={() => onChange(serialize(list.filter((_, j) => j !== i)))}
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
        <IcPlus className="h-3.5 w-3.5" /> Add step
      </button>
    </div>
  );
}

// ─── Shared badge ────────────────────────────────────────────────────────────

function SourceBadge({ sourceType, summarySource, overlay = false }: {
  sourceType: SourceType;
  summarySource?: SummarySource;
  overlay?: boolean;
}) {
  const base = overlay
    ? "flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
    : "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold";

  return (
    <div className="flex items-center gap-1.5">
      {sourceType === "youtube_shorts" && (
        <span className={`${base} ${!overlay ? "bg-[#ff0000]/15 text-[#ff4444]" : ""}`}>
          <IcYouTube className="h-3 w-3" />
          YouTube
        </span>
      )}
      {sourceType === "instagram_reels" && (
        <span className={`${base} ${!overlay ? "bg-primary/15 text-primary" : ""}`}>
          <IcInstagram className="h-3 w-3" />
          Instagram
        </span>
      )}
      {sourceType === "other" && (
        <span className={`${base} ${!overlay ? "bg-muted text-muted-foreground" : ""}`}>
          <IcLink className="h-3 w-3" />
          Link
        </span>
      )}
      {summarySource === "ai" && (
        <span className={`${base} ${!overlay ? "bg-muted text-muted-foreground" : ""}`}>
          <IcBolt className="h-3 w-3" />
          AI
        </span>
      )}
    </div>
  );
}

// ─── Small shared UI ─────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <IcBook className="h-5 w-5 text-primary" />
      <span className="text-[15px] font-bold tracking-tight text-primary">PantryClip</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

/** Gradient card used as image placeholder until real images are added */
function ImgPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-[oklch(0.28_0.02_48)] via-[oklch(0.22_0.01_260)] to-[oklch(0.18_0.005_260)] ${className ?? ""}`} />
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function BottomNav({ activeTab, onLibrary, onAdd, onScrap, onProfile }: {
  activeTab: Tab;
  onLibrary: () => void;
  onAdd: () => void;
  onScrap: () => void;
  onProfile: () => void;
}) {
  const tabs = [
    { id: "library" as Tab, label: "LIBRARY", icon: <IcBook className="h-[22px] w-[22px]" />,     action: onLibrary },
    { id: "add"     as Tab, label: "ADD",      icon: <IcPlus className="h-[22px] w-[22px]" />,     action: onAdd     },
    { id: "scrap"   as Tab, label: "SAVED",    icon: <IcBookmark className="h-[22px] w-[22px]" />, action: onScrap   },
    { id: "profile" as Tab, label: "PROFILE",  icon: <IcUser className="h-[22px] w-[22px]" />,     action: onProfile },
  ];
  return (
    <div className="mx-3 mb-3 flex items-center justify-around rounded-2xl bg-card px-1 py-2">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const isAdd = tab.id === "add";

        if (isAdd) {
          return (
            <button key={tab.id} type="button" onClick={tab.action} className="flex flex-col items-center gap-1 px-3 py-1">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                <IcBolt className="h-[22px] w-[22px]" />
              </div>
              <span className={`text-[9px] font-bold tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button key={tab.id} type="button" onClick={tab.action} className="flex flex-col items-center gap-1 px-3 py-1">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
              {tab.icon}
            </div>
            <span className={`text-[9px] font-bold tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function RecipesHomeContainer() {
  const { isReady, session, signInWithPassword, signOut, signUpWithPassword } = useAuth();
  const [screen, setScreen]                   = useState<Screen>("auth");
  const [searchQuery, setSearchQuery]         = useState("");
  const [recipes, setRecipes]                 = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authEmail, setAuthEmail]             = useState("");
  const [authPassword, setAuthPassword]       = useState("");
  const [authError, setAuthError]             = useState("");
  const [authNotice, setAuthNotice]           = useState("");
  const [authMode, setAuthMode]               = useState<"sign_in" | "sign_up">("sign_in");
  const [authBusy, setAuthBusy]               = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [addUrl, setAddUrl]                   = useState("");
  const [urlError, setUrlError]               = useState("");
  const [recipesError, setRecipesError]       = useState("");
  const [isGenerating, setIsGenerating]       = useState(false);
  const [isSavingUrlOnly, setIsSavingUrlOnly] = useState(false);
  const [summarizeJobStatus, setSummarizeJobStatus] = useState<SummarizeJobStatus | null>(null);
  const [draftErrors, setDraftErrors]         = useState<Partial<Record<keyof RecipeDraft, string>>>({});
  const [toastMessage, setToastMessage]       = useState("");
  const [draft, setDraft]                     = useState<RecipeDraft>({
    sourceUrl: "", sourceType: "other", title: "", ingredientsText: "", stepsText: "", summarySource: "ai"
  });

  // Show the inline editor as soon as we have a source URL, even if AI generation failed.
  const hasDraft = draft.sourceUrl.trim() !== "";

  const selectedRecipe = useMemo(() => recipes.find((r) => r.id === selectedRecipeId) ?? null, [recipes, selectedRecipeId]);
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? recipes.filter((r) => r.title.toLowerCase().includes(q)) : recipes;
  }, [recipes, searchQuery]);

  const activeTab = useMemo<Tab>(() => {
    if (["list", "detail", "edit"].includes(screen)) return "library";
    if (["add", "review"].includes(screen)) return "add";
    if (screen === "scrap") return "scrap";
    if (screen === "profile") return "profile";
    return "library";
  }, [screen]);

  useEffect(() => {
    if (!isReady) return;
    if (session) { setScreen((c) => c === "auth" ? "list" : c); return; }
    setScreen("auth");
  }, [isReady, session]);

  useEffect(() => {
    if (!isReady || !session) { setRecipes([]); setSelectedRecipeId(""); return; }
    void (async () => {
      try {
        setRecipesError("");
        const res = await listRecipesRequest();
        const items = res.items.map(toRecipe);
        setRecipes(items);
        setSelectedRecipeId((c) => c || items[0]?.id || "");
      } catch (err) {
        setRecipesError(err instanceof Error ? err.message : "레시피를 불러오지 못했습니다.");
      }
    })();
  }, [isReady, session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(""), 2400);
  };

  const resetDraft = () => {
    setDraft({ sourceUrl: "", sourceType: "other", title: "", ingredientsText: "", stepsText: "", summarySource: "manual" });
    setDraftErrors({});
    setAddUrl("");
    setUrlError("");
    setSummarizeJobStatus(null);
  };

  const openManualDraft = (sourceUrl: string) => {
    setDraft({
      sourceUrl,
      sourceType: inferSourceType(sourceUrl),
      title: "",
      ingredientsText: "",
      stepsText: "",
      summarySource: "manual"
    });
    setDraftErrors({});
  };

  const handleAuthSubmit = async () => {
    setAuthError(""); setAuthNotice(""); setAuthBusy(true);
    try {
      if (authMode === "sign_up") {
        await signUpWithPassword(authEmail.trim(), authPassword);
        setAuthNotice("계정이 생성되었습니다. 이메일을 확인하여 인증을 완료해주세요.");
        setAuthPassword(""); return;
      }
      await signInWithPassword(authEmail.trim(), authPassword);
      setScreen("list");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally { setAuthBusy(false); }
  };

  // AI generate — stays on "add" screen, draft appears inline
  const handleGenerate = async () => {
    const sourceUrl = addUrl.trim();
    if (!sourceUrl) { setUrlError("URL을 입력해주세요."); return; }
    if (!/^https?:\/\//i.test(sourceUrl)) { setUrlError("http:// 또는 https://로 시작하는 URL을 입력해주세요."); return; }
    if (inferSourceType(sourceUrl) !== "youtube_shorts") {
      setUrlError("AI draft generation currently supports YouTube Shorts only. You can still continue manually.");
      openManualDraft(sourceUrl);
      return;
    }
    setUrlError(""); setIsGenerating(true); setSummarizeJobStatus("queued");
    try {
      const handle = await createSummarizeJobRequest({ sourceUrl });
      let nextStatus = handle.status;
      let polls = 0;

      while (polls < 15) {
        await sleep(polls < 10 ? 2000 : 4000);

        const job = await getSummarizeJobRequest(handle.jobId);
        nextStatus = job.status;
        setSummarizeJobStatus(job.status);

        if (job.status === "completed" && job.draft) {
          setDraft({
            sourceUrl,
            sourceType: job.sourceType,
            title: job.draft.titleDraft,
            ingredientsText: job.draft.ingredientsDraft,
            stepsText: job.draft.stepsDraft,
            summarySource: "ai"
          });
          setDraftErrors({});
          return;
        }

        if (job.status === "insufficient_context") {
          setUrlError(job.error?.message ?? "영상에서 레시피 정보를 충분히 추출하지 못했습니다. 직접 입력으로 계속해주세요.");
          openManualDraft(sourceUrl);
          return;
        }

        if (job.status === "failed") {
          setUrlError(job.error?.message ?? "AI 초안 생성에 실패했습니다. 직접 입력으로 계속해주세요.");
          openManualDraft(sourceUrl);
          return;
        }

        polls += 1;
      }

      setUrlError(
        nextStatus === "queued" || nextStatus === "extracting" || nextStatus === "summarizing"
          ? "초안 생성이 지연되고 있습니다. 직접 입력으로 계속해주세요."
          : "AI 초안 생성에 실패했습니다."
      );
      openManualDraft(sourceUrl);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "AI 초안 생성에 실패했습니다.");
      openManualDraft(sourceUrl);
    } finally { setIsGenerating(false); setSummarizeJobStatus(null); }
  };

  const handleSaveUrlOnly = async () => {
    const sourceUrl = addUrl.trim();
    if (!sourceUrl) { setUrlError("URL을 입력해주세요."); return; }
    if (!/^https?:\/\//i.test(sourceUrl)) { setUrlError("http:// 또는 https://로 시작하는 URL을 입력해주세요."); return; }

    setUrlError("");
    setIsSavingUrlOnly(true);

    try {
      const created = await saveRecipeUrlRequest({
        sourceUrl,
        title: draft.sourceUrl.trim() === sourceUrl ? draft.title.trim() || undefined : undefined
      });
      const next = toRecipe(created);
      setRecipes((c) => [next, ...c]);
      setSelectedRecipeId(next.id);
      resetDraft();
      setScreen("detail");
      showToast("링크가 저장되었습니다. 세부 내용은 나중에 수정할 수 있어요.");
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "URL 저장에 실패했습니다.");
    } finally {
      setIsSavingUrlOnly(false);
    }
  };

  // Save AI draft directly from inline review card
  const handleSaveAiDraft = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const created = await createRecipeRequest({
        sourceUrl: draft.sourceUrl.trim(), sourceType: draft.sourceType,
        title: draft.title.trim(), ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(), summarySource: draft.summarySource
      });
      const next = toRecipe(created);
      setRecipes((c) => [next, ...c]);
      setSelectedRecipeId(next.id);
      resetDraft();
      setScreen("detail");
      showToast("레시피가 저장되었습니다");
    } catch (err) {
      setDraftErrors((c) => ({ ...c, title: err instanceof Error ? err.message : "저장 실패" }));
    }
  };

  // Save manual entry (from "review" screen)
  const handleSaveManual = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const created = await createRecipeRequest({
        sourceUrl: draft.sourceUrl.trim(), sourceType: draft.sourceType,
        title: draft.title.trim(), ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(), summarySource: draft.summarySource
      });
      const next = toRecipe(created);
      setRecipes((c) => [next, ...c]);
      setSelectedRecipeId(next.id);
      resetDraft();
      setScreen("detail");
      showToast("레시피가 저장되었습니다");
    } catch (err) {
      setDraftErrors((c) => ({ ...c, title: err instanceof Error ? err.message : "저장 실패" }));
    }
  };

  const handleSaveEdit = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0 || !selectedRecipe) return;
    try {
      const updated = await updateRecipeRequest(selectedRecipe.id, {
        sourceUrl: draft.sourceUrl.trim(), sourceType: draft.sourceType,
        title: draft.title.trim(), ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(), summarySource: draft.summarySource
      });
      const next = toRecipe(updated);
      setRecipes((c) => c.map((r) => r.id === selectedRecipe.id ? next : r));
      setSelectedRecipeId(next.id);
      setScreen("detail");
      showToast("레시피가 수정되었습니다");
    } catch (err) {
      setDraftErrors((c) => ({ ...c, title: err instanceof Error ? err.message : "수정 실패" }));
    }
  };

  const handleToggleSave = async () => {
    if (!selectedRecipe) return;
    const next = !selectedRecipe.isSaved;
    // Optimistic update
    setRecipes((c) => c.map((r) => r.id === selectedRecipe.id ? { ...r, isSaved: next } : r));
    try {
      const updated = await toggleSaveRecipeRequest(selectedRecipe.id, next);
      setRecipes((c) => c.map((r) => r.id === selectedRecipe.id ? toRecipe(updated) : r));
      showToast(next ? "저장됨" : "저장 해제됨");
    } catch {
      // Rollback
      setRecipes((c) => c.map((r) => r.id === selectedRecipe.id ? { ...r, isSaved: !next } : r));
    }
  };

  const openEdit = () => {
    if (!selectedRecipe) return;
    setDraft({ sourceUrl: selectedRecipe.sourceUrl, sourceType: selectedRecipe.sourceType, title: selectedRecipe.title, ingredientsText: selectedRecipe.ingredientsText, stepsText: selectedRecipe.stepsText, summarySource: selectedRecipe.summarySource });
    setDraftErrors({});
    setScreen("edit");
  };

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    try {
      await deleteRecipeRequest(selectedRecipe.id);
      const remaining = recipes.filter((r) => r.id !== selectedRecipe.id);
      setRecipes(remaining);
      setSelectedRecipeId(remaining[0]?.id ?? "");
      setShowDeleteModal(false);
      setScreen("list");
      showToast("레시피가 삭제되었습니다");
    } catch (err) {
      setRecipesError(err instanceof Error ? err.message : "삭제 실패");
      setShowDeleteModal(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.13_0.003_308)]">
        <div className="flex flex-col items-center gap-3">
          <IcBook className="h-8 w-8 text-primary" />
          <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-[oklch(0.13_0.003_308)]">
      <div className="relative flex h-screen w-full max-w-[390px] flex-col overflow-hidden bg-background shadow-2xl">

        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* ══════════════════════════ AUTH ══════════════════════════ */}
          {screen === "auth" && (
            <div className="flex min-h-screen flex-col justify-center px-7 py-12">
              {/* Logo + heading */}
              <div className="mb-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2.5">
                  <IcBook className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-primary">PantryClip</span>
                </div>
                <div>
                  <h1 className="text-[28px] font-bold leading-tight">
                    {authMode === "sign_in" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {authMode === "sign_in" ? "Sign in to your account to continue" : "Start saving recipe clips as notes."}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <IcMail className="h-[18px] w-[18px] text-muted-foreground" />
                    </div>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="h-[52px] rounded-xl border-0 bg-card pl-11 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Password</Label>
                    {authMode === "sign_in" && (
                      <button type="button" className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                      <IcLock className="h-[18px] w-[18px] text-muted-foreground" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="h-[52px] rounded-xl border-0 bg-card pl-11 pr-11 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-4 flex items-center text-muted-foreground"
                    >
                      {showPassword ? <IcEyeOff className="h-[18px] w-[18px]" /> : <IcEye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>

                {authError  && <p className="text-sm text-destructive">{authError}</p>}
                {authNotice && <p className="text-sm text-muted-foreground">{authNotice}</p>}

                {/* CTA */}
                <Button
                  type="button"
                  className="h-[52px] w-full gap-3 rounded-xl text-[15px] font-bold"
                  disabled={!isReady || authBusy}
                  onClick={() => void handleAuthSubmit()}
                >
                  {authBusy ? "Loading..." : authMode === "sign_in" ? "Login" : "Create Account"}
                  {!authBusy && <IcArrow className="h-4 w-4" />}
                </Button>

                {/* TODO: Google and Apple social login */}
                <Divider label="or continue with" />
                <p className="text-center text-xs text-muted-foreground">Social login coming soon</p>

                <p className="pt-1 text-center text-sm text-muted-foreground">
                  {authMode === "sign_in" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    className="font-bold text-primary"
                    onClick={() => { setAuthMode((m) => m === "sign_in" ? "sign_up" : "sign_in"); setAuthError(""); setAuthNotice(""); }}
                  >
                    {authMode === "sign_in" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ══════════════════════════ LIBRARY ══════════════════════════ */}
          {screen === "list" && (
            <div className="pb-6">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <Logo />
                <div className="flex items-center gap-4">
                  <button type="button" className="text-muted-foreground hover:text-foreground"><IcBell className="h-5 w-5" /></button>
                </div>
              </div>

              <div className="px-5">
                <h1 className="text-[32px] font-bold leading-tight">My Recipes</h1>
                <p className="mt-1 text-sm text-muted-foreground">나만의 요리 컬렉션을 관리하고 새로운 맛을 탐험하세요.</p>

                <Button
                  type="button"
                  className="mt-5 h-12 w-full gap-2 rounded-xl font-bold"
                  onClick={() => { resetDraft(); setScreen("add"); }}
                >
                  <IcPlus className="h-4 w-4" />
                  Add Recipe
                </Button>

                {/* Search */}
                <div className="relative mt-3">
                  <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                    <IcSearch className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-xl border-0 bg-card pl-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                {recipesError && <p className="mt-3 text-sm text-destructive">{recipesError}</p>}

                {/* Recent Recipes header */}
                <div className="mt-6 flex items-center justify-between">
                  <h2 className="text-[17px] font-bold">Recent Recipes</h2>
                  {/* TODO: View All */}
                </div>

                {/* Empty states */}
                {recipes.length === 0 && !recipesError && (
                  <div className="mt-4 rounded-2xl bg-card p-6 text-center">
                    <p className="font-semibold">No recipes yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">링크를 붙여넣어 첫 번째 레시피를 추가해보세요.</p>
                  </div>
                )}
                {recipes.length > 0 && filteredRecipes.length === 0 && (
                  <div className="mt-4 rounded-2xl bg-card p-6 text-center">
                    <p className="font-semibold">No matches</p>
                    <p className="mt-1 text-xs text-muted-foreground">다른 검색어를 사용해보세요.</p>
                  </div>
                )}

                {/* Recipe cards */}
                <div className="mt-4 space-y-4">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className="w-full overflow-hidden rounded-2xl bg-card text-left transition active:scale-[0.98]"
                      onClick={() => { setSelectedRecipeId(recipe.id); setScreen("detail"); }}
                    >
                      {/* TODO: Replace with real recipe image */}
                      <div className="relative h-[160px] w-full">
                        <ImgPlaceholder className="h-full w-full" />
                        <div className="absolute right-3 top-3">
                          <SourceBadge sourceType={recipe.sourceType} summarySource={recipe.summarySource} overlay />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold leading-snug">{recipe.title}</h3>
                        <p className="mt-1 text-[11px] text-muted-foreground">{recipe.updatedAtLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Recipe Tip of the Day */}
                <div className="mt-4 rounded-2xl bg-card p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Recipe Tip of the Day</p>
                  <p className="mt-2 font-bold leading-snug">식재료의 풍미를 극대화하는 시어링 기법</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    고기나 식재료를 높은 온도에서 빠르게 익혀 마이야르 반응을 일으키는 것은 작은 온도에서 삶는 것과의 차이를 결정하는 핵심입니다. 팬을 충분히 예열하는 것부터 시작하세요.
                  </p>
                  <button type="button" className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-primary">
                    <IcUtensils className="h-3.5 w-3.5" />
                    Check Professional Chef Guide
                  </button>
                </div>

                {/* AI Recipe Generator banner */}
                <div className="mt-4 flex items-center justify-between overflow-hidden rounded-2xl bg-primary p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">AI Recipe Generator</p>
                    <p className="mt-1 text-sm font-bold leading-snug text-primary-foreground">당신의 새 레시피를 오늘 AI로 생성해보세요</p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 h-9 rounded-lg px-4 text-xs font-bold"
                      onClick={() => { resetDraft(); setScreen("add"); }}
                    >
                      START NOW
                    </Button>
                  </div>
                  <div className="text-4xl text-primary-foreground/30 select-none">✦</div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════ ADD RECIPE ══════════════════════════ */}
          {screen === "add" && (
            <div className="pb-6">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <Logo />
                <div className="flex items-center gap-4">
                  <button type="button" className="text-muted-foreground"><IcSettings className="h-5 w-5" /></button>
                </div>
              </div>

              <div className="px-5">
                <h1 className="text-[32px] font-bold leading-tight">Add Recipe</h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Add New Recipe</p>
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Current AI Support</p>
                  <p className="mt-1 text-sm font-semibold">YouTube Shorts only</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    AI draft generation currently works only with YouTube Shorts links. Other links can still be saved manually.
                  </p>
                </div>

                {/* ── Paste URL ── */}
                <div className="mt-6">
                  <div className="relative">
                    <Input
                      className="h-12 rounded-xl border-0 bg-card pr-12 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                      placeholder="https://youtube.com/shorts/..."
                      value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <IcLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {urlError && <p className="mt-2 text-sm text-destructive">{urlError}</p>}

                  <Button
                    type="button"
                    className="mt-3 h-12 w-full gap-2.5 rounded-xl text-[15px] font-bold"
                    onClick={() => void handleGenerate()}
                    disabled={isGenerating || isSavingUrlOnly}
                  >
                    <IcBolt className="h-[18px] w-[18px]" />
                    {isGenerating ? toSummarizeStatusLabel(summarizeJobStatus) : "Generate with AI"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 h-12 w-full gap-2.5 rounded-xl text-[15px] font-bold"
                    onClick={() => void handleSaveUrlOnly()}
                    disabled={isGenerating || isSavingUrlOnly}
                  >
                    <IcBookmark className="h-[18px] w-[18px]" />
                    {isSavingUrlOnly ? "Saving URL..." : "Save URL Only"}
                  </Button>

                  {/* Skeleton loading state */}
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

                {/* ── Review Draft (editable form, shown after AI generates) ── */}
                {hasDraft && !isGenerating && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[17px] font-bold">Review Draft</h2>
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1">
                        <IcDot className="h-2 w-2 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Draft</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <input
                          className="h-12 w-full rounded-xl border-0 bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          value={draft.title}
                          onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                          placeholder="레시피 제목"
                        />
                        {draftErrors.title && <p className="text-xs text-destructive">{draftErrors.title}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Ingredients</Label>
                        <IngredientListEditor
                          value={draft.ingredientsText}
                          onChange={(v) => setDraft((c) => ({ ...c, ingredientsText: v }))}
                        />
                        {draftErrors.ingredientsText && <p className="text-xs text-destructive">{draftErrors.ingredientsText}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Preparation</Label>
                        <StepListEditor
                          value={draft.stepsText}
                          onChange={(v) => setDraft((c) => ({ ...c, stepsText: v }))}
                        />
                        {draftErrors.stepsText && <p className="text-xs text-destructive">{draftErrors.stepsText}</p>}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 flex-1 rounded-xl font-bold"
                        onClick={() => { resetDraft(); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="h-12 flex-1 rounded-xl font-bold"
                        onClick={() => void handleSaveAiDraft()}
                      >
                        Save to Library
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════ MANUAL ENTRY (Write Text) ══════════════════════════ */}
          {screen === "review" && (
            <div className="pb-6">
              <div className="flex items-center gap-3 px-5 pt-5 pb-4">
                <button type="button" onClick={() => setScreen("add")} className="text-muted-foreground">
                  <IcLeft className="h-6 w-6" />
                </button>
                <Logo />
              </div>
              <div className="px-5">
                <h1 className="text-2xl font-bold">New Recipe</h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Write manually</p>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Source URL</Label>
                    <Input
                      className="h-12 rounded-xl border-0 bg-card focus-visible:ring-1 focus-visible:ring-primary"
                      value={draft.sourceUrl}
                      onChange={(e) => setDraft((c) => ({ ...c, sourceUrl: e.target.value, sourceType: inferSourceType(e.target.value) }))}
                      placeholder="https://..."
                    />
                    {draftErrors.sourceUrl && <p className="text-xs text-destructive">{draftErrors.sourceUrl}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      className="h-12 rounded-xl border-0 bg-card focus-visible:ring-1 focus-visible:ring-primary"
                      value={draft.title}
                      onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                      placeholder="레시피 제목"
                    />
                    {draftErrors.title && <p className="text-xs text-destructive">{draftErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Ingredients</Label>
                    <IngredientListEditor
                      value={draft.ingredientsText}
                      onChange={(v) => setDraft((c) => ({ ...c, ingredientsText: v }))}
                    />
                    {draftErrors.ingredientsText && <p className="text-xs text-destructive">{draftErrors.ingredientsText}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Preparation</Label>
                    <StepListEditor
                      value={draft.stepsText}
                      onChange={(v) => setDraft((c) => ({ ...c, stepsText: v }))}
                    />
                    {draftErrors.stepsText && <p className="text-xs text-destructive">{draftErrors.stepsText}</p>}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setScreen("add")}>
                    Cancel
                  </Button>
                  <Button type="button" className="h-12 flex-1 rounded-xl font-bold" onClick={() => void handleSaveManual()}>
                    Save to Library
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════ EDIT ══════════════════════════ */}
          {screen === "edit" && (
            <div className="pb-6">
              <div className="flex items-center gap-3 px-5 pt-5 pb-4">
                <button type="button" onClick={() => setScreen("detail")} className="text-muted-foreground">
                  <IcLeft className="h-6 w-6" />
                </button>
                <Logo />
              </div>
              <div className="px-5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Edit Recipe</h1>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Edit</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Source URL</Label>
                    <Input
                      className="h-12 rounded-xl border-0 bg-card focus-visible:ring-1 focus-visible:ring-primary"
                      value={draft.sourceUrl}
                      onChange={(e) => setDraft((c) => ({ ...c, sourceUrl: e.target.value, sourceType: inferSourceType(e.target.value) }))}
                    />
                    {draftErrors.sourceUrl && <p className="text-xs text-destructive">{draftErrors.sourceUrl}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      className="h-12 rounded-xl border-0 bg-card focus-visible:ring-1 focus-visible:ring-primary"
                      value={draft.title}
                      onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                    />
                    {draftErrors.title && <p className="text-xs text-destructive">{draftErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Ingredients</Label>
                    <IngredientListEditor
                      value={draft.ingredientsText}
                      onChange={(v) => setDraft((c) => ({ ...c, ingredientsText: v }))}
                    />
                    {draftErrors.ingredientsText && <p className="text-xs text-destructive">{draftErrors.ingredientsText}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Preparation</Label>
                    <StepListEditor
                      value={draft.stepsText}
                      onChange={(v) => setDraft((c) => ({ ...c, stepsText: v }))}
                    />
                    {draftErrors.stepsText && <p className="text-xs text-destructive">{draftErrors.stepsText}</p>}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setScreen("detail")}>
                    Cancel
                  </Button>
                  <Button type="button" className="h-12 flex-1 rounded-xl font-bold" onClick={() => void handleSaveEdit()}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════ DETAIL ══════════════════════════ */}
          {screen === "detail" && selectedRecipe && (
            <div className="pb-6">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <button type="button" onClick={() => setScreen("list")} className="flex items-center gap-1.5 font-bold text-primary">
                  <IcLeft className="h-5 w-5" />
                  <span className="text-sm">Recipe Details</span>
                </button>
                <div className="flex items-center gap-4">
                  <button type="button" className="text-muted-foreground"><IcShare className="h-5 w-5" /></button>
                  <button
                    type="button"
                    onClick={() => void handleToggleSave()}
                    className={selectedRecipe.isSaved ? "text-primary" : "text-muted-foreground"}
                  >
                    <IcBookmark className={`h-5 w-5 ${selectedRecipe.isSaved ? "fill-primary" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Hero image — TODO: replace with real image */}
              <ImgPlaceholder className="mx-5 h-[220px] rounded-2xl" />

              <div className="mt-5 px-5">
                {/* Badges + meta */}
                <div className="flex items-center justify-between">
                  <SourceBadge sourceType={selectedRecipe.sourceType} summarySource={selectedRecipe.summarySource} />
                  <span className="text-[11px] text-muted-foreground">{selectedRecipe.updatedAtLabel}</span>
                </div>

                <h1 className="mt-3 text-[26px] font-bold leading-tight">{selectedRecipe.title}</h1>

                {/* Clickable source link */}
                <a
                  href={selectedRecipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  <IcLink className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedRecipe.sourceUrl}</span>
                </a>

                {/* TODO: Add nutrition data (calories, protein, carbs) to data model */}

                {/* Ingredients */}
                <div className="mt-6">
                  <Label>Ingredients</Label>
                  {toIngredientItems(selectedRecipe.ingredientsText).length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      {toIngredientItems(selectedRecipe.ingredientsText).map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-card px-4 py-4 text-sm text-muted-foreground">
                      아직 재료가 없습니다. Edit에서 나중에 추가할 수 있어요.
                    </div>
                  )}
                </div>

                {/* Preparation */}
                <div className="mt-6">
                  <Label>Preparation</Label>
                  {toStepItems(selectedRecipe.stepsText).length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {toStepItems(selectedRecipe.stepsText).map((step, i) => (
                        <div key={step} className="flex gap-4 rounded-xl bg-card px-4 py-3.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <p className="flex-1 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-card px-4 py-4 text-sm text-muted-foreground">
                      아직 조리 과정이 없습니다. 링크를 먼저 저장하고 나중에 정리해도 됩니다.
                    </div>
                  )}
                </div>

                {/* Edit / Delete */}
                <div className="mt-6 flex gap-3">
                  <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-bold" onClick={openEdit}>Edit</Button>
                  <Button type="button" variant="destructive" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setShowDeleteModal(true)}>Delete</Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════ SAVED ══════════════════════════ */}
          {screen === "scrap" && (
            <div className="pb-6">
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <Logo />
              </div>
              <div className="px-5">
                <h1 className="text-[32px] font-bold leading-tight">Saved</h1>
                <p className="mt-1 text-sm text-muted-foreground">저장한 레시피 모음입니다.</p>

                {recipes.filter((r) => r.isSaved).length === 0 ? (
                  <div className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
                      <IcBookmark className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">저장된 레시피가 없습니다</p>
                      <p className="mt-1 text-sm text-muted-foreground">레시피 상세 페이지에서 북마크 버튼을 눌러보세요.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {recipes.filter((r) => r.isSaved).map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        className="w-full overflow-hidden rounded-2xl bg-card text-left transition active:scale-[0.98]"
                        onClick={() => { setSelectedRecipeId(recipe.id); setScreen("detail"); }}
                      >
                        <div className="relative h-[140px] w-full">
                          <ImgPlaceholder className="h-full w-full" />
                          <div className="absolute right-3 top-3">
                            <SourceBadge sourceType={recipe.sourceType} summarySource={recipe.summarySource} overlay />
                          </div>
                          <div className="absolute left-3 top-3">
                            <IcBookmark className="h-4 w-4 fill-primary text-primary" />
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold leading-snug">{recipe.title}</h3>
                          <p className="mt-1 text-[11px] text-muted-foreground">{recipe.updatedAtLabel}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════ PROFILE ══════════════════════════ */}
          {screen === "profile" && (
            <div className="pb-8">
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <Logo />
              </div>
              <div className="px-5">
                <div className="flex flex-col items-center py-10">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
                    <IcUser className="h-9 w-9 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-bold">{session?.user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{recipes.length}개의 레시피 저장됨</p>
                </div>
                <Button type="button" variant="outline" className="h-12 w-full rounded-xl font-bold" onClick={() => void signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}

        </div>{/* end scroll area */}

        {/* ── Bottom Nav ── */}
        {!!session && screen !== "auth" && (
          <BottomNav
            activeTab={activeTab}
            onLibrary={() => setScreen("list")}
            onAdd={() => { resetDraft(); setScreen("add"); }}
            onScrap={() => setScreen("scrap")}
            onProfile={() => setScreen("profile")}
          />
        )}

        {/* ── Delete modal ── */}
        {showDeleteModal && selectedRecipe && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60">
            <div className="w-full rounded-t-3xl bg-card p-6 pb-8">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <h2 className="text-lg font-bold">레시피 삭제</h2>
              <p className="mt-2 text-sm text-muted-foreground">&ldquo;{selectedRecipe.title}&rdquo;을 삭제할까요? 되돌릴 수 없습니다.</p>
              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button type="button" variant="destructive" className="h-12 flex-1 rounded-xl font-bold" onClick={() => void handleDelete()}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg">
            {toastMessage}
          </div>
        )}

      </div>
    </div>
  );
}
