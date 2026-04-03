"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/src/apps/app/auth.provider";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

type Language = "ko" | "en";

const LANGUAGE_STORAGE_KEY = "pantryclip-language";

const copy = {
  ko: {
    loading: "비밀번호 재설정 화면을 준비하는 중...",
    title: "새 비밀번호 설정",
    recoveryDescription:
      "이제 PantryClip에서 사용할 새 비밀번호를 입력해주세요.",
    signedInDescription:
      "로그인된 상태입니다. 여기서 비밀번호를 새로 설정할 수 있어요.",
    invalidDescription:
      "이 재설정 링크는 유효하지 않거나 만료되었습니다. 로그인 화면에서 다시 요청해주세요.",
    emailLabel: "계정 이메일",
    newPassword: "새 비밀번호",
    confirmPassword: "새 비밀번호 확인",
    passwordRequired: "새 비밀번호를 입력해주세요.",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    submit: "비밀번호 업데이트",
    updating: "업데이트 중...",
    success:
      "비밀번호가 업데이트되었습니다. 잠시 후 PantryClip로 이동합니다.",
    backToSignIn: "로그인으로 돌아가기",
    continueToApp: "PantryClip로 이동"
  },
  en: {
    loading: "Preparing your password reset...",
    title: "Set a new password",
    recoveryDescription: "Choose a new password for your PantryClip account.",
    signedInDescription:
      "You're signed in already, so you can update your password here.",
    invalidDescription:
      "This reset link is invalid or has expired. Please request a new one from the sign-in screen.",
    emailLabel: "Account email",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    passwordRequired: "Please enter a new password.",
    passwordMismatch: "Passwords do not match.",
    submit: "Update Password",
    updating: "Updating...",
    success: "Your password was updated. Redirecting you back to PantryClip.",
    backToSignIn: "Back to Sign In",
    continueToApp: "Continue to PantryClip"
  }
} satisfies Record<
  Language,
  {
    loading: string;
    title: string;
    recoveryDescription: string;
    signedInDescription: string;
    invalidDescription: string;
    emailLabel: string;
    newPassword: string;
    confirmPassword: string;
    passwordRequired: string;
    passwordMismatch: string;
    submit: string;
    updating: string;
    success: string;
    backToSignIn: string;
    continueToApp: string;
  }
>;

export function ResetPasswordContainer() {
  const router = useRouter();
  const { isReady, isRecoverySession, session, updatePassword } = useAuth();
  const [language, setLanguage] = useState<Language>("en");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (stored === "ko" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "ko" ? "ko" : "en";
  }, [language]);

  const ui = copy[language];
  const canUpdatePassword = Boolean(session);

  const handleSubmit = async () => {
    setError("");
    setNotice("");

    if (!password.trim()) {
      setError(ui.passwordRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(ui.passwordMismatch);
      return;
    }

    setIsBusy(true);

    try {
      await updatePassword(password);
      setNotice(ui.success);
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => router.push("/"), 1200);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : ui.invalidDescription);
    } finally {
      setIsBusy(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/60 px-6">
        <p className="text-sm text-muted-foreground">{ui.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-6 py-12">
      <Card className="w-full max-w-md border-border/70 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{ui.title}</CardTitle>
          <CardDescription>
            {canUpdatePassword
              ? isRecoverySession
                ? ui.recoveryDescription
                : ui.signedInDescription
              : ui.invalidDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {!canUpdatePassword ? (
            <Button className="w-full" onClick={() => router.push("/")}>
              {ui.backToSignIn}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="reset-email">{ui.emailLabel}</Label>
                <Input
                  id="reset-email"
                  value={session?.user.email ?? ""}
                  disabled
                  className="bg-muted/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{ui.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{ui.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={isBusy}
                  onClick={() => void handleSubmit()}
                >
                  {isBusy ? ui.updating : ui.submit}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  {ui.continueToApp}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
