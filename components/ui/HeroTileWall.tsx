"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";

const SOURCE_IMAGES = [
  "/images/hero-dashboard-app.jpeg",
  "/images/onboarding-signup.jpeg",
  "/images/dental-office.jpeg",
  "/images/reminder-illustration.jpeg",
  "/images/cta-background.jpeg",
];

const COLUMN_COUNT = 4;
const TILES_PER_COLUMN = 6;

function buildColumn(offset: number) {
  const base = Array.from(
    { length: TILES_PER_COLUMN },
    (_, i) => SOURCE_IMAGES[(i + offset) % SOURCE_IMAGES.length]
  );
  // Doublée pour permettre une boucle de défilement sans coupure visible.
  return [...base, ...base];
}

const COLUMNS = Array.from({ length: COLUMN_COUNT }, (_, i) => buildColumn(i));

export function HeroTileWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      if (!planeRef.current) return;

      gsap.set(planeRef.current, { rotationX: 38, rotationZ: -14, transformPerspective: 1400 });

      gsap.from(planeRef.current, {
        opacity: 0,
        scale: 1.15,
        duration: 1.6,
        ease: "power2.out",
      });

      gsap.to(planeRef.current, {
        rotationY: 6,
        duration: 14,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      columnRefs.current.forEach((column, index) => {
        if (!column) return;
        const duration = index % 2 === 0 ? 40 : 52;
        gsap.to(column, {
          yPercent: -50,
          duration,
          ease: "none",
          repeat: -1,
          delay: -((duration / 2) * (index / Math.max(COLUMN_COUNT - 1, 1))),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-brand-950"
      style={{ perspective: "1400px" }}
    >
      <div
        ref={planeRef}
        className="absolute inset-[-10%]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="grid h-full grid-cols-4 gap-4 p-4">
          {COLUMNS.map((column, colIndex) => (
            <div
              key={colIndex}
              ref={(el) => {
                columnRefs.current[colIndex] = el;
              }}
              className="flex flex-col gap-4"
            >
              {column.map((src, tileIndex) => (
                <div
                  key={`${src}-${tileIndex}`}
                  className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(12,31,54,0.55) 0%, rgba(12,31,54,0.88) 70%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-brand-950" />
    </div>
  );
}
