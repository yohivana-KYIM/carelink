"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { heroChecklist, siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-10 xl:px-16">
      <GeometricDecorations />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-3 lg:grid-cols-[0.95fr_1.1fr]">
        <div className="flex flex-col justify-center gap-7 rounded-[2rem] bg-surface-raised/90 backdrop-blur-sm p-8 shadow-card sm:p-12 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-white text-brand-900 ring-1 ring-white/10 dark:bg-white/10 dark:text-white dark:ring-white/10">
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
            <Button href="/contact" className="hover:!bg-black dark:bg-white dark:text-brand-900 dark:hover:!bg-white/90">Demander une démo</Button>
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
          className="relative min-h-[560px] overflow-hidden rounded-[2rem] bg-brand-800 sm:min-h-[680px] lg:min-h-[760px]"
        >
          <HeroImageCarousel />
        </motion.div>
      </div>
    </section>
  );
}

function HeroImageCarousel() {
  const images = [
    {
      src: "/images/hero-dashboard-app.jpeg",
      alt: "Main tenant un smartphone affichant le tableau de bord Ecotocare",
    },
    {
      src: "/images/rappelpatint.png",
      alt: "Aperçu de l'interface Ecotocare - rappel patient",
    },
    {
      src: "/images/patient.png",
      alt: "Patient confirmant son rendez-vous en un clic depuis WhatsApp",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-brand-950/10">
      <AnimatePresence>
        {images.map(
          (image, index) =>
            index === activeIndex && (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Fond flouté issu de la même image : comble le cadre sans couper le sujet */}
                <Image
                  src={image.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="scale-125 object-cover object-center opacity-70 blur-3xl"
                />
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-contain"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-brand-950/25" />
    </div>
  );
}

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grille de fond géométrique */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
          backgroundSize: '48px 48px' 
        }} 
      />

      {/* Lignes de construction d'ingénierie plus visibles */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="absolute left-[3%] lg:left-[5%] top-0 h-full w-[2px] bg-black/20 dark:bg-white/20 origin-top"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
        className="absolute top-[10%] lg:top-[15%] left-0 w-full h-[2px] bg-black/20 dark:bg-white/20 origin-left"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
        className="absolute bottom-[5%] lg:bottom-[10%] left-0 w-full h-[2px] bg-black/20 dark:bg-white/20 origin-left"
      />

      {/* Motif de ciblage au croisement des lignes (déplacé pour être visible) */}
      <motion.div
        animate={{ rotate: 90 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] lg:top-[15%] left-[3%] lg:left-[5%] -translate-x-1/2 -translate-y-1/2 text-black/50 dark:text-white/50"
      >
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 2v28M2 16h28" />
          <circle cx="16" cy="16" r="8" />
        </svg>
      </motion.div>

      {/* Formes flottantes isométriques (déplacées sur les côtés extrêmes) */}
      <motion.div
        animate={{ 
          y: [0, -30, 0], 
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] right-[2%] lg:right-[5%] text-black/30 dark:text-white/30"
      >
        <svg width="120" height="120" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="20" y="20" width="40" height="40" rx="4" />
          <rect x="28" y="28" width="24" height="24" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 50, 0],
          rotate: [0, -20, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[2%] lg:bottom-[8%] left-[1%] lg:left-[3%] text-black/30 dark:text-white/30"
      >
        <svg width="150" height="150" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="60,10 110,95 10,95" />
          <polygon points="60,35 90,85 30,85" />
        </svg>
      </motion.div>

      {/* Cercles techniques de fond rotatifs (très grands pour dépasser) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -right-[20%] lg:-right-[10%] -top-[20%] text-black/[0.08] dark:text-white/[0.08]"
      >
        <svg width="800" height="800" viewBox="0 0 600 600" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="300" cy="300" r="280" strokeDasharray="10 20" />
          <circle cx="300" cy="300" r="200" strokeDasharray="2 8" />
          <circle cx="300" cy="300" r="120" strokeDasharray="40 10" />
        </svg>
      </motion.div>

      {/* Code-barres décoratif */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-5 right-5 lg:bottom-10 lg:right-10 flex gap-1 items-end opacity-60 dark:opacity-40"
      >
        {[4, 8, 3, 12, 6, 9, 4, 10, 5, 2, 8, 4, 6, 15, 3].map((h, i) => (
          <div key={i} className="w-1.5 bg-black/50 dark:bg-white/50 rounded-t-sm" style={{ height: h * 4 }} />
        ))}
      </motion.div>
    </div>
  );
}
