"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "fr" | "en";

const STORAGE_KEY = "ecotocare_locale";

// Le français est la langue source, écrite directement dans les composants
// (fallback passé à t()). Seul l'anglais est stocké ici — évite de dupliquer
// et de désynchroniser le texte français déjà présent dans le code.
const en: Record<string, string> = {
  // Navbar
  "nav.features": "Features",
  "nav.howItWorks": "How it works",
  "nav.security": "Security",
  "nav.faq": "FAQ",
  "nav.resources": "Resources",
  "nav.contact": "Contact",
  "nav.login": "Sign in",
  "nav.demo": "Request a demo",
  "nav.myAccount": "My account",
  "nav.logout": "Log out",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.notYetAccount": "Don't have an account yet?",
  "nav.createAccount": "Create an account",

  // Hero
  "hero.badge": "New",
  "hero.discover": "Discover {name}",
  "hero.title": "Never miss another patient appointment",
  "hero.subtitle": "{name} automatically sends appointment reminders and re-engages inactive patients via WhatsApp — the channel your patients already check every day.",
  "hero.cta.demo": "Request a demo",
  "hero.cta.contact": "Contact the team",

  // Langue
  "lang.switch": "Switch language",
};

const dictionaries: Record<Locale, Record<string, string>> = { fr: {}, en };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback: string, vars?: Record<string, string>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function interpolate(text: string, vars?: Record<string, string>) {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    text
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratation depuis localStorage, indisponible côté serveur
      setLocaleState(stored);
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }

  function t(key: string, fallback: string, vars?: Record<string, string>) {
    const text = locale === "fr" ? fallback : (dictionaries.en[key] ?? fallback);
    return interpolate(text, vars);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
