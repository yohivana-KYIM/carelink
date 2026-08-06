"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FooterSignature } from "@/components/ui/FooterSignature";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/ui/SocialIcons";
import { footerLinks, siteConfig } from "@/lib/site-config";

const socialLinks = [
  { href: siteConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.social.x, label: "X", Icon: XIcon },
  { href: siteConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.social.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
];

type Status = "idle" | "loading" | "success" | "error";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const footerRef = useRef<HTMLElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    // Le backend Ecotocare (Node.js/Express) n'est pas encore branché.
    // Prêt à pointer vers NEXT_PUBLIC_API_URL une fois l'API disponible.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus("success");
    setEmail("");
  }

  return (
    <div className="px-2 pb-6 pt-2 sm:px-4 sm:pb-8 lg:px-6">
      <footer
        ref={footerRef}
        id="contact-footer"
        className="relative mx-auto max-w-8xl overflow-hidden rounded-[2.5rem] bg-[#0a1120] text-[#f5f7fc]"
      >
        <div className="relative z-10 px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="flex flex-col gap-10 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Suivez les actualités {siteConfig.name}
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Laissez votre email professionnel, nous vous recontacterons
                rapidement pour organiser une démonstration.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Adresse email professionnelle
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                placeholder="vous@cabinet-dentaire.fr"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="w-full flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400 active:scale-[0.97] disabled:opacity-70"
              >
                {status === "loading" ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="flex"
                  >
                    <Loader2 size={16} />
                  </motion.span>
                ) : null}
                {status === "loading" ? "Envoi..." : "M'informer"}
              </button>
            </form>
          </div>

          <div aria-live="polite" className="min-h-[1.25rem] pt-3 text-sm">
            {status === "success" ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 font-medium text-emerald-400"
              >
                <CheckCircle2 size={15} />
                Merci ! Nous revenons vers vous très vite.
              </motion.p>
            ) : null}
            {status === "error" ? (
              <p className="font-medium text-red-400">
                Merci de renseigner une adresse email valide.
              </p>
            ) : null}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
            <div className="col-span-2 flex flex-col gap-4 sm:col-span-1 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/images/ecotocare-icon.png"
                  alt={`Logo ${siteConfig.name}`}
                  width={32}
                  height={32}
                  className="rounded-[9px]"
                />
                <span className="text-lg font-bold tracking-tight text-white">
                  {siteConfig.name}
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-white/50">
                {siteConfig.description}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-brand-400 hover:text-brand-300"
                  >
                    <Icon width={16} height={16} />
                  </a>
                ))}
              </div>
            </div>

            <FooterColumn title="Produit" links={footerLinks.produit} />
            <FooterColumn title="Ressources" links={footerLinks.ressources} />
            <FooterColumn title="Légal" links={footerLinks.legal} />
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. Tous droits
              réservés.
            </p>
            <p>
              Solution développée par MarketYou · Messagerie via un
              fournisseur WhatsApp Business (BSP) certifié Meta.
            </p>
          </div>
        </div>

        <FooterSignature text={siteConfig.name} triggerRef={footerRef} />
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-white">{title}</span>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/50 transition-colors hover:text-brand-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
