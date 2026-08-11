"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      aria-label={t("lang.switch", "Changer de langue")}
      title={t("lang.switch", "Changer de langue")}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink ${className}`}
    >
      <Languages size={14} />
      {locale === "fr" ? "FR" : "EN"}
    </button>
  );
}
