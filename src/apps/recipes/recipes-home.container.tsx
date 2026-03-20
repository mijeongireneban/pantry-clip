"use client";

import { useEffect, useMemo, useState } from "react";

import type { RecipeDto } from "@/src/apis/@types/recipes";
import {
  createRecipe as createRecipeRequest,
  deleteRecipe as deleteRecipeRequest,
  listRecipes as listRecipesRequest,
  summarizeRecipe as summarizeRecipeRequest,
  updateRecipe as updateRecipeRequest
} from "@/src/apis/recipes";
import { useAuth } from "@/src/apps/app/auth.provider";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

// ---------- Types ----------

type SourceType = "youtube_shorts" | "instagram_reels" | "other";
type SummarySource = "manual" | "ai";
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

// ---------- Helpers ----------

function inferSourceType(sourceUrl: string): SourceType {
  const n = sourceUrl.toLowerCase();
  if (n.includes("youtube.com/shorts") || n.includes("youtu.be/")) return "youtube_shorts";
  if (n.includes("instagram.com/reel")) return "instagram_reels";
  return "other";
}

function sourceBadgeLabel(t: SourceType) {
  if (t === "youtube_shorts") return "YouTube";
  if (t === "instagram_reels") return "Instagram";
  return "Manual";
}

function toIngredientItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
}

function toStepItems(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
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
  return new Date(updatedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
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
    updatedAtLabel: toUpdatedAtLabel(dto.updatedAt)
  };
}

// ---------- Icons ----------

function IcBook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IcSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IcBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IcSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IcLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IcBolt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function IcPen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IcCamera({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IcLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IcShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IcBookmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IcPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IcUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IcMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IcLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IcEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IcEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IcArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IcUtensils({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

// ---------- Small shared components ----------

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <IcBook className="h-5 w-5 text-primary" />
      <span className="text-base font-bold tracking-tight text-primary">PantryClip</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

function TopBar({
  onBack,
  right
}: {
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      {onBack ? (
        <button type="button" onClick={onBack} className="flex items-center gap-1 font-semibold text-primary">
          <IcLeft className="h-5 w-5" />
          <span className="text-sm">Recipe Details</span>
        </button>
      ) : (
        <Logo />
      )}
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}

function BottomNav({
  activeTab,
  onLibrary,
  onAdd,
  onScrap,
  onProfile
}: {
  activeTab: Tab;
  onLibrary: () => void;
  onAdd: () => void;
  onScrap: () => void;
  onProfile: () => void;
}) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; action: () => void }[] = [
    { id: "library", label: "Library", icon: <IcBook className="h-5 w-5" />, action: onLibrary },
    { id: "add", label: "Add", icon: <IcPlus className="h-5 w-5" />, action: onAdd },
    { id: "scrap", label: "Scrap", icon: <IcBookmark className="h-5 w-5" />, action: onScrap },
    { id: "profile", label: "Profile", icon: <IcUser className="h-5 w-5" />, action: onProfile }
  ];

  return (
    <div className="flex items-end justify-around border-t border-border bg-card pb-safe px-2 pt-2">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const isAdd = tab.id === "add";
        return (
          <button
            key={tab.id}
            type="button"
            className="flex flex-col items-center gap-1 px-4 py-1"
            onClick={tab.action}
          >
            {isAdd ? (
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`}
              >
                <span className={active ? "text-primary-foreground" : "text-muted-foreground"}>{tab.icon}</span>
              </div>
            ) : (
              <span className={active ? "text-primary" : "text-muted-foreground"}>{tab.icon}</span>
            )}
            <span
              className={`text-[9px] font-semibold uppercase tracking-widest transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Main container ----------

export function RecipesHomeContainer() {
  const { isReady, session, signInWithPassword, signOut, signUpWithPassword } = useAuth();
  const [screen, setScreen] = useState<Screen>("auth");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authMode, setAuthMode] = useState<"sign_in" | "sign_up">("sign_in");
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [recipesError, setRecipesError] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof RecipeDraft, string>>>({});
  const [toastMessage, setToastMessage] = useState("");
  const [draft, setDraft] = useState<RecipeDraft>({
    sourceUrl: "",
    sourceType: "other",
    title: "",
    ingredientsText: "",
    stepsText: "",
    summarySource: "ai"
  });

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => r.title.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  const activeTab = useMemo<Tab>(() => {
    if (["list", "detail", "edit"].includes(screen)) return "library";
    if (["add"].includes(screen)) return "add";
    if (screen === "scrap") return "scrap";
    if (screen === "profile") return "profile";
    return "library";
  }, [screen]);

  useEffect(() => {
    if (!isReady) return;
    if (session) {
      setScreen((cur) => (cur === "auth" ? "list" : cur));
      return;
    }
    setScreen("auth");
  }, [isReady, session]);

  useEffect(() => {
    if (!isReady || !session) {
      setRecipes([]);
      setSelectedRecipeId("");
      return;
    }
    void (async () => {
      try {
        setRecipesError("");
        const res = await listRecipesRequest();
        const items = res.items.map(toRecipe);
        setRecipes(items);
        setSelectedRecipeId((cur) => cur || items[0]?.id || "");
      } catch (err) {
        setRecipesError(err instanceof Error ? err.message : "Failed to load recipes.");
      }
    })();
  }, [isReady, session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  const handleAuthSubmit = async () => {
    setAuthError("");
    setAuthNotice("");
    setAuthBusy(true);
    try {
      if (authMode === "sign_up") {
        await signUpWithPassword(authEmail.trim(), authPassword);
        setAuthNotice("Account created. Check your email to confirm before signing in.");
        setAuthPassword("");
        return;
      }
      await signInWithPassword(authEmail.trim(), authPassword);
      setScreen("list");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const resetDraft = () => {
    setDraft({ sourceUrl: "", sourceType: "other", title: "", ingredientsText: "", stepsText: "", summarySource: "manual" });
    setDraftErrors({});
    setAddUrl("");
    setUrlError("");
  };

  const handleGenerate = async () => {
    const sourceUrl = addUrl.trim();
    if (!sourceUrl) { setUrlError("URL을 입력해주세요."); return; }
    if (!/^https?:\/\//i.test(sourceUrl)) { setUrlError("http:// 또는 https://로 시작하는 URL을 입력해주세요."); return; }
    setUrlError("");
    setIsGeneratingDraft(true);
    try {
      const res = await summarizeRecipeRequest({ sourceUrl });
      setDraft({ sourceUrl, sourceType: res.sourceType, title: res.titleDraft, ingredientsText: res.ingredientsDraft, stepsText: res.stepsDraft, summarySource: "ai" });
      setDraftErrors({});
      setScreen("review");
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "AI 초안 생성에 실패했습니다. 다시 시도하거나 직접 입력해주세요.");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const created = await createRecipeRequest({
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });
      const next = toRecipe(created);
      setRecipes((cur) => [next, ...cur]);
      setSelectedRecipeId(next.id);
      setScreen("detail");
      showToast("레시피가 저장되었습니다");
      resetDraft();
    } catch (err) {
      setDraftErrors((cur) => ({ ...cur, title: err instanceof Error ? err.message : "저장 실패" }));
    }
  };

  const handleSaveEdit = async () => {
    const errors = validateDraft(draft);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0 || !selectedRecipe) return;
    try {
      const updated = await updateRecipeRequest(selectedRecipe.id, {
        sourceUrl: draft.sourceUrl.trim(),
        sourceType: draft.sourceType,
        title: draft.title.trim(),
        ingredientsText: draft.ingredientsText.trim(),
        stepsText: draft.stepsText.trim(),
        summarySource: draft.summarySource
      });
      const next = toRecipe(updated);
      setRecipes((cur) => cur.map((r) => (r.id === selectedRecipe.id ? next : r)));
      setSelectedRecipeId(next.id);
      setScreen("detail");
      showToast("레시피가 수정되었습니다");
    } catch (err) {
      setDraftErrors((cur) => ({ ...cur, title: err instanceof Error ? err.message : "수정 실패" }));
    }
  };

  const openEdit = () => {
    if (!selectedRecipe) return;
    setDraft({
      sourceUrl: selectedRecipe.sourceUrl,
      sourceType: selectedRecipe.sourceType,
      title: selectedRecipe.title,
      ingredientsText: selectedRecipe.ingredientsText,
      stepsText: selectedRecipe.stepsText,
      summarySource: selectedRecipe.summarySource
    });
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

  const showBottomNav = !!session && screen !== "auth";

  return (
    /* Outer shell — always centers a 390px column */
    <div className="flex min-h-screen justify-center bg-[oklch(0.13_0.003_308)]">
      <div className="relative flex h-screen w-full max-w-[390px] flex-col overflow-hidden bg-background shadow-2xl">

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* ── AUTH ── */}
          {screen === "auth" && (
            <div className="flex min-h-full flex-col justify-center px-6 py-12">
              <div className="mb-8 flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-2">
                  <IcBook className="h-7 w-7 text-primary" />
                  <span className="text-2xl font-bold text-primary">PantryClip</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {authMode === "sign_in" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {authMode === "sign_in"
                      ? "Sign in to your account to continue"
                      : "Start saving recipe clips as structured notes."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <SectionLabel>Email</SectionLabel>
                  <div className="relative">
                    <IcMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 rounded-xl border-transparent bg-card pl-10 focus-visible:border-primary focus-visible:ring-0"
                      placeholder="example@email.com"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Password</SectionLabel>
                    {authMode === "sign_in" && (
                      <button type="button" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <IcLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-12 rounded-xl border-transparent bg-card pl-10 pr-10 focus-visible:border-primary focus-visible:ring-0"
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <IcEyeOff className="h-4 w-4" /> : <IcEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authError && <p className="text-sm text-destructive">{authError}</p>}
                {authNotice && <p className="text-sm text-muted-foreground">{authNotice}</p>}

                <Button
                  className="h-12 w-full gap-2 rounded-xl text-base font-bold"
                  onClick={() => void handleAuthSubmit()}
                  disabled={!isReady || authBusy}
                  type="button"
                >
                  {!isReady ? "Loading..." : authBusy ? "Working..." : authMode === "sign_in" ? "Login" : "Create Account"}
                  {!authBusy && <IcArrow className="h-4 w-4" />}
                </Button>

                {/* TODO: Add Google and Apple social login */}

                <p className="text-center text-sm text-muted-foreground">
                  {authMode === "sign_in" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    className="font-semibold text-primary"
                    onClick={() => {
                      setAuthMode((m) => (m === "sign_in" ? "sign_up" : "sign_in"));
                      setAuthError("");
                      setAuthNotice("");
                    }}
                  >
                    {authMode === "sign_in" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ── LIBRARY ── */}
          {screen === "list" && (
            <div className="pb-4">
              <TopBar
                right={
                  <>
                    <button type="button" className="text-muted-foreground"><IcSearch className="h-5 w-5" /></button>
                    <button type="button" className="text-muted-foreground"><IcBell className="h-5 w-5" /></button>
                  </>
                }
              />

              <div className="px-5">
                <h1 className="text-3xl font-bold">My Recipes</h1>
                <p className="mt-1 text-sm text-muted-foreground">나만의 요리 컬렉션을 관리하고 새로운 맛을 탐험하세요.</p>

                <Button
                  className="mt-4 h-12 w-full gap-2 rounded-xl font-semibold"
                  onClick={() => { resetDraft(); setScreen("add"); }}
                  type="button"
                >
                  <IcPlus className="h-4 w-4" />
                  Add Recipe
                </Button>

                <div className="relative mt-3">
                  <IcSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-11 rounded-xl border-transparent bg-card pl-10 focus-visible:border-primary focus-visible:ring-0"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {recipesError && <p className="mt-3 text-sm text-destructive">{recipesError}</p>}

                <div className="mt-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Recent Recipes</h2>
                  {/* TODO: View All page */}
                </div>

                {recipes.length === 0 && !recipesError && (
                  <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center">
                    <p className="font-semibold">No recipes yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">링크를 붙여넣어 첫 번째 레시피를 추가해보세요.</p>
                  </div>
                )}

                {recipes.length > 0 && filteredRecipes.length === 0 && (
                  <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center">
                    <p className="font-semibold">No matches</p>
                    <p className="mt-1 text-xs text-muted-foreground">다른 검색어를 사용해보세요.</p>
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      className="w-full rounded-2xl bg-card p-4 text-left transition hover:ring-1 hover:ring-primary/50 active:scale-[0.98]"
                      onClick={() => { setSelectedRecipeId(recipe.id); setScreen("detail"); }}
                    >
                      {/* TODO: Recipe hero image */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                              {sourceBadgeLabel(recipe.sourceType)}
                            </Badge>
                            {recipe.summarySource === "ai" && (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">AI</span>
                            )}
                          </div>
                          <h3 className="mt-1.5 font-semibold leading-snug">{recipe.title}</h3>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{recipe.updatedAtLabel}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Recipe Tip of the Day */}
                <div className="mt-6 rounded-2xl bg-card p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Recipe Tip of the Day</p>
                  <p className="mt-2 font-semibold leading-snug">재료의 풍미를 극대화하는 시어링 기법</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    고기나 식재료를 높은 온도에서 빠르게 익혀 마이야르 반응을 일으키는 것은 맛의 깊이를 결정하는 핵심입니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD RECIPE ── */}
          {screen === "add" && (
            <div className="pb-4">
              <TopBar
                right={
                  <>
                    <button type="button" className="text-muted-foreground"><IcSearch className="h-5 w-5" /></button>
                    <button type="button" className="text-muted-foreground"><IcSettings className="h-5 w-5" /></button>
                  </>
                }
              />

              <div className="px-5">
                <h1 className="text-3xl font-bold">Add Recipe</h1>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Add New Recipe
                </p>

                {/* Section 01 */}
                <div className="mt-6">
                  <SectionLabel>Section 01 / Paste URL</SectionLabel>
                  <div className="relative mt-2">
                    <Input
                      className="h-12 rounded-xl border-transparent bg-card pr-10 focus-visible:border-primary focus-visible:ring-0"
                      placeholder="https://recipe-link.com/..."
                      value={addUrl}
                      onChange={(e) => setAddUrl(e.target.value)}
                    />
                    <IcLink className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {urlError && <p className="mt-1.5 text-sm text-destructive">{urlError}</p>}

                  <Button
                    className="mt-3 h-12 w-full gap-2 rounded-xl text-base font-bold"
                    onClick={() => void handleGenerate()}
                    disabled={isGeneratingDraft}
                    type="button"
                  >
                    <IcBolt className="h-4 w-4" />
                    {isGeneratingDraft ? "Generating..." : "Generate with AI"}
                  </Button>

                  {isGeneratingDraft && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-card px-4 py-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-sm italic text-muted-foreground">Analyzing flavor profile...</p>
                    </div>
                  )}
                </div>

                {/* Section 02 */}
                <div className="mt-8">
                  <SectionLabel>Section 02 / Create Manually</SectionLabel>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="rounded-2xl bg-card p-4 text-left transition hover:ring-1 hover:ring-primary/50 active:scale-[0.98]"
                      onClick={() => {
                        setDraft({ sourceUrl: "", sourceType: "other", title: "", ingredientsText: "", stepsText: "", summarySource: "manual" });
                        setDraftErrors({});
                        setScreen("review");
                      }}
                    >
                      <IcPen className="h-5 w-5 text-primary" />
                      <p className="mt-2 text-sm font-semibold">Write Text</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Manual recipe input</p>
                    </button>

                    {/* TODO: Implement photo scan */}
                    <div className="rounded-2xl bg-card p-4 opacity-40">
                      <IcCamera className="h-5 w-5 text-primary" />
                      <p className="mt-2 text-sm font-semibold">Scan Photo</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── REVIEW / EDIT ── */}
          {(screen === "review" || screen === "edit") && (
            <div className="pb-4">
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setScreen(screen === "review" ? "add" : "detail")}
                  className="text-muted-foreground"
                >
                  <IcLeft className="h-6 w-6" />
                </button>
                <Logo />
              </div>

              <div className="px-5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{screen === "review" ? "Review Draft" : "Edit Recipe"}</h1>
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    {screen === "review" ? "Draft" : "Edit"}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <SectionLabel>Source URL</SectionLabel>
                    <Input
                      className="h-11 rounded-xl border-transparent bg-card focus-visible:border-primary focus-visible:ring-0"
                      value={draft.sourceUrl}
                      onChange={(e) => setDraft((c) => ({ ...c, sourceUrl: e.target.value, sourceType: inferSourceType(e.target.value) }))}
                      placeholder="https://..."
                    />
                    {draftErrors.sourceUrl && <p className="text-xs text-destructive">{draftErrors.sourceUrl}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <SectionLabel>Title</SectionLabel>
                    <Input
                      className="h-11 rounded-xl border-transparent bg-card focus-visible:border-primary focus-visible:ring-0"
                      value={draft.title}
                      onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))}
                      placeholder="레시피 제목"
                    />
                    {draftErrors.title && <p className="text-xs text-destructive">{draftErrors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <SectionLabel>Ingredients</SectionLabel>
                    <Textarea
                      className="min-h-[140px] rounded-xl border-transparent bg-card focus-visible:border-primary focus-visible:ring-0"
                      value={draft.ingredientsText}
                      onChange={(e) => setDraft((c) => ({ ...c, ingredientsText: e.target.value }))}
                    />
                    {draftErrors.ingredientsText && <p className="text-xs text-destructive">{draftErrors.ingredientsText}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <SectionLabel>Preparation</SectionLabel>
                    <Textarea
                      className="min-h-[180px] rounded-xl border-transparent bg-card focus-visible:border-primary focus-visible:ring-0"
                      value={draft.stepsText}
                      onChange={(e) => setDraft((c) => ({ ...c, stepsText: e.target.value }))}
                    />
                    {draftErrors.stepsText && <p className="text-xs text-destructive">{draftErrors.stepsText}</p>}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-xl font-bold"
                    onClick={() => setScreen(screen === "review" ? "add" : "detail")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-12 flex-1 rounded-xl font-bold"
                    onClick={() => void (screen === "review" ? handleSaveDraft() : handleSaveEdit())}
                    type="button"
                  >
                    Save to Library
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── DETAIL ── */}
          {screen === "detail" && selectedRecipe && (
            <div className="pb-4">
              <TopBar
                onBack={() => setScreen("list")}
                right={
                  <>
                    <button type="button" className="text-muted-foreground"><IcShare className="h-5 w-5" /></button>
                    <button type="button" className="text-muted-foreground"><IcBookmark className="h-5 w-5" /></button>
                  </>
                }
              />

              {/* TODO: Recipe hero image — add image_url to data model */}
              <div className="mx-5 h-52 rounded-2xl bg-gradient-to-br from-muted/60 to-card" />

              <div className="mt-4 px-5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 text-[10px] uppercase tracking-wide text-primary">
                    {sourceBadgeLabel(selectedRecipe.sourceType)}
                  </Badge>
                  {selectedRecipe.summarySource === "ai" && (
                    <Badge variant="outline" className="border-primary/30 text-[10px] uppercase tracking-wide text-primary">
                      AI
                    </Badge>
                  )}
                </div>

                <h1 className="mt-2 text-2xl font-bold leading-tight">{selectedRecipe.title}</h1>
                <p className="mt-1 break-all text-xs text-muted-foreground">{selectedRecipe.sourceUrl}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{selectedRecipe.updatedAtLabel}</p>

                {/* TODO: Add nutrition data to data model (calories, protein, carbs) */}

                {/* Ingredients */}
                <div className="mt-6">
                  <SectionLabel>Ingredients</SectionLabel>
                  <div className="mt-3 space-y-0 divide-y divide-border">
                    {toIngredientItems(selectedRecipe.ingredientsText).map((item) => (
                      <div key={item} className="py-2.5">
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation */}
                <div className="mt-6">
                  <SectionLabel>Preparation</SectionLabel>
                  <div className="mt-3 space-y-4">
                    {toStepItems(selectedRecipe.stepsText).map((step, i) => (
                      <div key={step} className="flex gap-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="h-12 flex-1 rounded-xl font-bold" onClick={openEdit} type="button">
                    Edit
                  </Button>
                  <Button variant="destructive" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setShowDeleteModal(true)} type="button">
                    Delete
                  </Button>
                </div>

                {/* TODO: Implement cooking mode */}
                <Button className="mt-3 h-12 w-full gap-2 rounded-xl font-bold" type="button" disabled>
                  <IcUtensils className="h-4 w-4" />
                  Start Cooking Mode
                </Button>
              </div>
            </div>
          )}

          {/* ── SCRAP (coming soon) ── */}
          {screen === "scrap" && (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card">
                <IcBookmark className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-4 text-xl font-bold">Scrap</h2>
              <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">
                나중에 시도해볼 레시피를 스크랩하세요. 곧 출시됩니다.
              </p>
            </div>
          )}

          {/* ── PROFILE ── */}
          {screen === "profile" && (
            <div className="pb-4">
              <TopBar />
              <div className="px-5">
                <div className="flex flex-col items-center py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <IcUser className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-semibold">{session?.user.email}</p>
                  <p className="text-xs text-muted-foreground">{recipes.length}개의 레시피 저장됨</p>
                </div>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl font-semibold"
                  onClick={() => void signOut()}
                  type="button"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        {showBottomNav && (
          <BottomNav
            activeTab={activeTab}
            onLibrary={() => setScreen("list")}
            onAdd={() => { resetDraft(); setScreen("add"); }}
            onScrap={() => setScreen("scrap")}
            onProfile={() => setScreen("profile")}
          />
        )}

        {/* ── DELETE MODAL ── */}
        {showDeleteModal && selectedRecipe && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
            <div className="w-full rounded-2xl bg-card p-6">
              <h2 className="text-lg font-bold">레시피 삭제</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                "{selectedRecipe.title}"을 삭제할까요? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="mt-5 flex gap-3">
                <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setShowDeleteModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="destructive" className="h-11 flex-1 rounded-xl" onClick={() => void handleDelete()} type="button">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toastMessage && (
          <div className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
