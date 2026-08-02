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
        { yPercent: 45, opacity: 0 },
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
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none overflow-hidden"
    >
      <span
        ref={wordRef}
        className="block text-center font-extrabold"
        style={{
          fontSize: "clamp(5rem, 27vw, 26rem)",
          lineHeight: 0.78,
          color: "transparent",
          WebkitTextStroke: "1px rgba(90, 149, 222, 0.16)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
