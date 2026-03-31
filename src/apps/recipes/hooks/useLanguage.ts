"use client";

import { useEffect, useState } from "react";

import { LANGUAGE_STORAGE_KEY } from "@/src/apps/recipes/ui.constants";
import type { Language } from "@/src/apps/recipes/ui.types";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "ko" || stored === "en") {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language === "ko" ? "ko" : "en";
  }, [language]);

  return { language, setLanguage };
}
