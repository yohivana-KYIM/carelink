"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { HoverLink } from "@/components/ui/HoverLink";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 px-4 transition-[padding] duration-300 sm:px-6 lg:px-8 ${
        scrolled ? "pt-2" : "pt-4"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border bg-surface-raised/95 py-2.5 pl-3 pr-3 backdrop-blur-md transition-all duration-300 sm:pl-4 sm:pr-4 ${
          scrolled
            ? "border-border shadow-[0_8px_30px_-12px_rgba(16,23,40,0.25)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "border-border/60 shadow-card"
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${siteConfig.name} — accueil`}
        >
          <Image
            src="/images/carelink-icon.png"
            alt={`Logo ${siteConfig.name}`}
            width={34}
            height={34}
            className="rounded-[9px]"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-ink">
            {siteConfig.name}
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-7 lg:flex"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => (
            <HoverLink key={link.href} href={link.href}>
              {link.label}
            </HoverLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button href="/contact">Demander une démo</Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex size-10 items-center justify-center rounded-full border border-border text-ink-muted"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
