"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  practitionerId: string | null;
};

type Practitioner = { id: string; fullName: string };

export default function AvailabilityPage() {
  const { token, user } = useSession();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    slotDurationMin: 30,
    practitionerId: "",
  });

  async function load() {
    if (!token) return;
    try {
      const [availRes, pracRes] = await Promise.all([
        fetch(`${API_URL}/api/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/practitioners`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const avail = await availRes.json();
      const prac = await pracRes.json();
      setAvailabilities(avail.availabilities ?? []);
      setPractitioners(prac.practitioners ?? []);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/availability`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          practitionerId: form.practitionerId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur");
      }
      toast.success("Disponibilité ajoutée");
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Supprimer cette disponibilité ?")) return;
    try {
      await fetch(`${API_URL}/api/availability/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Disponibilité supprimée");
      await load();
    } catch {
      toast.error("Erreur de suppression");
    }
  }

  if (user?.role !== "ADMIN" && user?.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-ink-soft text-sm">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Disponibilités & Créneaux</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Définissez les plages horaires proposées aux patients lors de la prise de rendez-vous en ligne.
          Les créneaux déjà occupés seront automatiquement grisés.
        </p>
      </div>

      {/* Formulaire ajout */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <Plus size={18} />
          </span>
          <h2 className="text-base font-semibold text-ink">Ajouter une plage</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">Jour</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: parseInt(e.target.value) })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">Heure début</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">Heure fin</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink">Durée créneau (min)</label>
            <select
              value={form.slotDurationMin}
              onChange={(e) => setForm({ ...form, slotDurationMin: parseInt(e.target.value) })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            >
              {[10, 15, 20, 30, 45, 60].map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-medium text-ink">Praticien (optionnel)</label>
            <select
              value={form.practitionerId}
              onChange={(e) => setForm({ ...form, practitionerId: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            >
              <option value="">Tout le cabinet</option>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Ajouter la plage
          </button>
        </div>
      </form>

      {/* Liste des disponibilités */}
      <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center gap-2">
          <Clock size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-ink">Plages configurées</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink-soft" size={24} />
          </div>
        ) : availabilities.length === 0 ? (
          <p className="text-center text-sm text-ink-soft py-10">
            Aucune disponibilité configurée. Ajoutez des plages pour que les patients puissent réserver.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {availabilities.map((a) => {
              const prac = practitioners.find((p) => p.id === a.practitionerId);
              return (
                <div key={a.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {DAYS[a.dayOfWeek]} · {a.startTime} — {a.endTime}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Créneaux de {a.slotDurationMin} min
                      {prac ? ` · ${prac.fullName}` : " · Tout le cabinet"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-ink-soft hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
