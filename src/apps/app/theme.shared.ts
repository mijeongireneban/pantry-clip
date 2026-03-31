export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "pantryclip-theme";

export function resolveStoredTheme(
  value: string | null | undefined
): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getThemeInitScript() {
  return `(() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const root = document.documentElement;

    let storedTheme = null;

    try {
      storedTheme = window.localStorage.getItem(storageKey);
    } catch {}

    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  })();`;
}
