"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
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
      setErrorMessage("Impossible de contacter le serveur Carelink. Réessayez dans un instant.");
      setStatus("error");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-6rem)] items-center py-16">
      <Container className="flex justify-center">
        <Reveal className="w-full max-w-md">
          <div className="rounded-[2rem] border border-border bg-surface-raised p-8 shadow-card sm:p-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <Image
                src="/images/carelink-icon.png"
                alt={`Logo ${siteConfig.name}`}
                width={44}
                height={44}
                className="rounded-xl"
              />
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
      </Container>
    </section>
  );
}
