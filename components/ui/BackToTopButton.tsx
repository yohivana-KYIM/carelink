"use client";

import { ArrowUp } from "lucide-react";
import { type SVGProps, useEffect, useState } from "react";

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.88 11.71c-.26-.13-1.53-.76-1.77-.84-.24-.08-.42-.13-.6.13-.18.26-.7.84-.86 1.01-.16.17-.32.19-.59.07-.26-.13-1.1-.4-2.09-1.29-.77-.69-1.29-1.53-1.44-1.79-.15-.26-.02-.4.12-.53.13-.13.28-.32.42-.48.14-.16.19-.26.28-.43.09-.17.05-.32-.02-.45-.08-.13-.6-1.43-.82-1.96-.22-.53-.44-.46-.6-.47-.15-.01-.33-.01-.51-.01-.18 0-.46.07-.7.32-.24.24-.94.92-.94 2.25 0 1.32.96 2.6 1.1 2.78.13.17 1.9 2.91 4.61 4.08.64.28 1.14.45 1.53.58.64.22 1.22.19 1.68.12.51-.08 1.53-.62 1.73-1.22.2-.6.2-1.12.14-1.22-.06-.1-.24-.16-.5-.29z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.9.56 3.66 1.52 5.17L2 22l4.98-1.51A9.953 9.953 0 0022 12c0-5.52-4.48-10-10-10zm0 18c-1.53 0-3.02-.37-4.32-1.01l-.31-.17-2.95.9.99-2.71-.2-.35A7.965 7.965 0 014 12c0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8s-3.59 8-8 8z" />
    </svg>
  );
}

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
        <WhatsappIcon className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}
