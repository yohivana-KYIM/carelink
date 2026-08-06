"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { api, ApiError } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Ce lien de réinitialisation est invalide. Redemandez un email depuis la page précédente.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setStatus("error");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      await api.resetPassword({ token, password });
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de contacter le serveur Ecotocare. Réessayez dans un instant."
      );
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
                src="/images/ecotocare-icon.png"
                alt={`Logo ${siteConfig.name}`}
                width={44}
                height={44}
                className="rounded-xl"
              />
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Réinitialiser le mot de passe
              </h1>
              <p className="text-sm text-ink-muted">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>
            </div>

            {!token && status !== "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-3 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <AlertTriangle size={24} />
                </span>
                <p className="text-sm text-ink-muted">
                  Ce lien de réinitialisation est invalide ou incomplet.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Redemander un email
                </Link>
              </motion.div>
            ) : status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-3 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 size={24} />
                </span>
                <p className="text-sm text-ink-muted">
                  Votre mot de passe a bien été mis à jour.
                </p>
                <Link
                  href="/login"
                  className="mt-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Se connecter
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-ink">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                    />
                    <input
                      id="new-password"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (status !== "idle") setStatus("idle");
                      }}
                      placeholder="8 caractères minimum"
                      className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-ink">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                    />
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
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
                  {status === "loading" ? "Mise à jour..." : "Réinitialiser le mot de passe"}
                </button>

                {status === "error" ? (
                  <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
