import type { ReactNode } from "react";

export function AppProvider({ children }: { children: ReactNode }) {
  // Add Query/Auth/Theme providers here as the app grows.
  return <>{children}</>;
}
