"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, CalendarClock, Users, Bell, Settings, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: PartyPopper,
    title: "Bienvenue sur Ecotocare 👋",
    description:
      "Quelques étapes rapides pour découvrir votre espace. Vous pouvez passer cette visite à tout moment.",
  },
  {
    icon: LayoutDashboard,
    title: "Vue d'ensemble",
    description:
      "Le tableau de bord affiche vos rendez-vous du jour, vos statistiques et les alertes qui nécessitent votre attention.",
  },
  {
    icon: CalendarClock,
    title: "Rendez-vous & rappels",
    description:
      "Créez des rendez-vous : des rappels WhatsApp automatiques (48h et 24h avant) sont planifiés, et le statut se met à jour selon la réponse du patient.",
  },
  {
    icon: Users,
    title: "Patients",
    description:
      "Gérez votre base de patients, importez/exportez en CSV, et relancez en un clic les patients qui ont dépassé leur délai de soin recommandé.",
  },
  {
    icon: Bell,
    title: "Notifications & aide",
    description:
      "La cloche vous prévient de toute activité importante. Un souci ou une question ? L'icône d'aide en bas à droite est toujours accessible.",
  },
  {
    icon: Settings,
    title: "Paramètres",
    description:
      "Personnalisez votre cabinet (logo, couleurs), vos règles de rappel, et activez la double authentification pour plus de sécurité.",
  },
] as const;

function storageKey(userId: string) {
  return `ecotocare_onboarding_seen_${userId}`;
}

export function OnboardingTour({ userId }: { userId: string | undefined }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const seen = window.localStorage.getItem(storageKey(userId));
    if (!seen) setVisible(true);
  }, [userId]);

  function dismiss() {
    if (userId) window.localStorage.setItem(storageKey(userId), "1");
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md rounded-3xl bg-surface-raised p-8 shadow-2xl"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <Icon size={22} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">{current.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{current.description}</p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-brand-600" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={dismiss}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Passer
            </button>
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.97]"
            >
              {isLast ? "Terminer" : "Continuer"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
