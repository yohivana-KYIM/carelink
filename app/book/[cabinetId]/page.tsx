"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CalendarCheck, Clock, User, Phone, Stethoscope } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import Image from "next/image";
import { motion } from "motion/react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

type PublicCabinet = {
  id: string;
  name: string;
  city: string | null;
  practitioners: { id: string; fullName: string }[];
};

export default function PublicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const cabinetId = params.cabinetId as string;
  
  const [cabinet, setCabinet] = useState<PublicCabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    scheduledAt: "",
    practitionerId: "",
    careType: "",
    notes: "",
  });

  useEffect(() => {
    if (!cabinetId) return;
    api.getPublicCabinetInfo(cabinetId)
      .then(res => setCabinet(res.cabinet))
      .catch(() => toast.error("Le cabinet demandé est introuvable"))
      .finally(() => setLoading(false));
  }, [cabinetId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cabinet) return;
    setSubmitting(true);
    try {
      await api.requestPublicAppointment(cabinet.id, {
        ...form,
        practitionerId: form.practitionerId || undefined,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la demande");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-ink-soft">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!cabinet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-ink-soft">
        <p>Cabinet introuvable ou lien invalide.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-raised p-4">
        <div className="max-w-md w-full rounded-3xl bg-background p-8 text-center shadow-xl border border-border">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CalendarCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">Demande envoyée !</h1>
          <p className="text-ink-muted mb-6">
            Votre demande de rendez-vous au cabinet <strong>{cabinet.name}</strong> a bien été enregistrée. 
            Le secrétariat vous contactera prochainement pour confirmer la date.
          </p>
          <button onClick={() => window.location.reload()} className="text-brand-600 font-semibold hover:underline">
            Faire une autre demande
          </button>
        </div>
      </div>
    );
  }

  // Get current date string for min value
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="relative min-h-screen bg-surface-raised py-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-0">
      <GeometricDecorations />
      <div className="relative z-10 mx-auto max-w-xl">
        <div className="text-center mb-8">
          <Image src="/images/ecotocare-icon.png" alt="Ecotocare" width={48} height={48} className="mx-auto rounded-xl mb-4 shadow-sm" />
          <h1 className="text-3xl font-bold tracking-tight text-ink">{cabinet.name}</h1>
          <p className="mt-2 text-ink-muted">Prenez rendez-vous en ligne {cabinet.city ? `à ${cabinet.city}` : ""}</p>
        </div>

        <div className="rounded-3xl bg-background shadow-xl border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-2"><User size={16}/> Nom complet</label>
                <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Jean Dupont" className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-2"><Phone size={16}/> Numéro WhatsApp</label>
                <div className="phone-input-container">
                  <PhoneInput
                    defaultCountry="fr"
                    value={form.phoneNumber}
                    onChange={(phone) => setForm({ ...form, phoneNumber: phone })}
                    required
                    style={{ width: '100%' }}
                    inputStyle={{ width: '100%', borderRadius: '0.75rem', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', border: '1px solid var(--border)', background: 'transparent', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--ink)' }}
                    countrySelectorStyleProps={{ buttonStyle: { borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem', border: '1px solid var(--border)', background: 'transparent', padding: '0 0.75rem' } }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink flex items-center gap-2"><Clock size={16}/> Date et heure souhaitées</label>
              <input required type="datetime-local" min={minDateTime} value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>

            {cabinet.practitioners.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-2"><Stethoscope size={16}/> Praticien (Optionnel)</label>
                <select value={form.practitionerId} onChange={e => setForm({...form, practitionerId: e.target.value})} className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-transparent">
                  <option value="">Pas de préférence</option>
                  {cabinet.practitioners.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Motif de consultation (Optionnel)</label>
              <input value={form.careType} onChange={e => setForm({...form, careType: e.target.value})} placeholder="Ex: Détartrage, Consultation générale..." className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>

            <button type="submit" disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-70">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CalendarCheck size={18} />}
              {submitting ? "Envoi de la demande..." : "Demander le rendez-vous"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[500px] opacity-[0.15] dark:opacity-10 mix-blend-multiply dark:mix-blend-screen blur-xl"
      >
        <Image src="/images/shape-1.png" alt="" width={600} height={600} className="w-full h-auto object-contain" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-10 right-0 w-[400px] opacity-[0.12] dark:opacity-5 mix-blend-multiply dark:mix-blend-screen blur-lg"
      >
        <Image src="/images/shape-2.png" alt="" width={500} height={500} className="w-full h-auto object-contain" />
      </motion.div>
    </div>
  );
}
