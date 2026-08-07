"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { api } from "@/lib/api";
import { siteConfig } from "@/lib/site-config";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

type Status = "idle" | "loading" | "success" | "error";

const infoPoints = [
  {
    icon: Mail,
    title: "Par email",
    detail: siteConfig.contactEmail,
  },
  {
    icon: MessageCircle,
    title: "Délai de réponse",
    detail: "Sous 24h ouvrées",
  },
  {
    icon: MapPin,
    title: "Zone d'intervention",
    detail: "Cabinets dentaires, France",
  },
];

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState({
    name: "",
    email: "",
    clinic: "",
    phone: "",
    subject: "",
    message: "",
  });

  function updateField(field: keyof typeof values) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      if (status !== "idle") setStatus("idle");
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim() || !values.email.includes("@") || !values.message.trim()) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      await api.submitContactMessage({
        fullName: values.name.trim(),
        email: values.email.trim(),
        clinic: values.clinic.trim() || undefined,
        phone: values.phone.trim() || undefined,
        subject: values.clinic.trim() ? `Demande de contact — ${values.clinic.trim()}` : undefined,
        message: values.message.trim(),
      });
      setStatus("success");
      setValues({ name: "", email: "", clinic: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <Reveal>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                Contact
              </span>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Parlons de votre cabinet
              </h2>
              <p className="max-w-md text-balance text-base leading-relaxed text-ink-muted">
                Une question, une démo à planifier, un besoin spécifique ?
                Décrivez-nous votre cabinet, notre équipe vous répond
                rapidement.
              </p>
            </div>
          </Reveal>

          <ul className="flex flex-col gap-5">
            {infoPoints.map((point, index) => (
              <Reveal key={point.title} delay={index * 0.06}>
                <li className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <point.icon size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {point.title}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {point.detail}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 rounded-[2rem] border border-border bg-surface-raised p-8 shadow-card sm:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="name"
                label="Nom complet"
                required
                value={values.name}
                onChange={updateField("name")}
                placeholder="Dr. Amina Kader"
              />
              <Field
                id="email"
                label="Email professionnel"
                type="email"
                required
                value={values.email}
                onChange={updateField("email")}
                placeholder="vous@cabinet-dentaire.fr"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="clinic"
                label="Nom du cabinet"
                value={values.clinic}
                onChange={updateField("clinic")}
                placeholder="Cabinet dentaire du Parc"
              />
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium text-ink flex items-center gap-1.5">
                  <Phone size={14} /> Téléphone (optionnel)
                </label>
                <div className="phone-input-container">
                  <PhoneInput
                    defaultCountry="fr"
                    value={values.phone}
                    onChange={(phone) => {
                      setValues((prev) => ({ ...prev, phone }));
                      if (status !== "idle") setStatus("idle");
                    }}
                    style={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      borderRadius: "9999px",
                      borderTopLeftRadius: "0",
                      borderBottomLeftRadius: "0",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      padding: "0.6rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--ink)",
                    }}
                    countrySelectorStyleProps={{
                      buttonStyle: {
                        borderTopLeftRadius: "9999px",
                        borderBottomLeftRadius: "9999px",
                        border: "1px solid var(--border)",
                        background: "var(--background)",
                        padding: "0 0.75rem",
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <Field
              id="subject"
              label="Objet"
              value={values.subject}
              onChange={updateField("subject")}
              placeholder="Demande de démo, question produit..."
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-medium text-ink">
                Message <span className="text-brand-600">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={values.message}
                onChange={updateField("message")}
                placeholder="Parlez-nous de votre cabinet et de vos besoins en rappels de rendez-vous..."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
              />
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
              {status === "loading" ? "Envoi..." : "Envoyer le message"}
            </button>

            <div aria-live="polite" className="min-h-[1.25rem] text-sm">
              {status === "success" ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 size={15} />
                  Merci ! Nous revenons vers vous sous 24h ouvrées.
                </motion.p>
              ) : null}
              {status === "error" ? (
                <p className="font-medium text-red-600 dark:text-red-400">
                  Merci de renseigner votre nom, un email valide et un
                  message.
                </p>
              ) : null}
            </div>
          </form>
        </Reveal>
      </Container>
    </section>
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
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
      />
    </div>
  );
}
