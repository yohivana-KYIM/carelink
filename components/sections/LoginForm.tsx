"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";

type Status = "idle" | "loading" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 1) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    // Le backend Carelink (Node.js/Express) n'est pas encore branché.
    // Prêt à pointer vers NEXT_PUBLIC_API_URL une fois l'API disponible.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("error");
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/hero-dashboard-app.jpeg"
          alt="Main tenant un smartphone affichant le tableau de bord Carelink"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-brand-950/40" />

        <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-10">
          <Image
            src="/images/carelink-icon.png"
            alt={`Logo ${siteConfig.name}`}
            width={36}
            height={36}
            className="rounded-[9px]"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            {siteConfig.name}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-10">
          <Reveal>
            <p className="max-w-sm text-balance text-2xl font-semibold leading-snug text-white">
              Vos rendez-vous et relances patients, suivis en un coup
              d&apos;œil.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
        <Reveal className="w-full max-w-md">
          <div>
            <div className="flex flex-col items-center gap-3 text-center lg:hidden">
              <Image
                src="/images/carelink-icon.png"
                alt={`Logo ${siteConfig.name}`}
                width={44}
                height={44}
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Connexion à votre espace
              </h1>
              <p className="text-sm text-ink-muted">
                Accédez au tableau de bord de votre cabinet.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-sm font-medium text-ink">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="vous@cabinet-dentaire.fr"
                    className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-ink">
                    Mot de passe
                  </label>
                  <Link
                    href="/contact"
                    className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.97] disabled:opacity-70"
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
                {status === "loading" ? "Connexion..." : "Se connecter"}
              </button>

              {status === "error" ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={15} />
                  L&apos;espace cabinet n&apos;est pas encore disponible — cette
                  page est une maquette.
                </motion.p>
              ) : null}
            </form>

            <p className="mt-8 text-center text-sm text-ink-muted">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
