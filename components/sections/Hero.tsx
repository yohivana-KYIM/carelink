"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { heroChecklist, siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-7 rounded-[2rem] bg-surface-raised p-8 shadow-card sm:p-12 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-ink">
              Nouveau
            </span>
            <span className="text-sm font-medium text-ink-muted">
              Découvrez {siteConfig.name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]"
          >
            Ne manquez plus aucun rendez-vous patient
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md text-balance text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {siteConfig.name} envoie automatiquement les rappels de
            rendez-vous et relance les patients inactifs par WhatsApp, le
            canal que vos patients consultent déjà tous les jours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="/contact">Demander une démo</Button>
            <Button href="#comment-ca-marche" variant="secondary">
              Contacter l&apos;équipe
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-3 pt-2"
          >
            {heroChecklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-sm font-medium text-ink sm:text-base">
                  {item}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 sm:min-h-[600px] lg:min-h-[680px]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.2),transparent_38%)]" />
          <motion.div
            initial={{ opacity: 0, y: 28, rotate: 1.5, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: [0, -16, 0],
              rotate: [0, -1, 0],
              scale: [1, 1.015, 1],
            }}
            transition={{
              opacity: { duration: 0.55, delay: 0.25 },
              y: { duration: 6, delay: 0.8, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, delay: 0.8, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 6, delay: 0.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute inset-0 p-4 sm:p-6 lg:p-8"
          >
            <Image
              src="/images/hero-dashboard-app.jpeg"
              alt="Main tenant un smartphone affichant le tableau de bord Carelink : rendez-vous du jour, taux de confirmation et liste des patients"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
