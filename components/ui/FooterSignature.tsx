"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";

export function FooterSignature({
  text,
  triggerRef,
}: {
  text: string;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !triggerRef.current || !wordRef.current) {
      return;
    }
    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordRef.current,
        { yPercent: 35, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [triggerRef]);

  return (
    <div
      aria-hidden
      className="relative z-0 flex h-28 select-none items-center justify-center overflow-hidden sm:h-44 lg:h-64"
    >
      <span
        ref={wordRef}
        className="block text-center font-extrabold leading-none"
        style={{
          fontSize: "clamp(4rem, 16vw, 14rem)",
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(90, 149, 222, 0.28)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
