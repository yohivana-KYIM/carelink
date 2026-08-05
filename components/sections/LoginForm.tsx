"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth-storage";

type Status = "idle" | "loading" | "error" | "success";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 1) {
      setErrorMessage("Merci de renseigner un email valide et votre mot de passe.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const { token, user } = await api.login({ email, password });
      saveSession(token, user);
      setStatus("success");
      router.push(user.role === "SUPERADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : "Impossible de se connecter au serveur Carelink."
      );
      setStatus("error");
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <LoginImageCarousel />
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
                    href="/forgot-password"
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
                disabled={status === "loading" || status === "success"}
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
                {status === "loading"
                  ? "Connexion..."
                  : status === "success"
                    ? "Connecté !"
                    : "Se connecter"}
              </button>

              {status === "error" ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={15} />
                  {errorMessage}
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

function LoginImageCarousel() {
  const images = [
    {
      src: "/images/hero-dashboard-app.jpeg",
      alt: "Main tenant un smartphone affichant le tableau de bord Carelink",
    },
    { src: "/images/login.jpeg", alt: "Illustration connexion Carelink" },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-brand-950/10">
      <AnimatePresence>
        {images.map(
          (img, i) =>
            i === index && (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority
                  sizes="50vw"
                  className="object-contain"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}
