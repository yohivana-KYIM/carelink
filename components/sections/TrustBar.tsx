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
  brand:   "group-hover:shadow-brand-400/30",
  emerald: "group-hover:shadow-emerald-400/30",
  violet:  "group-hover:shadow-violet-400/30",
  sky:     "group-hover:shadow-sky-400/30",
};

const ringColors: Record<string, string> = {
  brand:   "group-hover:border-brand-400/60",
  emerald: "group-hover:border-emerald-400/60",
  violet:  "group-hover:border-violet-400/60",
  sky:     "group-hover:border-sky-400/60",
};

export function TrustBar() {
  return (
    <section id="securite" className="scroll-mt-24 py-12">
      <Container>
        <div className="rounded-[2rem] border border-border bg-surface-raised p-6 shadow-card">
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
          "group relative overflow-hidden rounded-[1.75rem] border border-white/10",
          "bg-white/5 shadow-sm cursor-pointer select-none",
          "transition-all duration-300",
          ringColors[meta.glow],
          glowColors[meta.glow],
          "hover:shadow-xl",
        ].join(" ")}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onTapStart={() => setHovered(true)}
        onTap={() => setHovered(false)}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        {/* Background image — revealed on hover */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Image
            src={meta.image}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center"
          />
          {/* Color overlay on image */}
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-70`} />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Card content */}
        <div className="relative z-10 flex flex-col gap-4 p-6 h-full min-h-[180px]">
          {/* Icon */}
          <motion.span
            animate={
              hovered
                ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", scale: 1.1 }
                : {}
            }
            transition={{ duration: 0.25 }}
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300`}
          >
            <Icon size={18} />
          </motion.span>

          <div>
            <motion.p
              animate={hovered ? { color: "#fff" } : {}}
              transition={{ duration: 0.25 }}
              className="text-sm font-semibold text-ink"
            >
              {point.title}
            </motion.p>
            <motion.p
              animate={hovered ? { color: "rgba(255,255,255,0.8)" } : {}}
              transition={{ duration: 0.25 }}
              className="mt-2 text-sm leading-relaxed text-ink-soft"
            >
              {point.description}
            </motion.p>
          </div>

          {/* Animated bottom bar */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${meta.accent}`}
            initial={{ width: "0%" }}
            animate={hovered ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </RevealItem>
  );
}
