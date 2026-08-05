"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth-storage";

type FormData = {
  cabinetName: string;
  city: string;
  practitioners: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const initialData: FormData = {
  cabinetName: "",
  city: "",
  practitioners: "1",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

const STEPS = [
  { title: "Votre cabinet" },
  { title: "Vos informations" },
  { title: "Sécurité" },
] as const;

type Status = "idle" | "loading" | "success";

export function SignupWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (!data.cabinetName.trim() || !data.city.trim()) {
        return "Merci de renseigner le nom du cabinet et la ville.";
      }
    }
    if (current === 2) {
      if (!data.fullName.trim() || !data.email.includes("@")) {
        return "Merci de renseigner votre nom et un email valide.";
      }
    }
    if (current === 3) {
      if (data.password.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères.";
      }
      if (data.password !== data.confirmPassword) {
        return "Les mots de passe ne correspondent pas.";
      }
      if (!data.acceptTerms) {
        return "Merci d'accepter les conditions d'utilisation.";
      }
    }
    return "";
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("loading");
    try {
      const { token, user } = await api.registerCabinet({
        cabinetName: data.cabinetName,
        city: data.city,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      saveSession(token, user);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Impossible de créer le compte pour le moment."
      );
      setStatus("idle");
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-6rem)] items-center py-16">
      <Container className="flex justify-center">
        <Reveal className="w-full max-w-lg">
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
                Créer votre compte {siteConfig.name}
              </h1>
              <p className="text-sm text-ink-muted">
                Trois étapes rapides pour préparer l&apos;espace de votre
                cabinet.
              </p>
            </div>

            {status !== "success" ? (
              <>
                <Stepper current={step} />

                <form onSubmit={handleSubmit} noValidate className="mt-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-5"
                    >
                      {step === 1 ? (
                        <>
                          <Field
                            id="cabinetName"
                            label="Nom du cabinet"
                            value={data.cabinetName}
                            onChange={(v) => update("cabinetName", v)}
                            placeholder="Cabinet dentaire du Parc"
                            required
                          />
                          <Field
                            id="city"
                            label="Ville"
                            value={data.city}
                            onChange={(v) => update("city", v)}
                            placeholder="Lyon"
                            required
                          />
                          <div className="flex flex-col gap-2">
                            <label htmlFor="practitioners" className="text-sm font-medium text-ink">
                              Nombre de praticiens
                            </label>
                            <select
                              id="practitioners"
                              value={data.practitioners}
                              onChange={(event) => update("practitioners", event.target.value)}
                              className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                            >
                              {["1", "2-3", "4-6", "7+"].map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      ) : null}

                      {step === 2 ? (
                        <>
                          <Field
                            id="fullName"
                            label="Nom complet"
                            value={data.fullName}
                            onChange={(v) => update("fullName", v)}
                            placeholder="Dr. Amina Kader"
                            required
                          />
                          <Field
                            id="email"
                            label="Email professionnel"
                            type="email"
                            value={data.email}
                            onChange={(v) => update("email", v)}
                            placeholder="vous@cabinet-dentaire.fr"
                            required
                          />
                          <Field
                            id="phone"
                            label="Téléphone (optionnel)"
                            type="tel"
                            value={data.phone}
                            onChange={(v) => update("phone", v)}
                            placeholder="06 12 34 56 78"
                          />
                        </>
                      ) : null}

                      {step === 3 ? (
                        <>
                          <Field
                            id="password"
                            label="Mot de passe"
                            type="password"
                            value={data.password}
                            onChange={(v) => update("password", v)}
                            placeholder="8 caractères minimum"
                            required
                          />
                          <Field
                            id="confirmPassword"
                            label="Confirmer le mot de passe"
                            type="password"
                            value={data.confirmPassword}
                            onChange={(v) => update("confirmPassword", v)}
                            placeholder="••••••••"
                            required
                          />
                          <label className="flex items-start gap-3 text-sm text-ink-muted">
                            <input
                              type="checkbox"
                              checked={data.acceptTerms}
                              onChange={(event) => update("acceptTerms", event.target.checked)}
                              className="mt-0.5 size-4 shrink-0 rounded border-border text-brand-600 focus:ring-brand-400"
                            />
                            J&apos;accepte les conditions d&apos;utilisation et
                            la politique de confidentialité de{" "}
                            {siteConfig.name}.
                          </label>
                        </>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>

                  {error ? (
                    <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  ) : null}

                  <div className="mt-7 flex items-center gap-3">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand-300"
                      >
                        <ChevronLeft size={16} />
                        Retour
                      </button>
                    ) : null}

                    {step < STEPS.length ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="ml-auto inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.97]"
                      >
                        Suivant
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 active:scale-[0.97] disabled:opacity-70"
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
                        {status === "loading" ? "Création..." : "Créer mon compte"}
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-4 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <CheckCircle2 size={28} />
                </span>
                <h2 className="text-xl font-semibold text-ink">
                  Compte créé !
                </h2>
                <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
                  Merci {data.fullName || "à vous"} — le compte du{" "}
                  {data.cabinetName || "cabinet"} est prêt. Vous pouvez dès à
                  présent vous connecter à votre espace.
                </p>
                <Link
                  href="/"
                  className="mt-2 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Accéder à l&apos;accueil
                </Link>
              </motion.div>
            )}

            {status !== "success" ? (
              <p className="mt-8 text-center text-sm text-ink-muted">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  Se connecter
                </Link>
              </p>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="mt-8 flex items-center">
      {STEPS.map((s, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < current;
        const isActive = stepNumber === current;
        return (
          <div key={s.title} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-brand-600 text-white"
                    : isActive
                      ? "border-2 border-brand-600 text-brand-600 dark:text-brand-400"
                      : "border border-border text-ink-soft"
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNumber}
              </span>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isActive ? "text-ink" : "text-ink-soft"
                }`}
              >
                {s.title}
              </span>
            </div>
            {stepNumber < STEPS.length ? (
              <div
                className={`mx-2 h-px flex-1 transition-colors ${
                  isCompleted ? "bg-brand-600" : "bg-border"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label} {required ? <span className="text-brand-600">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
    </div>
  );
}
