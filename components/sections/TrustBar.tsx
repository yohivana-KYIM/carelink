"use client";

import Image from "next/image";
import { ShieldCheck, MonitorSmartphone, Lock, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { trustPoints } from "@/lib/site-config";

const cards = [
  {
    icon: ShieldCheck,
    image: "/images/rappelpatint.png",
    accent: "from-brand-600 to-brand-400",
    glow: "brand",
  },
  {
    icon: Lock,
    image: "/images/regle.png",
    accent: "from-emerald-600 to-emerald-400",
    glow: "emerald",
  },
  {
    icon: ThumbsUp,
    image: "/images/prise.png",
    accent: "from-violet-600 to-violet-400",
    glow: "violet",
  },
  {
    icon: MonitorSmartphone,
    image: "/images/hero-dashboard-app.jpeg",
    accent: "from-sky-600 to-sky-400",
    glow: "sky",
  },
];

const glowColors: Record<string, string> = {
  brand:   "group-hover:shadow-brand-400/40",
  emerald: "group-hover:shadow-emerald-400/40",
  violet:  "group-hover:shadow-violet-400/40",
  sky:     "group-hover:shadow-sky-400/40",
};

export function TrustBar() {
  return (
    <section id="securite" className="scroll-mt-24 py-12">
      <Container>
        <div className="rounded-[2rem] border border-border bg-surface-raised p-6 shadow-card sm:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
                API WhatsApp Business (Meta)
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Messagerie sécurisée,{" "}
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                  conforme
                </span>{" "}
                et sans engagement
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Un encadrement clair de votre service : sécurité des données,
              conformité RGPD, et compatibilité sur tous les navigateurs.
            </p>
          </div>

          {/* Cards */}
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, index) => (
              <TrustCard key={point.title} point={point} meta={cards[index % cards.length]} />
            ))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}

function TrustCard({
  point,
  meta,
}: {
  point: { title: string; description: string };
  meta: (typeof cards)[number];
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = meta.icon;

  return (
    <RevealItem>
      <motion.div
        className={[
          "group relative overflow-hidden rounded-[1.75rem] border",
          "cursor-pointer select-none",
          "transition-all duration-500",
          "border-border bg-surface dark:bg-surface-raised",
          glowColors[meta.glow],
          "hover:shadow-2xl",
        ].join(" ")}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onTapStart={() => setHovered(true)}
        onTap={() => setHovered(false)}
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
      >
        {/* Fond image — révélé au hover avec blur décroissant */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.12, filter: "blur(4px)" }}
          animate={
            hovered
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, scale: 1.12, filter: "blur(4px)" }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Image
            src={meta.image}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-75`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </motion.div>

        {/* Lueur d'arrière-plan subtile au repos */}
        <div className={`pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${meta.accent} opacity-[0.07] rounded-[1.75rem]`} />

        {/* Card content */}
        <div className="relative z-10 flex flex-col gap-5 p-6 h-full min-h-[200px]">
          {/* Icône avec fond animé */}
          <motion.span
            animate={
              hovered
                ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff", scale: 1.15, rotate: 8 }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300 shadow-sm"
          >
            <Icon size={20} />
          </motion.span>

          <div className="flex flex-col gap-2 flex-1">
            <motion.p
              animate={hovered ? { color: "#fff" } : {}}
              transition={{ duration: 0.2 }}
              className="text-sm font-bold text-ink leading-snug"
            >
              {point.title}
            </motion.p>
            <motion.p
              animate={hovered ? { color: "rgba(255,255,255,0.82)" } : {}}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed text-ink-soft"
            >
              {point.description}
            </motion.p>
          </div>

          {/* Badge "En savoir plus" apparu au hover */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/80"
          >
            <span className={`h-1 w-4 rounded-full bg-gradient-to-r ${meta.accent}`} />
            Sécurisé &amp; certifié
          </motion.div>

          {/* Barre de progression bas */}
          <motion.div
            className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${meta.accent} rounded-b-[1.75rem]`}
            initial={{ width: "0%" }}
            animate={hovered ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </RevealItem>
  );
}
