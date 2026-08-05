"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroTileWall } from "@/components/ui/HeroTileWall";
import { heroChecklist, siteConfig } from "@/lib/site-config";

type CtaLink = {
  label: string;
  href: string;
};

export function Hero2({
  badgeLabel = "Nouveau",
  eyebrow = `Découvrez ${siteConfig.name}`,
  title = "Ne manquez plus aucun rendez-vous patient",
  description = `${siteConfig.name} envoie automatiquement les rappels de rendez-vous et relance les patients inactifs par WhatsApp, le canal que vos patients consultent déjà tous les jours.`,
  primaryCta = { label: "Demander une démo", href: "/contact" },
  secondaryCta = { label: "Contacter l'équipe", href: "#comment-ca-marche" },
  checklist = heroChecklist,
  compact = false,
}: {
  badgeLabel?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: CtaLink | null;
  secondaryCta?: CtaLink | null;
  checklist?: ReadonlyArray<string>;
  compact?: boolean;
}) {
  return (
    <section className="px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <HeroTileWall />

        <div
          className={`relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-20 text-center ${
            compact
              ? "min-h-[420px] sm:min-h-[460px] lg:min-h-[520px]"
              : "min-h-[560px] sm:min-h-[640px] lg:min-h-[720px]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-900 dark:bg-white/10 dark:text-white">
              {badgeLabel}
            </span>
            <span className="text-sm font-medium text-white/70">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-xl text-balance text-base leading-relaxed text-white/70 sm:text-lg"
          >
            {description}
          </motion.p>

          {primaryCta || secondaryCta ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              {primaryCta ? (
                <Button href={primaryCta.href}>{primaryCta.label}</Button>
              ) : null}
              {secondaryCta ? (
                <Button
                  href={secondaryCta.href}
                  variant="secondary"
                  className="border-white/25 bg-white/10 text-white hover:border-white hover:bg-white/15 hover:text-white"
                >
                  {secondaryCta.label}
                </Button>
              ) : null}
            </motion.div>
          ) : null}

          {checklist.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2"
            >
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-brand-800">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-white sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
