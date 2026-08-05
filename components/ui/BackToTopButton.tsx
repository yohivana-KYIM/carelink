"use client";

import { ArrowUp, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1));
      setVisible(scrollTop > 480);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className={`fixed bottom-6 right-4 z-40 flex items-center gap-3 rounded-full bg-surface-raised p-2 shadow-card transition-all duration-300 sm:right-6 lg:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut de page"
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-background text-ink-muted transition-colors duration-300 hover:text-brand-600 dark:hover:text-brand-400"
      >
        <svg
          aria-hidden
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-border"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="stroke-brand-600 transition-[stroke-dashoffset] duration-150 ease-linear dark:stroke-brand-400"
          />
        </svg>
        <ArrowUp size={18} className="relative" />
      </button>

      <a
        href="https://wa.me/237659037423?text=Bonjour%20Carelink%2C%20j%27ai%20besoin%20d%27une%20d%C3%A9mo%20et%20d%27informations.%20Pouvez-vous%20m%20aider%20%3F"
        target="_blank"
        rel="noreferrer"
        className="flex h-11 items-center gap-2 rounded-full bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition-colors duration-300 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20"
      >
        <MessageSquare size={16} />
        WhatsApp
      </a>
    </div>
  );
}
