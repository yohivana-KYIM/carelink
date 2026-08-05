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

function ImageCarousel() {
  const images = [
    {
      src: "/images/dental-office.jpeg",
      alt: "Salle de soins dentaires avec pictogrammes de calendrier et de carte de rendez-vous",
    },
    { src: "/images/relance.jpeg", alt: "Patient recevant un rappel de rendez-vous" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {images.map(
          (img, i) =>
            i === index && (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 420px, 340px"
                  className="object-cover"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}

export function ValueProp() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative mx-auto aspect-[768/1376] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-card lg:order-2">
          <ImageCarousel />
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
