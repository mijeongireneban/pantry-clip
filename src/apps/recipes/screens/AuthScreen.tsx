import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { IcArrow, IcBook, IcEye, IcEyeOff, IcLock, IcMail } from "@/src/apps/recipes/icons";
import { Divider } from "@/src/apps/recipes/components/shared";
import type { Language } from "@/src/apps/recipes/ui.types";
import type { UiCopy } from "@/src/apps/recipes/ui.constants";

type Props = {
  language: Language;
  ui: UiCopy[Language];
  isReady: boolean;
  authMode: "sign_in" | "sign_up";
  authEmail: string;
  authPassword: string;
  authError: string;
  authNotice: string;
  authBusy: boolean;
  showPassword: boolean;
  setAuthEmail: (v: string) => void;
  setAuthPassword: (v: string) => void;
  setShowPassword: (fn: (v: boolean) => boolean) => void;
  setAuthMode: (fn: (m: "sign_in" | "sign_up") => "sign_in" | "sign_up") => void;
  setAuthError: (v: string) => void;
  setAuthNotice: (v: string) => void;
  onSubmit: () => void;
};

export function AuthScreen({
  ui,
  isReady,
  authMode,
  authEmail,
  authPassword,
  authError,
  authNotice,
  authBusy,
  showPassword,
  setAuthEmail,
  setAuthPassword,
  setShowPassword,
  setAuthMode,
  setAuthError,
  setAuthNotice,
  onSubmit
}: Props) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-7 py-12">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2.5">
          <IcBook className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">PantryClip</span>
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-tight">
            {authMode === "sign_in" ? ui.auth.welcomeBack : ui.auth.createAccount}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {authMode === "sign_in"
              ? ui.auth.signInDescription
              : ui.auth.signUpDescription}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {ui.auth.email}
          </p>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <IcMail className="h-[18px] w-[18px] text-muted-foreground" />
            </div>
            <Input
              type="email"
              placeholder="example@email.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="h-[52px] rounded-xl border border-border/70 bg-card pl-11 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {ui.auth.password}
            </p>
            {authMode === "sign_in" && (
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary"
              >
                {ui.auth.forgotPassword}
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
              className="h-[52px] rounded-xl border border-border/70 bg-card pl-11 pr-11 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-4 flex items-center text-muted-foreground"
            >
              {showPassword ? (
                <IcEyeOff className="h-[18px] w-[18px]" />
              ) : (
                <IcEye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>

        {authError && <p className="text-sm text-destructive">{authError}</p>}
        {authNotice && (
          <p className="text-sm text-muted-foreground">{authNotice}</p>
        )}

        <Button
          type="button"
          className="h-[52px] w-full gap-3 rounded-xl text-[15px] font-bold"
          disabled={!isReady || authBusy}
          onClick={onSubmit}
        >
          {authBusy
            ? ui.auth.loading
            : authMode === "sign_in"
              ? ui.auth.login
              : ui.auth.createAccountCta}
          {!authBusy && <IcArrow className="h-4 w-4" />}
        </Button>

        {/* TODO: Google and Apple social login */}
        <Divider label={ui.auth.orContinueWith} />
        <p className="text-center text-xs text-muted-foreground">
          {ui.auth.socialComingSoon}
        </p>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          {authMode === "sign_in"
            ? `${ui.auth.dontHaveAccount} `
            : `${ui.auth.alreadyHaveAccount} `}
          <button
            type="button"
            className="font-bold text-primary"
            onClick={() => {
              setAuthMode((m) => (m === "sign_in" ? "sign_up" : "sign_in"));
              setAuthError("");
              setAuthNotice("");
            }}
          >
            {authMode === "sign_in" ? ui.auth.signUpSwitch : ui.auth.signInSwitch}
          </button>
        </p>
      </div>
    </div>
  );
}
