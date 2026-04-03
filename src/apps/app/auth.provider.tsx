"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/src/lib/auth/supabase-client";

type SignUpResult = "created" | "already_registered";

type AuthContextValue = {
  isReady: boolean;
  session: Session | null;
  userEmail: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const bootstrapSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.warn("Supabase session bootstrap failed; clearing local auth state.", error);
          await supabase.auth.signOut({ scope: "local" });
          setSession(null);
          setIsReady(true);
          return;
        }

        setSession(data.session);
      } catch (error) {
        console.warn("Unexpected auth bootstrap error; falling back to signed-out state.", error);
        setSession(null);
      } finally {
        setIsReady(true);
      }
    };

    void bootstrapSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      isReady,
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
      async signOut() {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      }
    }),
    [isReady, session]
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
