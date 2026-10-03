"use client";

import { useEffect, useState, FormEvent, useMemo, useRef } from "react";
import { motion } from "motion/react";
import {
  Loader2, Plus, Edit, X, List, Grid, Download, Upload,
  CalendarClock, CalendarCheck, RefreshCw, Search, Phone,
  CheckCircle2, Clock3, AlertCircle, Ban, PauseCircle, ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Appointment, type Patient, type Practitioner } from "@/lib/api";
import { useSocket } from "@/lib/socket";

import { Calendar, dateFnsLocalizer, Views, type EventProps, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ─── Statuts : une seule source de vérité pour le badge, le point de couleur
// et la couleur des événements du calendrier — évite que les deux vues se
// désynchronisent visuellement.
const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string; icon: typeof CheckCircle2; color: string }
> = {
  PENDING: {
    label: "En attente",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    dot: "bg-sky-500",
    icon: Clock3,
    color: "#0284c7",
  },
  CONFIRMED: {
    label: "Confirmé",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    color: "#059669",
  },
  RESCHEDULE_REQUESTED: {
    label: "Report demandé",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: AlertCircle,
    color: "#d97706",
  },
  NO_RESPONSE: {
    label: "Sans réponse",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: PauseCircle,
    color: "#64748b",
  },
  CANCELLED: {
    label: "Annulé",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-400",
    icon: Ban,
    color: "#94a3b8",
  },
  COMPLETED: {
    label: "Terminé",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    dot: "bg-violet-500",
    icon: CheckCircle2,
    color: "#7c3aed",
  },
};
const FALLBACK_STATUS = STATUS_CONFIG.PENDING;

function statusConfig(status: string) {
  return STATUS_CONFIG[status] ?? FALLBACK_STATUS;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-muted hover:bg-surface"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

type CalEvent = { id: string; title: string; start: Date; end: Date; resource: Appointment };

function CalendarEvent({ event }: EventProps<CalEvent>) {
  const a = event.resource;
  const cfg = statusConfig(a.status);
  const time = event.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col leading-tight text-white">
      <span className="flex items-center gap-1 text-[11px] font-semibold opacity-95">
        {cfg.icon ? <cfg.icon size={10} /> : null}
        {time}
      </span>
      <span className="truncate font-medium">{a.patient?.fullName ?? "Patient"}</span>
      {a.careType && <span className="truncate text-[11px] opacity-85">{a.careType}</span>}
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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [year, setYear] = useState("");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ patientId: "", practitionerId: "", scheduledAt: "", careType: "", notes: "", status: "PENDING" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      // Pour le calendrier, on charge tout (all), avec filtre annee optionnel
      const [resAppts, resPats, resPracs] = await Promise.all([
        api.listAppointments(token, { range: "all", year: year ? Number(year) : undefined, pageSize: 5000 }),
        api.listPatients(token),
        api.listPractitioners(token),
      ]);
      setAppointments(resAppts.appointments);
      setPatients(resPats.patients);
      setPractitioners(resPracs.practitioners);
    } catch {
      toast.error("Erreur de chargement");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, year]);

  // Mise à jour temps réel : un patient répond sur WhatsApp, ou un membre de
  // l'équipe modifie un RDV ailleurs → la liste/calendrier se rafraîchit seule.
  const socket = useSocket(token);
  useEffect(() => {
    if (!socket) return;
    const onUpdated = () => void load();
    socket.on("appointment:updated", onUpdated);
    return () => {
      socket.off("appointment:updated", onUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  function handleExportCSV() {
    const headers = ["Patient", "Praticien", "Date", "Heure", "Statut", "Motif"];
    const rows = appointments.map((a) => {
      const d = new Date(a.scheduledAt);
      return [
        `"${a.patient?.fullName ?? ""}"`,
        `"${a.practitioner?.fullName ?? ""}"`,
        d.toLocaleDateString("fr-FR"),
        d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        statusConfig(a.status).label,
        `"${a.careType ?? ""}"`,
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rendez-vous_ecotocare.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${appointments.length} rendez-vous exportés`);
  }

  // CSV attendu : Téléphone patient, Date (AAAA-MM-JJTHH:mm ou équivalent ISO), Motif (optionnel)
  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length <= 1) {
        toast.error("Fichier vide.");
        return;
      }
      const parsed = lines
        .slice(1)
        .map((row) => {
          const cols = row.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
          if (cols.length >= 2 && cols[0] && cols[1]) {
            return { patientPhoneNumber: cols[0], scheduledAt: new Date(cols[1]).toISOString(), careType: cols[2] || undefined };
          }
          return null;
        })
        .filter(Boolean) as Array<{ patientPhoneNumber: string; scheduledAt: string; careType?: string }>;

      if (!parsed.length) {
        toast.error("Aucun rendez-vous valide dans le fichier.");
        return;
      }
      try {
        setLoading(true);
        const res = await api.bulkCreateAppointments(token, parsed);
        if (res.createdCount > 0) toast.success(`${res.createdCount} rendez-vous importés`);
        if (res.skipped.length > 0) {
          toast.error(`${res.skipped.length} ligne(s) ignorée(s) — ${res.skipped[0].reason}`);
        }
        await load();
      } catch {
        toast.error("Erreur d'importation");
        setLoading(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  // Calcul des métriques
  const { todayCount, tomorrowCount, rescheduleCount, confirmedCount } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    let tCount = 0, tmCount = 0, rsCount = 0, cCount = 0;
    appointments.forEach((a) => {
      const dStr = new Date(a.scheduledAt).toISOString().slice(0, 10);
      if (dStr === todayStr) tCount++;
      if (dStr === tomorrowStr) tmCount++;
      if (a.status === "RESCHEDULE_REQUESTED") rsCount++;
      if (a.status === "CONFIRMED" && dStr >= todayStr) cCount++;
    });
    return { todayCount: tCount, tomorrowCount: tmCount, rescheduleCount: rsCount, confirmedCount: cCount };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (a.patient?.fullName ?? "").toLowerCase().includes(q) ||
        (a.patient?.phoneNumber ?? "").toLowerCase().includes(q) ||
        (a.careType ?? "").toLowerCase().includes(q)
      );
    });
  }, [appointments, search, statusFilter]);

  // Dans les deux vues (calendrier et liste), les plus récents en premier
  // dans la liste n'a pas de sens pour un agenda : on garde l'ordre chronologique.
  const sortedFiltered = useMemo(
    () => [...filteredAppointments].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [filteredAppointments]
  );

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize));
  const paginatedAppointments = sortedFiltered.slice((page - 1) * pageSize, page * pageSize);

  function openCreateModal(defaultDate?: Date) {
    setEditingId(null);
    let dateStr = new Date().toISOString().slice(0, 16);
    if (defaultDate) {
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
      status: appointment.status,
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
        ...(editingId ? { status: form.status as Appointment["status"] } : {}),
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'enregistrement");
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
    } catch {
      toast.error("Erreur d'annulation");
    }
  }

  async function handleQuickConfirm(id: string) {
    if (!token) return;
    try {
      await api.updateAppointment(token, id, { status: "CONFIRMED" });
      toast.success("Rendez-vous confirmé");
      await load();
    } catch {
      toast.error("Erreur de mise à jour");
    }
  }

  // Événements du calendrier
  const events = useMemo<CalEvent[]>(() => {
    return filteredAppointments.map((a) => {
      const start = new Date(a.scheduledAt);
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30); // Durée par défaut : 30 min
      return { id: a.id, title: `${a.patient?.fullName || "Patient"} - ${a.careType || "RDV"}`, start, end, resource: a };
    });
  }, [filteredAppointments]);

  // Quand la période affichée (mois/semaine/jour courant) ne contient aucun
  // RDV, on propose de sauter directement au RDV filtré le plus proche dans
  // le temps — évite de se demander "pourquoi je ne vois rien" en pensant
  // qu'il n'y a pas de RDV du tout, alors qu'ils sont juste ailleurs dans le calendrier.
  const nearestEvent = useMemo(() => {
    if (events.length === 0) return null;
    const windowDays = calendarView === Views.DAY ? 0 : calendarView === Views.WEEK ? 6 : 31;
    const inWindow = events.some((e) => Math.abs(e.start.getTime() - calendarDate.getTime()) <= windowDays * 86_400_000);
    if (inWindow) return null;
    return events.reduce((closest, e) =>
      Math.abs(e.start.getTime() - calendarDate.getTime()) < Math.abs(closest.start.getTime() - calendarDate.getTime()) ? e : closest
    );
  }, [events, calendarDate, calendarView]);

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Agenda & Rendez-vous</h1>
          <p className="mt-1 text-sm text-ink-muted">Gérez vos disponibilités et suivez le flux de patients.</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 w-fit"
        >
          <Plus size={16} /> Nouveau RDV
        </button>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
            <CalendarClock size={18} />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-muted">Aujourd&apos;hui</p>
            <p className="text-2xl font-bold text-ink leading-tight">{todayCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10">
            <CalendarClock size={18} />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-muted">Demain</p>
            <p className="text-2xl font-bold text-ink leading-tight">{tomorrowCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <CalendarCheck size={18} />
          </span>
          <div>
            <p className="text-xs font-medium text-ink-muted">Confirmés à venir</p>
            <p className="text-2xl font-bold text-ink leading-tight">{confirmedCount}</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm ${rescheduleCount > 0 ? "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10" : "border-border bg-surface-raised"}`}>
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${rescheduleCount > 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" : "bg-surface text-ink-soft"}`}>
            <RefreshCw size={18} />
          </span>
          <div>
            <p className={`text-xs font-medium ${rescheduleCount > 0 ? "text-amber-700 dark:text-amber-400" : "text-ink-muted"}`}>À reprogrammer</p>
            <p className={`text-2xl font-bold leading-tight ${rescheduleCount > 0 ? "text-amber-700 dark:text-amber-300" : "text-ink"}`}>{rescheduleCount}</p>
          </div>
        </div>
      </div>

      {/* Alerte reprogrammation — reste en tête de page, actionnable en un clic */}
      {rescheduleCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> {rescheduleCount} rendez-vous à reprogrammer
          </p>
          <div className="flex flex-col gap-2">
            {appointments
              .filter((a) => a.status === "RESCHEDULE_REQUESTED")
              .map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-4 py-3 dark:bg-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 dark:bg-amber-500/30 dark:text-amber-300">
                      {initials(a.patient?.fullName ?? "?")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{a.patient?.fullName}</p>
                      <p className="text-xs text-ink-muted">
                        Ancien créneau : {new Date(a.scheduledAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(a)}
                    className="shrink-0 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Reprogrammer
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher un patient, un numéro..."
              className="w-56 rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm text-ink focus:border-brand-400 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-full border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none"
          >
            <option value="">Toutes les années</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <Download size={15} /> Exporter
          </button>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Format CSV : Téléphone patient, Date (ISO), Motif (optionnel)"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <Upload size={15} /> Importer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft"><Loader2 className="animate-spin" size={24} /></div>
      ) : viewMode === "calendar" ? (
        <div className="flex flex-col gap-3">
          {/* Sauter à une date précise — le libellé du calendrier (ex: "28 sept. — 4 oct.") n'est pas cliquable */}
          <div className="flex items-center gap-2 self-end">
            <label htmlFor="calendar-jump-date" className="text-xs font-medium text-ink-muted">Aller à la date :</label>
            <input
              id="calendar-jump-date"
              type="date"
              value={format(calendarDate, "yyyy-MM-dd")}
              onChange={(e) => {
                if (!e.target.value) return;
                setCalendarDate(parse(e.target.value, "yyyy-MM-dd", new Date()));
              }}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-ink focus:border-brand-400 focus:outline-none"
            />
          </div>

          {nearestEvent && (
            <button
              onClick={() => setCalendarDate(nearestEvent.start)}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-left text-sm text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/15"
            >
              <span>
                Aucun rendez-vous sur cette période. Le plus proche est <strong>{nearestEvent.resource.patient?.fullName}</strong> le{" "}
                {nearestEvent.start.toLocaleDateString("fr-FR", { dateStyle: "long" })}.
              </span>
              <span className="flex shrink-0 items-center gap-1 font-semibold">Y aller <ArrowRight size={14} /></span>
            </button>
          )}

          <div className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
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
                noEventsInRange: "Aucun rendez-vous sur cette période.",
                showMore: (total) => `+ ${total} autre(s)`,
              }}
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              view={calendarView}
              onView={(view) => setCalendarView(view)}
              views={["month", "week", "day", "agenda"]}
              onSelectEvent={(event) => openEditModal(event.resource)}
              onSelectSlot={(slotInfo) => openCreateModal(slotInfo.start)}
              selectable
              popup
              components={{ event: CalendarEvent }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: statusConfig((event as CalEvent).resource.status).color,
                  borderRadius: 8,
                },
              })}
              className="text-sm text-ink"
              style={{ height: "70vh" }}
            />
          </div>
          {/* Légende des couleurs */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-surface-raised px-4 py-3 text-xs text-ink-muted">
            <span className="font-semibold text-ink-soft">Légende :</span>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Date et heure</th>
                  <th className="px-5 py-3">Type de soin</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedAppointments.length > 0 ? paginatedAppointments.map((a) => {
                  const cfg = statusConfig(a.status);
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-surface/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-500/15">
                            {initials(a.patient?.fullName ?? "?")}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">{a.patient?.fullName || "Inconnu"}</p>
                            {a.patient?.phoneNumber && (
                              <p className="flex items-center gap-1 text-xs text-ink-soft">
                                <Phone size={10} /> {a.patient.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-muted whitespace-nowrap">
                        {new Date(a.scheduledAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{a.careType || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {a.status === "RESCHEDULE_REQUESTED" && (
                            <button
                              onClick={() => openEditModal(a)}
                              className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                            >
                              Reprogrammer
                            </button>
                          )}
                          {(a.status === "PENDING" || a.status === "NO_RESPONSE") && (
                            <button
                              onClick={() => handleQuickConfirm(a.id)}
                              title="Marquer comme confirmé"
                              className="rounded-full p-1.5 text-ink-soft hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button onClick={() => openEditModal(a)} title="Modifier" className="rounded-full p-1.5 text-ink-soft hover:bg-surface hover:text-brand-600">
                            <Edit size={16} />
                          </button>
                          {a.status !== "CANCELLED" && (
                            <button onClick={() => handleCancel(a.id)} title="Annuler" className="rounded-full p-1.5 text-ink-soft hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-ink-soft">
                      Aucun rendez-vous {search || statusFilter ? "ne correspond à ces filtres" : "trouvé"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <p>{sortedFiltered.length} RDV · page {page}/{totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Précédent</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink">Patient</label>
            <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} disabled={!!editingId} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none disabled:opacity-60">
              <option value="">Sélectionner un patient...</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} - {p.phoneNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Praticien (optionnel)</label>
            <select value={form.practitionerId} onChange={(e) => setForm({ ...form, practitionerId: e.target.value })} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none">
              <option value="">Aucun praticien assigné</option>
              {practitioners.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Date et heure</label>
            <input type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Type de soin (optionnel)</label>
            <input value={form.careType} onChange={(e) => setForm({ ...form, careType: e.target.value })} placeholder="ex: Détartrage" className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          {editingId && (
            <div>
              <label className="text-sm font-medium text-ink">Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-ink">Notes additionnelles</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : (editingId ? "Enregistrer" : "Créer")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
