import type { ReactNode } from "react";

import { AuthProvider } from "@/src/apps/app/auth.provider";

export function AppProvider({ children }: { children: ReactNode }) {
  // Add Query/Auth/Theme providers here as the app grows.
  return <AuthProvider>{children}</AuthProvider>;
}
