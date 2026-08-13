"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CabinetTheme } from "@/components/providers/CabinetTheme";
import { Loader2, CalendarCheck, Clock, User, Phone, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import Image from "next/image";
import { motion } from "motion/react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  isSameDay,
  parseISO,
  addWeeks,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale/fr";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PublicCabinet = {
  id: string;
  name: string;
  city: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  practitioners: { id: string; fullName: string }[];
};

type Slot = { time: string; available: boolean };

async function fetchSlots(cabinetId: string, date: string, practitionerId?: string): Promise<Slot[]> {
  const qs = new URLSearchParams({ date });
  if (practitionerId) qs.set("practitionerId", practitionerId);
  const res = await fetch(`${API_URL}/api/public/cabinets/${cabinetId}/slots?${qs}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.slots ?? [];
}

export default function PublicBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const cabinetId = params.cabinetId as string;
  // Lien personnalisé envoyé à un patient précis : /book/:cabinetId?patient=<id>
  const patientId = searchParams.get("patient");

  const [cabinet, setCabinet] = useState<PublicCabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Calendrier
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    practitionerId: "",
    careType: "",
    notes: "",
  });

  useEffect(() => {
    if (!cabinetId) return;
    api
      .getPublicCabinetInfo(cabinetId)
      .then((res) => setCabinet(res.cabinet))
      .catch(() => toast.error("Le cabinet demandé est introuvable"))
      .finally(() => setLoading(false));
  }, [cabinetId]);

  // Lien personnalisé : préremplit le nom et le téléphone du patient concerné.
  useEffect(() => {
    if (!cabinetId || !patientId) return;
    api
      .getPublicPatientInfo(cabinetId, patientId)
      .then((res) =>
        setForm((f) => ({ ...f, fullName: res.patient.fullName, phoneNumber: res.patient.phoneNumber }))
      )
      .catch(() => {
        /* lien invalide ou expiré : le patient remplit simplement le formulaire lui-même */
      });
  }, [cabinetId, patientId]);

  const loadSlots = useCallback(
    async (date: Date) => {
      if (!cabinetId) return;
      setSlotsLoading(true);
      setSelectedTime(null);
      const dateStr = format(date, "yyyy-MM-dd");
      const loaded = await fetchSlots(
        cabinetId,
        dateStr,
        form.practitionerId || undefined
      );
      setSlots(loaded);
      setSlotsLoading(false);
    },
    [cabinetId, form.practitionerId]
  );

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate, form.practitionerId, loadSlots]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cabinet || !selectedDate || !selectedTime) {
      toast.error("Veuillez sélectionner une date et un créneau horaire.");
      return;
    }
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      await api.requestPublicAppointment(cabinet.id, {
        ...form,
        practitionerId: form.practitionerId || undefined,
        scheduledAt: scheduledAt.toISOString(),
        patientId: patientId || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la demande";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-brand-600" size={32} />
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl bg-background p-8 text-center shadow-xl border border-border"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CalendarCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">Demande envoyée !</h1>
          <p className="text-ink-muted mb-2">
            Votre demande de rendez-vous au cabinet{" "}
            <strong>{cabinet.name}</strong> a bien été reçue.
          </p>
          <p className="text-sm text-ink-soft mb-6">
            📱 Vous allez recevoir une confirmation sur WhatsApp. Le secrétariat vous contactera pour valider le créneau.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedDate(null);
              setSelectedTime(null);
              setForm({ fullName: "", phoneNumber: "", practitionerId: "", careType: "", notes: "" });
            }}
            className="text-brand-600 font-semibold hover:underline"
          >
            Faire une autre demande
          </button>
        </motion.div>
      </div>
    );
  }

  // Jours de la semaine affichés
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  return (
    <div className="relative min-h-screen bg-surface-raised py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <CabinetTheme primaryColor={cabinet.primaryColor} />
      <GeometricDecorations />
      <div className="relative z-10 mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src={cabinet.logoUrl || "/images/ecotocare-icon.png"}
            alt={cabinet.name}
            width={48}
            height={48}
            unoptimized={Boolean(cabinet.logoUrl)}
            className="mx-auto rounded-xl mb-4 shadow-sm object-cover"
          />
          <h1 className="text-3xl font-bold tracking-tight text-ink">{cabinet.name}</h1>
          <p className="mt-2 text-ink-muted">
            Prise de rendez-vous en ligne{cabinet.city ? ` — ${cabinet.city}` : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Informations patient */}
          <div className="rounded-2xl bg-background border border-border p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-base font-semibold text-ink">Vos informations</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink flex items-center gap-1.5">
                  <User size={14} /> Nom complet *
                </label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jean Dupont"
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink flex items-center gap-1.5">
                  <Phone size={14} /> Numéro WhatsApp *
                </label>
                <div className="phone-input-container">
                  <PhoneInput
                    defaultCountry="fr"
                    value={form.phoneNumber}
                    onChange={(phone) => setForm({ ...form, phoneNumber: phone })}
                    style={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      borderRadius: "0.75rem",
                      borderTopLeftRadius: "0",
                      borderBottomLeftRadius: "0",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      padding: "0.625rem 1rem",
                      fontSize: "0.875rem",
                      color: "var(--ink)",
                    }}
                    countrySelectorStyleProps={{
                      buttonStyle: {
                        borderTopLeftRadius: "0.75rem",
                        borderBottomLeftRadius: "0.75rem",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        padding: "0 0.75rem",
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {cabinet.practitioners.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink flex items-center gap-1.5">
                  <Stethoscope size={14} /> Praticien
                </label>
                <select
                  value={form.practitionerId}
                  onChange={(e) => setForm({ ...form, practitionerId: e.target.value })}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-transparent focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Pas de préférence</option>
                  {cabinet.practitioners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-ink">Motif de consultation (optionnel)</label>
              <input
                value={form.careType}
                onChange={(e) => setForm({ ...form, careType: e.target.value })}
                placeholder="Ex: Détartrage, Consultation générale..."
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Calendrier des créneaux */}
          <div className="rounded-2xl bg-background border border-border p-6 shadow-sm flex flex-col gap-5">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              <Clock size={16} /> Choisissez un créneau
            </h2>

            {/* Navigation semaine */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWeekStart((w) => subWeeks(w, 1))}
                disabled={weekStart <= today}
                className="rounded-full border border-border p-2 hover:bg-surface-raised disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-ink-muted capitalize">
                {format(weekStart, "MMMM yyyy", { locale: fr })}
              </span>
              <button
                type="button"
                onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                className="rounded-full border border-border p-2 hover:bg-surface-raised"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const isPast = day < today && !isSameDay(day, today);
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isToday = isSameDay(day, today);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedDate(day)}
                    className={[
                      "flex flex-col items-center rounded-xl py-2 px-1 text-xs font-medium transition",
                      isPast
                        ? "cursor-not-allowed text-ink-soft opacity-40"
                        : isSelected
                          ? "bg-brand-600 text-white shadow-sm"
                          : isToday
                            ? "border border-brand-300 text-brand-600"
                            : "hover:bg-surface-raised text-ink",
                    ].join(" ")}
                  >
                    <span className="uppercase text-[10px] opacity-70">
                      {format(day, "EEE", { locale: fr })}
                    </span>
                    <span className="text-base font-semibold">{format(day, "d")}</span>
                  </button>
                );
              })}
            </div>

            {/* Créneaux horaires */}
            {selectedDate && (
              <div>
                <p className="mb-3 text-sm font-medium text-ink-muted capitalize">
                  {format(selectedDate, "EEEE d MMMM", { locale: fr })}
                </p>
                {slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-ink-soft" size={20} />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-sm text-ink-soft py-4">
                    Aucun créneau disponible ce jour. Essayez une autre date.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={[
                          "rounded-xl border py-2 text-sm font-medium transition",
                          !slot.available
                            ? "cursor-not-allowed border-border bg-surface text-ink-soft opacity-40 line-through"
                            : selectedTime === slot.time
                              ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                              : "border-border hover:border-brand-400 hover:bg-brand-50 text-ink dark:hover:bg-brand-500/10",
                        ].join(" ")}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <p className="text-center text-sm text-ink-soft py-2">
                Sélectionnez un jour dans le calendrier ci-dessus.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedDate || !selectedTime || !form.fullName || !form.phoneNumber}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CalendarCheck size={18} />
            )}
            {submitting ? "Envoi de la demande..." : "Confirmer la demande de rendez-vous"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GeometricDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[400px] opacity-10 blur-xl"
      >
        <Image src="/images/shape-1.png" alt="" width={400} height={400} className="w-full" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-10 right-0 w-[300px] opacity-10 blur-lg"
      >
        <Image src="/images/shape-2.png" alt="" width={300} height={300} className="w-full" />
      </motion.div>
    </div>
  );
}
