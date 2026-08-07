"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg("Merci de renseigner un email valide.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMsg(data?.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setErrorMsg("Impossible de contacter le serveur. Réessayez.");
      setStatus("error");
    }
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-12 shadow-xl sm:px-12 sm:py-16">
            {/* Décor de fond */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-white/5 blur-2xl" />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                <Mail size={22} />
              </span>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Restez informé des nouveautés Ecotocare
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  Conseils pratiques, nouvelles fonctionnalités et bonnes pratiques pour votre cabinet — directement dans votre boîte mail.
                </p>
              </div>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-semibold text-white"
                >
                  <CheckCircle2 size={18} />
                  Inscription confirmée — merci !
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status !== "idle") setStatus("idle");
                      }}
                      placeholder="vous@cabinet-dentaire.fr"
                      className="w-full rounded-full bg-white/15 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white/90 disabled:opacity-70"
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
                    {status === "loading" ? "Envoi..." : "S'inscrire"}
                  </button>
                </form>
              )}

              {status === "error" ? (
                <p className="text-sm font-medium text-red-200">{errorMsg}</p>
              ) : null}

              <p className="text-xs text-white/40">
                Pas de spam. Désinscription possible à tout moment.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
