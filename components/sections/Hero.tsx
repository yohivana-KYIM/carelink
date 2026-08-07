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
      {/* Halos de couleurs douces (amélioration de la couleur en fond) */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-brand-400/20 dark:bg-brand-500/15 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 right-[5%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/15 rounded-full blur-[100px]"
      />

      {/* Formes originales restaurées, défloutées et mieux animées */}
      <motion.div
        animate={{ 
          y: [0, -40, 0], 
          x: [0, 20, 0],
          rotate: [0, 12, 0], 
          scale: [1, 1.05, 1] 
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -left-16 lg:-top-24 lg:-left-24 w-[350px] lg:w-[550px] opacity-75 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]"
      >
        <Image src="/images/shape-1.png" alt="" width={600} height={600} className="w-full h-auto object-contain" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 50, 0], 
          x: [0, -30, 0], 
          rotate: [0, -15, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-5 right-5 lg:-bottom-10 lg:right-[15%] w-[300px] lg:w-[450px] opacity-75 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]"
      >
        <Image src="/images/shape-2.png" alt="" width={500} height={500} className="w-full h-auto object-contain" />
      </motion.div>
    </div>
  );
}
