"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/src/lib/auth/supabase-client";

type SignUpResult = "created" | "already_registered";

type AuthContextValue = {
  isReady: boolean;
  isRecoverySession: boolean;
  session: Session | null;
  userEmail: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  requestPasswordReset: (email: string, redirectTo?: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function hasRecoveryParams() {
  if (typeof window === "undefined") {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery" ||
    hashParams.has("access_token")
  );
}

function stripRecoveryHash() {
  if (typeof window === "undefined" || !window.location.hash) {
    return;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  if (!hashParams.has("access_token") && hashParams.get("type") !== "recovery") {
    return;
  }

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}

function isObfuscatedDuplicateSignUp(user: User | null, session: Session | null) {
  if (!user || session) {
    return false;
  }

  // Supabase can return an obfuscated user object for existing confirmed accounts
  // instead of throwing "User already registered", depending on Auth settings.
  // In practice, the documented workaround is that the returned user has no
  // linked identities in that duplicate-account path.
  return (user.identities?.length ?? 0) === 0;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const startedFromRecoveryLink = hasRecoveryParams();

    const bootstrapSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("Supabase session bootstrap failed; clearing local auth state.", error);
          await supabase.auth.signOut({ scope: "local" });
          setIsRecoverySession(false);
          setSession(null);
          setIsReady(true);
          return;
        }

        if (startedFromRecoveryLink && data.session) {
          stripRecoveryHash();
        }

        setIsRecoverySession(startedFromRecoveryLink && Boolean(data.session));
        setSession(data.session);
      } catch (error) {
        console.warn("Unexpected auth bootstrap error; falling back to signed-out state.", error);
        setIsRecoverySession(false);
        setSession(null);
      } finally {
        setIsReady(true);
      }
    };

    void bootstrapSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (event === "PASSWORD_RECOVERY") {
        stripRecoveryHash();
        setIsRecoverySession(true);
      } else if (!nextSession || event === "SIGNED_OUT") {
        setIsRecoverySession(false);
      }

      setSession(nextSession);
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isRecoverySession,
      session,
      userEmail: session?.user.email ?? null,
      async signInWithPassword(email: string, password: string) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      async signUpWithPassword(email: string, password: string) {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            return "already_registered";
          }

          throw error;
        }

        if (isObfuscatedDuplicateSignUp(data.user, data.session)) {
          return "already_registered";
        }

        return "created";
      },
      async signInWithGoogle(redirectTo: string) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            queryParams: {
              prompt: "select_account"
            }
          }
        });

        if (error) {
          throw error;
        }
      },
      async requestPasswordReset(email: string, redirectTo?: string) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo
        });

        if (error) {
          throw error;
        }
      },
      async updatePassword(password: string) {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          throw error;
        }
      },
      async signOut() {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      }
    }),
    [isReady, isRecoverySession, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
