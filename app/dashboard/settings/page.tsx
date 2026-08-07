"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Loader2, Settings2, Save, ShieldCheck, Eye, EyeOff,
  Bell, Clock, Mail, ToggleLeft, ToggleRight, FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, ApiError, type CabinetSettings, type NotifPrefs } from "@/lib/api";
import { PushNotificationsCard } from "@/components/dashboard/PushNotificationsCard";

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

      <ChangePasswordCard token={token} />
      <NotifPrefsCard token={token} />
      <PushNotificationsCard token={token} />
      {canManage && <ReminderRulesCard token={token} />}
      {canManage && <CabinetTemplatesCard token={token} />}
      {canManage && <ReportSettingsCard token={token} />}
    </div>
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
