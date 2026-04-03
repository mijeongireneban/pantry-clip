"use client";

import { useMemo } from "react";

import { Button } from "@/src/components/ui/button";

type Language = "ko" | "en";
type OnboardingMode = "gate" | "profile";
type HomeScreenPlatform = "ios_safari" | "android_chrome" | "default";

type HomeScreenOnboardingProps = {
  language: Language;
  mode?: OnboardingMode;
  onDone: () => void;
  onSkip: () => void;
};

const HOME_SCREEN_ONBOARDING_STORAGE_PREFIX =
  "pantryclip-home-screen-onboarding";

function getHomeScreenOnboardingStorageKey(email: string) {
  return `${HOME_SCREEN_ONBOARDING_STORAGE_PREFIX}:${email.trim().toLowerCase()}`;
}

export function hasSeenHomeScreenOnboarding(email: string) {
  if (typeof window === "undefined" || !email.trim()) {
    return true;
  }

  return (
    window.localStorage.getItem(getHomeScreenOnboardingStorageKey(email)) ===
    "seen"
  );
}

export function markHomeScreenOnboardingSeen(email: string) {
  if (typeof window === "undefined" || !email.trim()) {
    return;
  }

  window.localStorage.setItem(
    getHomeScreenOnboardingStorageKey(email),
    "seen"
  );
}

export function isRunningStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function detectHomeScreenPlatform(): HomeScreenPlatform {
  if (typeof window === "undefined") {
    return "default";
  }

  const userAgent = window.navigator.userAgent;
  const isTouchMac =
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1;
  const isIosDevice = /iPhone|iPad|iPod/i.test(userAgent) || isTouchMac;
  const isSafari =
    /Safari/i.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//i.test(userAgent);

  if (isIosDevice && isSafari) {
    return "ios_safari";
  }

  const isAndroid = /Android/i.test(userAgent);
  const isChrome =
    /Chrome\//i.test(userAgent) &&
    !/SamsungBrowser|EdgA|OPR|Firefox/i.test(userAgent);

  if (isAndroid && isChrome) {
    return "android_chrome";
  }

  return "default";
}

const copy = {
  ko: {
    eyebrow: "홈 화면으로 더 빠르게",
    title: "PantryClip을 홈 화면에 추가해보세요",
    description:
      "요리 중에는 브라우저 탭을 다시 찾는 것보다 홈 화면에서 바로 여는 편이 훨씬 편해요.",
    benefits: [
      "레시피 보관함과 저장한 링크를 한 번에 다시 열 수 있어요.",
      "탭을 찾지 않아도 바로 PantryClip로 돌아올 수 있어요.",
      "앱처럼 집중된 화면으로 레시피를 더 빠르게 확인할 수 있어요."
    ],
    stepsEyebrow: "설치 가이드",
    fallbackNote:
      '브라우저마다 문구가 조금 다를 수 있어요. 메뉴에서 "홈 화면에 추가", "앱 설치", "설치" 같은 항목을 찾아보세요.',
    primaryCta: "확인했어요",
    gateSecondaryCta: "나중에 할게요",
    profileSecondaryCta: "프로필로 돌아가기",
    guides: {
      ios_safari: {
        badge: "Safari iPhone",
        title: "Safari 공유 메뉴에서 추가하기",
        description:
          "iPhone Safari에서는 공유 버튼을 열고 홈 화면에 추가를 선택하면 PantryClip을 바로 꺼내 쓸 수 있어요.",
        steps: [
          "Safari 아래쪽의 공유 버튼을 누르세요.",
          '메뉴를 아래로 살짝 내려 "홈 화면에 추가"를 찾으세요.',
          '오른쪽 위의 "추가"를 눌러 홈 화면에 저장하세요.'
        ]
      },
      android_chrome: {
        badge: "Chrome Android",
        title: "Chrome 메뉴에서 설치 또는 추가하기",
        description:
          "Android Chrome에서는 브라우저 메뉴에서 PantryClip을 홈 화면에 바로 추가할 수 있어요.",
        steps: [
          "오른쪽 위의 점 세 개 메뉴를 여세요.",
          '"홈 화면에 추가" 또는 "앱 설치"를 선택하세요.',
          "확인 버튼을 눌러 홈 화면에 PantryClip을 저장하세요."
        ]
      },
      default: {
        badge: "모바일 브라우저",
        title: "브라우저 메뉴에서 홈 화면 옵션 찾기",
        description:
          "사용 중인 브라우저 메뉴에서 PantryClip을 홈 화면에 추가하거나 설치하는 항목을 찾으면 돼요.",
        steps: [
          "브라우저의 공유 버튼이나 메뉴 버튼을 여세요.",
          '"홈 화면에 추가", "앱 설치", "설치"와 비슷한 항목을 찾으세요.',
          "확인하면 홈 화면에서 PantryClip을 바로 열 수 있어요."
        ]
      }
    }
  },
  en: {
    eyebrow: "Faster from your home screen",
    title: "Add PantryClip to your home screen",
    description:
      "When you're cooking, opening PantryClip from your home screen is much easier than hunting for the right browser tab.",
    benefits: [
      "Jump straight back to your recipe library and saved links.",
      "Reopen PantryClip in one tap without searching through tabs.",
      "Use a cleaner app-like view while you cook."
    ],
    stepsEyebrow: "Install guide",
    fallbackNote:
      'The exact wording can vary by browser. Look for options like "Add to Home Screen", "Install app", or "Install" in the browser menu.',
    primaryCta: "Got it",
    gateSecondaryCta: "Maybe later",
    profileSecondaryCta: "Back to Profile",
    guides: {
      ios_safari: {
        badge: "Safari on iPhone",
        title: "Use Safari's share menu",
        description:
          "On iPhone Safari, you can pin PantryClip to your home screen from the share sheet in a few taps.",
        steps: [
          "Tap the Share button in Safari.",
          'Scroll a bit and choose "Add to Home Screen".',
          'Tap "Add" in the top-right corner to save PantryClip.'
        ]
      },
      android_chrome: {
        badge: "Chrome on Android",
        title: "Use Chrome's browser menu",
        description:
          "On Android Chrome, PantryClip can be added from the browser menu as a quick home-screen shortcut.",
        steps: [
          "Open the three-dot menu in the top-right corner.",
          'Choose "Add to Home screen" or "Install app".',
          "Confirm the action to save PantryClip to your home screen."
        ]
      },
      default: {
        badge: "Mobile browser",
        title: "Look in your browser menu",
        description:
          "If you're using a different browser, you can usually add PantryClip from the main menu or share menu.",
        steps: [
          "Open your browser's menu or share sheet.",
          'Look for "Add to Home Screen", "Install app", or "Install".',
          "Confirm the action and PantryClip will be available from your home screen."
        ]
      }
    }
  }
} satisfies Record<
  Language,
  {
    eyebrow: string;
    title: string;
    description: string;
    benefits: string[];
    stepsEyebrow: string;
    fallbackNote: string;
    primaryCta: string;
    gateSecondaryCta: string;
    profileSecondaryCta: string;
    guides: Record<
      HomeScreenPlatform,
      {
        badge: string;
        title: string;
        description: string;
        steps: string[];
      }
    >;
  }
>;

export function HomeScreenOnboarding({
  language,
  mode = "gate",
  onDone,
  onSkip
}: HomeScreenOnboardingProps) {
  const ui = copy[language];
  const platform = useMemo(() => detectHomeScreenPlatform(), []);
  const guide = ui.guides[platform];

  return (
    <div className="pb-8">
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-background to-background px-5 pt-6 pb-8">
        <div className="absolute right-[-2rem] top-[-2rem] h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-[-3rem] top-20 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="inline-flex rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary backdrop-blur-sm">
            {ui.eyebrow}
          </span>
          <h1 className="mt-4 max-w-[14rem] text-[32px] font-bold leading-[1.05] tracking-tight">
            {ui.title}
          </h1>
          <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
            {ui.description}
          </p>
          <div className="mt-6 space-y-2">
            {ui.benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur-sm"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {ui.stepsEyebrow}
              </p>
              <h2 className="mt-1 text-[22px] font-bold leading-tight">
                {guide.title}
              </h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              {guide.badge}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {guide.description}
          </p>

          <div className="mt-5 space-y-3">
            {guide.steps.map((step, index) => (
              <div
                key={step}
                className="flex gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3.5"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {ui.fallbackNote}
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onSkip}
          >
            {mode === "profile" ? ui.profileSecondaryCta : ui.gateSecondaryCta}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl font-bold"
            onClick={onDone}
          >
            {ui.primaryCta}
          </Button>
        </div>
      </div>
    </div>
  );
}
