"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { toast } from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { saveSession } from "@/lib/auth-storage";
import { useLocale } from "@/lib/i18n";

type Status = "idle" | "loading" | "error" | "success";

export function LoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [challengeId, setChallengeId] = useState("");
  const [otpCode, setOtpCode] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 1) {
      setErrorMessage(t("login.error.missingFields", "Merci de renseigner un email valide et votre mot de passe."));
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const result = await api.login({ email, password, rememberMe });
      if ("twoFactorRequired" in result) {
        setChallengeId(result.challengeId);
        setStep("otp");
        setStatus("idle");
        toast.success(t("login.toast.otpSent", "Un code de connexion vous a été envoyé par email."));
        return;
      }
      saveSession(result.token, result.user, rememberMe);
      setStatus("success");
      toast.success(t("login.connected", "Connecté !"));
      router.push(result.user.role === "SUPERADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t("login.error.genericConnect", "Impossible de se connecter au serveur Ecotocare.");
      setErrorMessage(msg);
      setStatus("error");
      toast.error(msg);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      const { token, user } = await api.verifyTwoFactor({ challengeId, code: otpCode, rememberMe });
      saveSession(token, user, rememberMe);
      setStatus("success");
      toast.success(t("login.connected", "Connecté !"));
      router.push(user.role === "SUPERADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t("login.error.invalidCode", "Code invalide.");
      setErrorMessage(msg);
      setStatus("error");
      toast.error(msg);
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-6rem)] lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <LoginImageCarousel />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-brand-950/40" />

        <Link
          href="/"
          className="absolute inset-x-0 top-0 flex items-center gap-2.5 p-10"
          aria-label={`${siteConfig.name} — accueil`}
        >
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
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-10">
          <Reveal>
            <p className="max-w-sm text-balance text-2xl font-semibold leading-snug text-white">
              {t("login.tagline", "Vos rendez-vous et relances patients, suivis en un coup d'œil.")}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-16 sm:px-6 lg:px-12 overflow-hidden bg-brand-50/30 dark:bg-brand-950/20">
        <GeometricDecorations />
        <Reveal className="relative z-10 w-full max-w-md">
          <div className="rounded-3xl bg-surface-raised/80 backdrop-blur-md p-8 sm:p-10 shadow-xl border border-border">
            <div className="flex flex-col items-center gap-3 text-center lg:hidden">
              <Link href="/" aria-label={`${siteConfig.name} — accueil`}>
                <Image
                  src="/images/ecotocare-icon.png"
                  alt={`Logo ${siteConfig.name}`}
                  width={44}
                  height={44}
                  className="rounded-xl"
                />
              </Link>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                {step === "otp" ? t("login.otp.title", "Vérification en 2 étapes") : t("login.title", "Connexion à votre espace")}
              </h1>
              <p className="text-sm text-ink-muted">
                {step === "otp"
                  ? t("login.otp.subtitle", `Entrez le code à 6 chiffres envoyé à ${email}.`, { email })
                  : t("login.subtitle", "Accédez au tableau de bord de votre cabinet.")}
              </p>
            </div>

            {step === "otp" ? (
              <form onSubmit={handleVerifyOtp} noValidate className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="otp-code" className="text-sm font-medium text-ink">
                    {t("login.otp.label", "Code de connexion")}
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                    />
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(event) => {
                        setOtpCode(event.target.value.replace(/\D/g, ""));
                        if (status !== "idle") setStatus("idle");
                      }}
                      placeholder="123456"
                      className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-center text-lg tracking-[0.4em] text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || status === "success" || otpCode.length !== 6}
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
                    ? t("login.otp.verifying", "Vérification...")
                    : status === "success"
                      ? t("login.connected", "Connecté !")
                      : t("login.otp.submit", "Vérifier le code")}
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

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setOtpCode("");
                    setStatus("idle");
                  }}
                  className="text-center text-sm font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  {t("login.otp.back", "← Retour à la connexion")}
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-sm font-medium text-ink">
                  {t("login.email.label", "Email professionnel")}
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
                    placeholder="vous@etablissement-sante.fr"
                    className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-ink">
                    {t("login.password.label", "Mot de passe")}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {t("login.password.forgot", "Mot de passe oublié ?")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-12 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-border text-brand-600 focus:ring-brand-500" 
                  />
                  <span className="text-ink-muted group-hover:text-ink transition-colors">{t("login.rememberMe", "Se souvenir de moi")}</span>
                </label>
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
                  ? t("login.submit.loading", "Connexion...")
                  : status === "success"
                    ? t("login.connected", "Connecté !")
                    : t("login.submit.default", "Se connecter")}
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
            )}

            {step === "credentials" && (
            <p className="mt-8 text-center text-sm text-ink-muted">
              {t("login.noAccount", "Pas encore de compte ?")}{" "}
              <Link
                href="/signup"
                className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t("login.createAccount", "Créer un compte")}
              </Link>
            </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-[500px] opacity-[0.2] dark:opacity-10 mix-blend-multiply dark:mix-blend-screen blur-xl"
      >
        <Image src="/images/shape-1.png" alt="" width={600} height={600} className="w-full h-auto object-contain" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-20 -left-20 w-[400px] opacity-[0.15] dark:opacity-5 mix-blend-multiply dark:mix-blend-screen blur-lg"
      >
        <Image src="/images/shape-2.png" alt="" width={500} height={500} className="w-full h-auto object-contain" />
      </motion.div>
    </div>
  );
}

function LoginImageCarousel() {
  const { t } = useLocale();
  const images = [
    { src: "/images/login.jpeg", alt: t("login.carousel.alt1", "Illustration connexion Ecotocare") },
    { src: "/images/suivez.png", alt: t("login.carousel.alt2", "Tableau de bord de suivi Ecotocare") },
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
                {/* Fond flouté pour combler l'espace sans couper l'image principale */}
                <Image
                  src={img.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="scale-125 object-cover object-center opacity-70 blur-3xl"
                />
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-contain"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
}
