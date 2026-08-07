"use client";

import Image from "next/image";
import { MessageSquareText, PhoneOff, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    icon: PhoneOff,
    title: "Moins d'appels de relance",
    description:
      "Le rappel part tout seul à J-2 et J-1 : votre secrétaire se concentre sur les cas sans réponse.",
  },
  {
    icon: MessageSquareText,
    title: "Un canal déjà ouvert",
    description:
      "98% des patients consultent WhatsApp chaque jour, contre un SMS souvent ignoré ou un appel manqué.",
  },
  {
    icon: TimerReset,
    title: "Réponse en un tap",
    description:
      "Confirmer ou reporter un rendez-vous se fait en un message, directement depuis la conversation.",
  },
];

export function ValueProp() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2rem] shadow-card lg:order-2 bg-brand-950/10">
          <Image
            src="/images/prise.png"
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 420px, 340px"
            className="scale-125 object-cover object-center opacity-70 blur-3xl"
          />
          <Image
            src="/images/prise.png"
            alt="Pourquoi WhatsApp - Ecotocare"
            fill
            sizes="(min-width: 1024px) 420px, 340px"
            className="object-contain"
          />
        </Reveal>

        <div className="flex flex-col gap-8 lg:order-1">
          <SectionHeading
            align="left"
            eyebrow="Pourquoi WhatsApp"
            title="Plus qu'un simple rappel SMS"
            description="Les appels sans réponse et les SMS ignorés coûtent du temps et des rendez-vous. WhatsApp change la donne : le message est lu, et la réponse du patient met à jour votre dashboard automatiquement."
          />

          <ul className="flex flex-col gap-6">
            {points.map((point, index) => (
              <Reveal key={point.title} delay={index * 0.08}>
                <li className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <point.icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{point.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {point.description}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
