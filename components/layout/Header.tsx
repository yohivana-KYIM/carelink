"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { HoverLink } from "@/components/ui/HoverLink";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { navLinks, siteConfig } from "@/lib/site-config";
import { getStoredUser, clearSession } from "@/lib/auth-storage";
import type { SafeUser } from "@/lib/api";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SafeUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border pl-3 pr-3 backdrop-blur-2xl transition-all duration-300 sm:pl-4 sm:pr-4 ${
          scrolled
            ? "border-border bg-surface-raised/95 shadow-[0_8px_30px_-12px_rgba(16,23,40,0.25)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "border-border/50 bg-surface-raised/70 shadow-card"
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
            width={32}
            height={32}
            className="rounded-[9px]"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-ink">
            {siteConfig.name}
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => {
            const isActive = !link.href.includes("#") && pathname === link.href;
            return (
              <HoverLink
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "rounded-full bg-brand-50 px-3 !text-brand-700 dark:bg-brand-500/15 dark:!text-brand-300"
                    : "px-3"
                }
              >
                {link.label}
              </HoverLink>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          
          {/* Bouton WhatsApp Démo */}
          <a
            href="https://wa.me/33600000000?text=Bonjour,%20je%20souhaite%20une%20démo%20de%20Carelink"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#128C7E] active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Demander une démo
          </a>

          {user ? (
            <div className="ml-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink">
                  Salut, {user.fullName.split(" ")[0]}
                </span>
              </div>
              <div className="h-4 w-px bg-border" />
              <Link
                href={user.role === "SUPERADMIN" ? "/admin" : "/dashboard"}
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700 active:scale-[0.97]"
              >
                Mon Espace
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  setUser(null);
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-surface-raised active:scale-[0.97]"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-700 active:scale-[0.97]"
              >
                Connexion
              </Link>
              <Button href="/contact">Demander une démo</Button>
            </>
          )}
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
