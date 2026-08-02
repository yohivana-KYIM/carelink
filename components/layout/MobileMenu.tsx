"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { navLinks } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLLIElement | null>>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (panelRef.current) {
      gsap.set(panelRef.current, { yPercent: -100, autoAlpha: 0 });
    }
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open) {
      document.body.style.overflow = "hidden";

      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeydown);

      let ctx: ReturnType<typeof gsap.context> | undefined;

      if (prefersReducedMotion()) {
        gsap.set(panel, { yPercent: 0, autoAlpha: 1 });
      } else {
        ctx = gsap.context(() => {
          gsap.fromTo(
            panel,
            { yPercent: -100, autoAlpha: 1 },
            { yPercent: 0, duration: 0.45, ease: "expo.out" }
          );
          gsap.fromTo(
            linkRefs.current.filter(Boolean),
            { y: 18, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.4,
              stagger: 0.06,
              delay: 0.12,
              ease: "power2.out",
            }
          );
        }, panel);
      }

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeydown);
        ctx?.revert();
      };
    }

    if (prefersReducedMotion()) {
      gsap.set(panel, { yPercent: -100, autoAlpha: 0 });
    } else {
      gsap.to(panel, {
        yPercent: -100,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsap.set(panel, { autoAlpha: 0 }),
      });
    }
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[60] flex flex-col gap-8 bg-background p-6 pt-8 lg:hidden"
      style={{ visibility: "hidden" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-widest text-ink-soft">
          Menu
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="flex size-10 items-center justify-center rounded-full border border-border text-ink-muted"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        <ul className="flex flex-col">
          {navLinks.map((link, index) => {
            const isActive = !link.href.includes("#") && pathname === link.href;
            return (
              <li
                key={link.href}
                ref={(el) => {
                  linkRefs.current[index] = el;
                }}
                className="border-b border-border"
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`block py-4 text-lg font-medium ${
                    isActive ? "text-brand-600 dark:text-brand-400" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Button href="/login" variant="secondary" onClick={onClose}>
          Connexion
        </Button>
        <Button href="/contact" onClick={onClose}>
          Demander une démo
        </Button>
      </div>
    </div>
  );
}
