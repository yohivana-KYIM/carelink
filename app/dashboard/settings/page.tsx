"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Settings2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type CabinetSettings } from "@/lib/api";

const DEFAULT_REMINDER_48H = "Bonjour {patientName}, ceci est un rappel de votre rendez-vous le {date} à {time} au cabinet {cabinetName}. Répondez CONFIRMER ou REPORTER.";
const DEFAULT_REMINDER_24H = "Bonjour {patientName}, votre rendez-vous est demain {date} à {time} au cabinet {cabinetName}. Répondez CONFIRMER ou REPORTER.";
const DEFAULT_RELANCE = "Bonjour {patientName}, cela fait un moment que nous ne vous avons pas vu au cabinet {cabinetName}. Souhaitez-vous reprendre rendez-vous ? OUI pour être recontacté.";

export default function SettingsPage() {
  const { token, user } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<CabinetSettings>({
    templateReminder48h: "",
    templateReminder24h: "",
    templateRelance: "",
  });

  useEffect(() => {
    if (!token) return;
    api.getSettings(token)
      .then(res => {
        setForm({
          templateReminder48h: res.settings.templateReminder48h || "",
          templateReminder24h: res.settings.templateReminder24h || "",
          templateRelance: res.settings.templateRelance || "",
        });
      })
      .catch(() => toast.error("Erreur lors du chargement des paramètres"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.updateSettings(token, form);
      toast.success("Paramètres enregistrés avec succès");
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (user?.role !== "ADMIN" && user?.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-ink-soft">
        <p>Vous n'avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Paramètres du cabinet</h1>
        <p className="mt-1 text-sm text-ink-muted">Configurez les messages automatiques WhatsApp envoyés à vos patients.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Settings2 size={18} />
            </span>
            <h2 className="text-lg font-semibold text-ink">Modèles de messages WhatsApp</h2>
          </div>

          <div className="rounded-xl bg-surface p-4 text-sm text-ink-muted border border-border">
            <p className="font-semibold mb-1">Variables disponibles :</p>
            <ul className="list-disc list-inside flex flex-col gap-1">
              <li><code className="bg-surface-raised px-1 rounded text-ink">{"{patientName}"}</code> : Nom du patient</li>
              <li><code className="bg-surface-raised px-1 rounded text-ink">{"{cabinetName}"}</code> : Nom du cabinet</li>
              <li><code className="bg-surface-raised px-1 rounded text-ink">{"{date}"}</code> : Date du rendez-vous</li>
              <li><code className="bg-surface-raised px-1 rounded text-ink">{"{time}"}</code> : Heure du rendez-vous</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Rappel à J-2 (48h avant)</label>
            <textarea
              rows={3}
              value={form.templateReminder48h || ""}
              onChange={e => setForm(f => ({ ...f, templateReminder48h: e.target.value }))}
              placeholder={DEFAULT_REMINDER_48H}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <p className="text-xs text-ink-soft">Laissez vide pour utiliser le modèle par défaut.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Rappel à J-1 (24h avant)</label>
            <textarea
              rows={3}
              value={form.templateReminder24h || ""}
              onChange={e => setForm(f => ({ ...f, templateReminder24h: e.target.value }))}
              placeholder={DEFAULT_REMINDER_24H}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <p className="text-xs text-ink-soft">Laissez vide pour utiliser le modèle par défaut.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ink">Relance patients inactifs</label>
            <textarea
              rows={3}
              value={form.templateRelance || ""}
              onChange={e => setForm(f => ({ ...f, templateRelance: e.target.value }))}
              placeholder={DEFAULT_RELANCE}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
            <p className="text-xs text-ink-soft">Envoyé automatiquement selon la fréquence de relance du patient.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
