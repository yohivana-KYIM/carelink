"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { api } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("Merci de renseigner un email valide.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setErrorMessage("Merci de renseigner un email valide.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      // L'API répond toujours avec le même message générique, que l'email
      // soit enregistré ou non (aucune fuite d'information sur les comptes existants).
      await api.forgotPassword({ email });
      setStatus("success");
    } catch {
      setErrorMessage("Impossible de contacter le serveur Ecotocare. Réessayez dans un instant.");
      setStatus("error");
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] lg:grid-cols-[0.95fr_1.05fr]">
      {/* Colonne gauche — illustration */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/motpasse.png"
          alt="Illustration mot de passe oublié"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-contain"
        />
        {/* Fond flouté pour remplir l'espace sans couper l'image */}
        <Image
          src="/images/motpasse.png"
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="scale-125 object-cover object-center opacity-60 blur-3xl -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-brand-950/30" />

        <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-10">
          <Image
            src="/images/ecotocare-icon.png"
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
              Réinitialisez votre mot de passe en quelques secondes.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="relative flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12 overflow-hidden bg-brand-50/30 dark:bg-brand-950/20">
        <Reveal className="relative z-10 w-full max-w-md">
          <div className="rounded-3xl bg-surface-raised/80 backdrop-blur-md p-8 sm:p-10 shadow-xl border border-border">
            {/* Logo visible uniquement sur mobile */}
            <div className="flex flex-col items-center gap-3 text-center lg:hidden mb-4">
              <Image
                src="/images/ecotocare-icon.png"
                alt={`Logo ${siteConfig.name}`}
                width={44}
                height={44}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Mot de passe oublié
              </h1>
              <p className="text-sm text-ink-muted">
                Indiquez votre email professionnel, nous vous envoyons un
                lien de réinitialisation.
              </p>
            </div>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-3 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 size={24} />
                </span>
                <p className="text-sm text-ink-muted">
                  Si un compte existe pour <strong className="text-ink">{email}</strong>,
                  un email avec un lien de réinitialisation vient de lui être
                  envoyé.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="forgot-email" className="text-sm font-medium text-ink">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                    />
                    <input
                      id="forgot-email"
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
                  {status === "loading" ? "Envoi..." : "Envoyer le lien"}
                </button>

                {status === "error" ? (
                  <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                ) : null}
              </form>
            )}

            <Link
              href="/login"
              className="mt-8 flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
