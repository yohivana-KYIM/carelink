"use client";

import { Hero2 } from "@/components/sections/Hero2";
import { siteConfig } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n";

export function ContactHero() {
  const { t } = useLocale();
  return (
    <Hero2
      badgeLabel={t("contactHero.badge", "Contact")}
      eyebrow={t("contactHero.eyebrow", "Parlons de votre cabinet")}
      title={t("contactHero.title", "Discutons de vos rendez-vous et relances patients")}
      description={t(
        "contactHero.description",
        `Une question sur ${siteConfig.name}, une démo à planifier ? Écrivez-nous ci-dessous, notre équipe vous répond rapidement.`,
        { name: siteConfig.name }
      )}
      primaryCta={null}
      secondaryCta={null}
      checklist={[]}
      compact
    />
  );
}
