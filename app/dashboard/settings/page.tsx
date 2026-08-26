"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import {
  Loader2, Settings2, Save, ShieldCheck, Eye, EyeOff,
  Bell, Clock, Mail, ToggleLeft, ToggleRight, FileText, UserCircle,
  Camera, Palette, Building2, Sparkles, MessageCircle, CheckCircle2, AlertCircle, QrCode,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, ApiError, type CabinetSettings, type NotifPrefs } from "@/lib/api";
import { PushNotificationsCard } from "@/components/dashboard/PushNotificationsCard";
import { fileToCompressedDataUrl } from "@/lib/image-upload";

function minutesToHuman(min: number): string {
  if (min >= 1440) return `${Math.floor(min / 1440)}j (${min} min)`;
  if (min >= 60) return `${Math.floor(min / 60)}h (${min} min)`;
  return `${min} min`;
}

const PRESET_DELAYS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "4h", value: 240 },
  { label: "12h", value: 720 },
  { label: "24h (J-1)", value: 1440 },
  { label: "48h (J-2)", value: 2880 },
  { label: "72h (J-3)", value: 4320 },
  { label: "7j", value: 10080 },
];

export default function SettingsPage() {
  const { token, user } = useSession();
  const canManage = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Paramètres</h1>
        <p className="mt-1 text-sm text-ink-muted">Compte, notifications et configuration du cabinet.</p>
      </div>

      <ProfileCard token={token} />
      <ChangePasswordCard token={token} />
      <TwoFactorCard token={token} />
      <NotifPrefsCard token={token} />
      <PushNotificationsCard token={token} />
      {canManage && <CabinetBrandingCard token={token} />}
      {canManage && <ReminderRulesCard token={token} />}
      {canManage && <CabinetTemplatesCard token={token} />}
      {canManage && <ReportSettingsCard token={token} />}
      {canManage && <AiRelanceCard token={token} />}
    </div>
  );
}

// ─── Relances par IA + statut de connexion WhatsApp ──────────────────────────
function AiRelanceCard({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiRelanceEnabled, setAiRelanceEnabled] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [whatsappVerifiedAt, setWhatsappVerifiedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then((r) => {
        setAiRelanceEnabled(r.settings.aiRelanceEnabled);
        setAiAvailable(r.aiAvailable);
        setWhatsappNumber(r.settings.whatsappPhoneNumber);
        setWhatsappVerifiedAt(r.settings.whatsappVerifiedAt ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleToggle() {
    if (!token || !aiAvailable) return;
    const next = !aiRelanceEnabled;
    setSaving(true);
    try {
      await api.updateSettings(token, { aiRelanceEnabled: next });
      setAiRelanceEnabled(next);
      toast.success(next ? "Relances par IA activées" : "Relances par IA désactivées");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Sparkles size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Relances par IA</h2>
          <p className="text-sm text-ink-muted">
            Message de relance personnalisé généré automatiquement (nom du patient, dernière visite) au lieu du template statique.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div>
          <span className="text-sm text-ink">Activer les relances personnalisées par IA</span>
          {!aiAvailable && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle size={12} /> IA non configurée côté serveur (ANTHROPIC_API_KEY manquante) — le template statique reste utilisé.
            </p>
          )}
        </div>
        <button type="button" onClick={handleToggle} disabled={saving || !aiAvailable}>
          {aiRelanceEnabled
            ? <ToggleRight size={26} className="text-brand-600" />
            : <ToggleLeft size={26} className="text-ink-soft" />}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <MessageCircle size={16} />
          </span>
          <div>
            <p className="text-sm text-ink">Numéro WhatsApp du cabinet</p>
            <p className="text-xs text-ink-soft">{whatsappNumber ?? "Non connecté"}</p>
          </div>
        </div>
        {whatsappNumber && (
          whatsappVerifiedAt ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 size={12} /> Vérifié
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <AlertCircle size={12} /> Non vérifié
            </span>
          )
        )}
      </div>

      <WhatsappConnectSection token={token} connected={Boolean(whatsappVerifiedAt)} />
    </div>
  );
}

function WhatsappConnectSection({ token, connected }: { token: string | null; connected: boolean }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [checking, setChecking] = useState(false);

  async function loadQrCode() {
    if (!token) return;
    setLoadingQr(true);
    try {
      const res = await api.getWhatsappQr(token);
      setQrDataUrl(res.qrCodeDataUrl);
      toast.success("QR code généré — scannez-le avec WhatsApp sur le téléphone du cabinet.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la génération du QR code");
    } finally {
      setLoadingQr(false);
    }
  }

  async function checkConnection() {
    if (!token) return;
    setChecking(true);
    try {
      const res = await api.checkWhatsappStatus(token);
      if (res.state === "open") {
        toast.success("Numéro connecté avec succès !");
        window.location.reload();
      } else {
        toast("QR pas encore scanné — réessayez après avoir scanné.", { icon: "⏳" });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la vérification");
    } finally {
      setChecking(false);
    }
  }

  if (connected) {
    return (
      <p className="-mt-2 text-xs text-ink-soft">
        Numéro connecté et vérifié. Pour changer de numéro, contactez le support Ecotocare.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
      <p className="text-xs text-ink-soft">
        Scannez ce QR code avec WhatsApp (téléphone du cabinet) pour connecter votre numéro et activer les rappels/relances automatiques.
      </p>
      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- data URL générée côté client
        <img src={qrDataUrl} alt="QR code de connexion WhatsApp" width={200} height={200} className="mx-auto rounded-lg" />
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={loadQrCode}
          disabled={loadingQr}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-300 disabled:opacity-50"
        >
          {loadingQr ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
          {qrDataUrl ? "Régénérer le QR" : "Générer le QR"}
        </button>
        {qrDataUrl && (
          <button
            type="button"
            onClick={checkConnection}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            Vérifier la connexion
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Profil ───────────────────────────────────────────────────────────────────
function ProfileCard({ token }: { token: string | null }) {
  const { user, refresh } = useSession();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setAvatarUrl(user?.avatarUrl ?? null);
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, { maxSize: 256 });
      await api.updateProfile(token, { avatarUrl: dataUrl });
      setAvatarUrl(dataUrl);
      await refresh();
      toast.success("Photo de profil mise à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi de la photo");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateProfile(token, { fullName, email });
      await refresh();
      toast.success("Profil mis à jour");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <UserCircle size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Profil</h2>
          <p className="text-sm text-ink-muted">Votre nom, votre email et votre photo.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Photo de profil" fill className="object-cover" unoptimized />
          ) : (
            fullName.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface">
          {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {uploadingAvatar ? "Envoi..." : "Changer la photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Nom complet</label>
          <input type="text" required minLength={2} value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// ─── Mot de passe ─────────────────────────────────────────────────────────────
function ChangePasswordCard({ token }: { token: string | null }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (next.length < 8) { toast.error("8 caractères minimum."); return; }
    if (next !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setSaving(true);
    try {
      await api.changePassword(token, { currentPassword: cur, newPassword: next });
      toast.success("Mot de passe mis à jour");
      setCur(""); setNext(""); setConfirm("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <ShieldCheck size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Sécurité</h2>
          <p className="text-sm text-ink-muted">Changez votre mot de passe.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-sm font-medium text-ink">Mot de passe actuel</label>
          <div className="relative">
            <input type={show ? "text" : "password"} required value={cur} onChange={e => setCur(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-sm text-ink focus:border-brand-400 focus:outline-none" />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" tabIndex={-1}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Nouveau mot de passe</label>
          <input type={show ? "text" : "password"} required minLength={8} value={next} onChange={e => setNext(e.target.value)}
            placeholder="8 caractères minimum"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Confirmer</label>
          <input type={show ? "text" : "password"} required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
          {saving ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
}

// ─── Double authentification (2FA) ─────────────────────────────────────────────
function TwoFactorCard({ token }: { token: string | null }) {
  const { user, refresh } = useSession();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (!token || !user) return;
    setSaving(true);
    const next = !user.twoFactorEnabled;
    try {
      await api.toggleTwoFactor(token, next);
      await refresh();
      toast.success(
        next
          ? "Double authentification activée : un code vous sera envoyé par email à chaque connexion."
          : "Double authentification désactivée."
      );
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <ShieldCheck size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Double authentification (2FA)</h2>
          <p className="text-sm text-ink-muted">Un code de connexion supplémentaire vous sera envoyé par email.</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-ink-muted" />
          <span className="text-sm font-medium text-ink">Exiger un code par email à chaque connexion</span>
        </div>
        <button type="button" onClick={toggle} disabled={saving || !user} className="text-brand-600 dark:text-brand-400 disabled:opacity-50">
          {user?.twoFactorEnabled
            ? <ToggleRight size={28} className="text-brand-600" />
            : <ToggleLeft size={28} className="text-ink-soft" />}
        </button>
      </div>
    </div>
  );
}

// ─── Préférences notifications ────────────────────────────────────────────────
function NotifPrefsCard({ token }: { token: string | null }) {
  const [prefs, setPrefs] = useState<NotifPrefs>({ notifPushEnabled: true, notifEmailEnabled: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getNotifPrefs(token)
      .then(r => setPrefs(r.prefs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function toggle(key: keyof NotifPrefs) {
    if (!token) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await api.updateNotifPrefs(token, { [key]: updated[key] });
      toast.success("Préférence mise à jour");
    } catch {
      setPrefs(prefs); // rollback
      toast.error("Erreur");
    }
  }

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Bell size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Notifications</h2>
          <p className="text-sm text-ink-muted">Choisissez comment vous souhaitez être alerté.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { key: "notifPushEnabled" as const, label: "Notifications push (navigateur / mobile)", icon: Bell },
          { key: "notifEmailEnabled" as const, label: "Notifications par email", icon: Mail },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <Icon size={16} className="text-ink-muted" />
              <span className="text-sm font-medium text-ink">{label}</span>
            </div>
            <button type="button" onClick={() => toggle(key)} className="text-brand-600 dark:text-brand-400">
              {prefs[key]
                ? <ToggleRight size={28} className="text-brand-600" />
                : <ToggleLeft size={28} className="text-ink-soft" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Identité du cabinet (branding) ────────────────────────────────────────────
function CabinetBrandingCard({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2e70be");

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then(r => {
        setName(r.settings.name);
        setLogoUrl(r.settings.logoUrl);
        setPrimaryColor(r.settings.primaryColor ?? "#2e70be");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingLogo(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file, { maxSize: 320 });
      setLogoUrl(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image invalide");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateSettings(token, { name, logoUrl, primaryColor });
      toast.success("Identité du cabinet mise à jour");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-soft" size={20} /></div>;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Building2 size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Identité du cabinet</h2>
          <p className="text-sm text-ink-muted">Nom, logo et couleur affichés sur votre espace.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface text-ink-soft">
          {logoUrl ? (
            <Image src={logoUrl} alt="Logo du cabinet" fill className="object-contain p-1" unoptimized />
          ) : (
            <Building2 size={22} />
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface">
          {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {uploadingLogo ? "Traitement..." : "Changer le logo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={uploadingLogo} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Nom du cabinet</label>
          <input type="text" required minLength={2} value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink flex items-center gap-1.5"><Palette size={14} /> Couleur principale</label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
              className="size-10 cursor-pointer rounded-lg border border-border bg-background" />
            <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
              pattern="^#[0-9a-fA-F]{6}$"
              className="w-32 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving || uploadingLogo}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// ─── Règles de rappel ─────────────────────────────────────────────────────────
function ReminderRulesCard({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reminder1MinBefore: 2880,
    reminder2MinBefore: 1440,
    reminder3MinBefore: null as number | null,
    enableR3: false,
  });

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then(r => {
        setForm({
          reminder1MinBefore: r.settings.reminder1MinBefore,
          reminder2MinBefore: r.settings.reminder2MinBefore,
          reminder3MinBefore: r.settings.reminder3MinBefore,
          enableR3: r.settings.reminder3MinBefore != null,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateSettings(token, {
        reminder1MinBefore: form.reminder1MinBefore,
        reminder2MinBefore: form.reminder2MinBefore,
        reminder3MinBefore: form.enableR3 ? (form.reminder3MinBefore ?? 30) : null,
      });
      toast.success("Règles de rappel enregistrées");
    } catch {
      toast.error("Erreur d'enregistrement");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-soft" size={20} /></div>;

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Clock size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Délais de rappel WhatsApp</h2>
          <p className="text-sm text-ink-muted">Définissez quand les rappels sont envoyés avant chaque rendez-vous.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { label: "Rappel 1 (principal)", key: "reminder1MinBefore" as const },
          { label: "Rappel 2 (de confirmation)", key: "reminder2MinBefore" as const },
        ].map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">{label}</label>
            <select
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            >
              {PRESET_DELAYS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <p className="text-xs text-ink-soft">{minutesToHuman(form[key])} avant le RDV</p>
          </div>
        ))}
      </div>

      {/* Rappel 3 optionnel */}
      <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Rappel 3 (optionnel — ex: 30 min avant)</p>
            <p className="text-xs text-ink-muted">Utile pour un rappel de dernière minute</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, enableR3: !f.enableR3 }))}>
            {form.enableR3
              ? <ToggleRight size={28} className="text-brand-600" />
              : <ToggleLeft size={28} className="text-ink-soft" />}
          </button>
        </div>
        {form.enableR3 && (
          <select
            value={form.reminder3MinBefore ?? 30}
            onChange={e => setForm(f => ({ ...f, reminder3MinBefore: Number(e.target.value) }))}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
          >
            {PRESET_DELAYS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer les délais"}
        </button>
      </div>
    </form>
  );
}

// ─── Templates messages ───────────────────────────────────────────────────────
function CabinetTemplatesCard({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Pick<CabinetSettings, "templateReminder48h" | "templateReminder24h" | "templateReminderCustom" | "templateRelance">>({
    templateReminder48h: "",
    templateReminder24h: "",
    templateReminderCustom: "",
    templateRelance: "",
  });

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then(r => setForm({
        templateReminder48h: r.settings.templateReminder48h ?? "",
        templateReminder24h: r.settings.templateReminder24h ?? "",
        templateReminderCustom: r.settings.templateReminderCustom ?? "",
        templateRelance: r.settings.templateRelance ?? "",
      }))
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateSettings(token, form);
      toast.success("Modèles enregistrés");
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-ink-soft" size={20} /></div>;

  const variables = ["{patientName}", "{cabinetName}", "{date}", "{time}", "{delayLabel}"];
  const templateFields = [
    { key: "templateReminder48h" as const, label: "Rappel 1 (J-2 / 48h par défaut)" },
    { key: "templateReminder24h" as const, label: "Rappel 2 (J-1 / 24h par défaut)" },
    { key: "templateReminderCustom" as const, label: "Rappel 3 (optionnel)" },
    { key: "templateRelance" as const, label: "Relance patients inactifs" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <Settings2 size={18} />
          </span>
          <h2 className="text-base font-semibold text-ink">Modèles de messages WhatsApp</h2>
        </div>

        <div className="rounded-xl bg-surface p-3 text-sm text-ink-muted border border-border flex flex-wrap gap-2">
          {variables.map(v => (
            <code key={v} className="rounded bg-surface-raised px-2 py-0.5 text-xs text-ink">{v}</code>
          ))}
        </div>

        {templateFields.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">{label}</label>
            <textarea rows={3} value={form[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder="Laissez vide pour le modèle par défaut."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer les modèles"}
        </button>
      </div>
    </form>
  );
}

// ─── Rapports automatiques ────────────────────────────────────────────────────
function ReportSettingsCard({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reportDailyEnabled: true,
    reportWeeklyEnabled: true,
    reportMonthlyEnabled: true,
    reportEmail: "",
  });

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then(r => setForm({
        reportDailyEnabled: r.settings.reportDailyEnabled,
        reportWeeklyEnabled: r.settings.reportWeeklyEnabled,
        reportMonthlyEnabled: r.settings.reportMonthlyEnabled,
        reportEmail: r.settings.reportEmail ?? "",
      }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateSettings(token, {
        reportDailyEnabled: form.reportDailyEnabled,
        reportWeeklyEnabled: form.reportWeeklyEnabled,
        reportMonthlyEnabled: form.reportMonthlyEnabled,
        reportEmail: form.reportEmail || null,
      });
      toast.success("Configuration des rapports enregistrée");
    } catch { toast.error("Erreur"); } finally { setSaving(false); }
  }

  async function handleGenerate(period: "DAILY" | "WEEKLY" | "MONTHLY") {
    if (!token) return;
    try {
      await api.generateReport(token, period);
      toast.success("Rapport généré et envoyé par email");
    } catch { toast.error("Erreur de génération"); }
  }

  if (loading) return null;

  const reportTypes = [
    { key: "reportDailyEnabled" as const, label: "Rapport journalier (tous les jours à 8h)", period: "DAILY" as const },
    { key: "reportWeeklyEnabled" as const, label: "Rapport hebdomadaire (lundi 8h)", period: "WEEKLY" as const },
    { key: "reportMonthlyEnabled" as const, label: "Rapport mensuel (1er du mois)", period: "MONTHLY" as const },
  ];

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <FileText size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Rapports automatiques</h2>
          <p className="text-sm text-ink-muted">Recevez un résumé d'activité par email.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {reportTypes.map(({ key, label, period }) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm text-ink">{label}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleGenerate(period)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-muted hover:bg-surface-raised">
                Générer maintenant
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}>
                {form[key]
                  ? <ToggleRight size={26} className="text-brand-600" />
                  : <ToggleLeft size={26} className="text-ink-soft" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink">Email destinataire des rapports (optionnel)</label>
        <input type="email" value={form.reportEmail} onChange={e => setForm(f => ({ ...f, reportEmail: e.target.value }))}
          placeholder="direction@cabinet-dentaire.fr"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        <p className="text-xs text-ink-soft">En plus de l'email des administrateurs du cabinet.</p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
