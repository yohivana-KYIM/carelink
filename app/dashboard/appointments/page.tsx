"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { motion } from "motion/react";
import { Loader2, Plus, Calendar as CalendarIcon, Edit, X, List, Grid } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Appointment, type Patient, type Practitioner } from "@/lib/api";

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';

const locales = {
  'fr': fr,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-muted hover:bg-surface"><X size={20}/></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { token } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ patientId: "", practitionerId: "", scheduledAt: "", careType: "", notes: "", status: "PENDING" });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      // Pour le calendrier, on charge tout (all)
      const [resAppts, resPats, resPracs] = await Promise.all([
        api.listAppointments(token, "all"),
        api.listPatients(token),
        api.listPractitioners(token)
      ]);
      setAppointments(resAppts.appointments);
      setPatients(resPats.patients);
      setPractitioners(resPracs.practitioners);
    } catch (e) {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [token]);

  // Calcul des métriques
  const { todayCount, tomorrowCount, rescheduleCount } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    
    let tCount = 0;
    let tmCount = 0;
    let rsCount = 0;
    
    appointments.forEach(a => {
      const dStr = new Date(a.scheduledAt).toISOString().slice(0, 10);
      if (dStr === todayStr) tCount++;
      if (dStr === tomorrowStr) tmCount++;
      if (a.status === "RESCHEDULE_REQUESTED") rsCount++;
    });
    
    return { todayCount: tCount, tomorrowCount: tmCount, rescheduleCount: rsCount };
  }, [appointments]);

  const totalPages = Math.ceil(appointments.length / pageSize);
  const paginatedAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);

  function openCreateModal(defaultDate?: Date) {
    setEditingId(null);
    let dateStr = new Date().toISOString().slice(0, 16);
    if (defaultDate) {
      // Ajustement fuseau horaire pour le champ datetime-local
      const dateOffset = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000);
      dateStr = dateOffset.toISOString().slice(0, 16);
    }
    setForm({ patientId: "", practitionerId: "", scheduledAt: dateStr, careType: "", notes: "", status: "PENDING" });
    setModalOpen(true);
  }

  function openEditModal(appointment: Appointment) {
    setEditingId(appointment.id);
    const localDate = new Date(appointment.scheduledAt);
    const dateOffset = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
    setForm({ 
      patientId: appointment.patientId, 
      practitionerId: appointment.practitionerId || "",
      scheduledAt: dateOffset.toISOString().slice(0, 16), 
      careType: appointment.careType || "", 
      notes: appointment.notes || "",
      status: appointment.status
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const payload = {
        patientId: form.patientId,
        practitionerId: form.practitionerId || undefined,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        careType: form.careType,
        notes: form.notes,
        ...(editingId ? { status: form.status as any } : {})
      };
      
      if (editingId) {
        await api.updateAppointment(token, editingId, payload);
        toast.success("Rendez-vous mis à jour");
      } else {
        await api.createAppointment(token, payload);
        toast.success("Rendez-vous créé");
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Erreur d'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!token || !confirm("Annuler ce rendez-vous ?")) return;
    try {
      await api.cancelAppointment(token, id);
      toast.success("Rendez-vous annulé");
      await load();
    } catch (e) {
      toast.error("Erreur d'annulation");
    }
  }

  // Format events for calendar
  const events = useMemo(() => {
    return appointments.map(a => {
      const start = new Date(a.scheduledAt);
      const end = new Date(start);
      end.setHours(start.getHours() + 1); // Hypothèse: 1h de durée
      return {
        id: a.id,
        title: `${a.patient?.fullName || 'Patient'} - ${a.careType || 'RDV'}`,
        start,
        end,
        resource: a
      };
    });
  }, [appointments]);

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête et métriques */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Agenda & Rendez-vous</h1>
          <p className="mt-1 text-sm text-ink-muted">Gérez vos disponibilités et suivez le flux de patients.</p>
        </div>
        <button onClick={() => openCreateModal()} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 w-fit">
          <Plus size={16} /> Nouveau RDV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
          <p className="text-sm font-medium text-ink-muted">Aujourd'hui</p>
          <p className="mt-1 text-3xl font-bold text-ink">{todayCount}</p>
          <p className="mt-1 text-xs text-ink-soft">Patients attendus</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
          <p className="text-sm font-medium text-ink-muted">Demain</p>
          <p className="mt-1 text-3xl font-bold text-ink">{tomorrowCount}</p>
          <p className="mt-1 text-xs text-ink-soft">Patients programmés</p>
        </div>
        {rescheduleCount > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 sm:col-span-2">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">🔄 Reprogrammations demandées</p>
            <p className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-300">{rescheduleCount}</p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">Patient(s) souhaitant changer de créneau — à traiter</p>
          </div>
        )}
      </div>

      {/* Alerte reprogrammation */}
      {rescheduleCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">
            🔄 {rescheduleCount} rendez-vous à reprogrammer
          </p>
          <div className="flex flex-col gap-2">
            {appointments
              .filter((a) => a.status === "RESCHEDULE_REQUESTED")
              .map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3 dark:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-ink">{a.patient?.fullName}</p>
                    <p className="text-xs text-ink-muted">
                      RDV prévu le {new Date(a.scheduledAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditModal(a)}
                    className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Reprogrammer
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "calendar" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-raised"}`}
        >
          <Grid size={16} /> Calendrier
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${viewMode === "list" ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-raised"}`}
        >
          <List size={16} /> Liste détaillée
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft"><Loader2 className="animate-spin" size={24} /></div>
      ) : viewMode === "calendar" ? (
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="fr"
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucun rendez-vous sur cette période."
            }}
            defaultView={Views.WEEK}
            views={['month', 'week', 'day']}
            onSelectEvent={(event) => openEditModal(event.resource)}
            onSelectSlot={(slotInfo) => openCreateModal(slotInfo.start)}
            selectable
            className="text-sm text-ink"
            style={{ height: '70vh' }}
          />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Date et Heure</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Type de soin</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedAppointments.length > 0 ? paginatedAppointments.map(a => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 font-medium text-ink">{new Date(a.scheduledAt).toLocaleString("fr-FR")}</td>
                    <td className="px-5 py-3 text-ink-muted">{a.patient?.fullName || "Inconnu"}</td>
                    <td className="px-5 py-3 text-ink-muted">{a.careType || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right flex gap-2 justify-end">
                      <button onClick={() => openEditModal(a)} className="text-ink-soft hover:text-brand-600"><Edit size={16}/></button>
                      {a.status !== "CANCELLED" && (
                        <button onClick={() => handleCancel(a.id)} className="text-ink-soft hover:text-red-600"><X size={16}/></button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-soft">Aucun rendez-vous trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <p>{appointments.length} RDV · page {page}/{totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Précédent</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink">Patient</label>
            <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} disabled={!!editingId} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none disabled:opacity-60">
              <option value="">Sélectionner un patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} - {p.phoneNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Praticien (optionnel)</label>
            <select value={form.practitionerId} onChange={e => setForm({...form, practitionerId: e.target.value})} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none">
              <option value="">Aucun praticien assigné</option>
              {practitioners.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Date et heure</label>
            <input type="datetime-local" required value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Type de soin (optionnel)</label>
            <input value={form.careType} onChange={e => setForm({...form, careType: e.target.value})} placeholder="ex: Détartrage" className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          {editingId && (
            <div>
              <label className="text-sm font-medium text-ink">Statut</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none">
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmé</option>
                <option value="RESCHEDULE_REQUESTED">Report demandé</option>
                <option value="NO_RESPONSE">Sans réponse</option>
                <option value="CANCELLED">Annulé</option>
                <option value="COMPLETED">Terminé</option>
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-ink">Notes additionnelles</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "Enregistrer" : "Créer")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
