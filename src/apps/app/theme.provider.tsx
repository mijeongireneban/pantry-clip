"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  resolveStoredTheme,
  type Theme,
  THEME_STORAGE_KEY
} from "@/src/apps/app/theme.shared";

type ThemeContextValue = {
  isDark: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = resolveStoredTheme(
      window.localStorage.getItem(THEME_STORAGE_KEY)
    );

    if (storedTheme) {
      return storedTheme;
    }
  } catch {}

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isDark: theme === "dark",
      theme,
      setTheme(nextTheme) {
        setThemeState(nextTheme);
      },
      toggleTheme() {
        setThemeState((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        );
      }
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
