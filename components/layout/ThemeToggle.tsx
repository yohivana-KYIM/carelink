"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const THEME_BACKGROUND: Record<"light" | "dark", string> = {
  light: "#f7f9fc",
  dark: "#0a1120",
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag, recommended by next-themes
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const nextTheme: "light" | "dark" = isDark ? "light" : "dark";
    const overlay = overlayRef.current;

    if (prefersReducedMotion() || !overlay) {
      setTheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    gsap.set(overlay, {
      left: x,
      top: y,
      xPercent: -50,
      yPercent: -50,
      backgroundColor: THEME_BACKGROUND[nextTheme],
      scale: 0,
      opacity: 1,
      visibility: "visible",
    });

    gsap
      .timeline({
        onComplete: () => gsap.set(overlay, { visibility: "hidden" }),
      })
      .to(overlay, { scale: radius / 14, duration: 0.58, ease: "expo.inOut" }, "grow")
      .call(() => setTheme(nextTheme), [], "grow+=0.29")
      .to(overlay, { opacity: 0, duration: 0.36, ease: "power2.out" }, "grow+=0.58");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
        aria-pressed={isDark}
        className="relative flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-surface px-1 transition-colors"
      >
        <span
          className={`flex size-6 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm transition-transform duration-300 dark:bg-brand-600 dark:text-white ${
            isDark ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {mounted ? isDark ? <Moon size={13} /> : <Sun size={13} /> : null}
        </span>
      </button>

      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[999] size-7 rounded-full"
        style={{ visibility: "hidden" }}
      />
    </>
  );
}
