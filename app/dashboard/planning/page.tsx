"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Loader2, Phone, Printer, RefreshCw, Stethoscope,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Appointment, type Practitioner } from "@/lib/api";
import { STATUS_CONFIG, statusConfig } from "@/lib/appointment-status";

const TODAY_LABEL = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function PlanningPage() {
  const { token, cabinet } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [practitionerFilter, setPractitionerFilter] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [apptRes, practRes] = await Promise.all([
        api.listAppointments(token, { range: "today", pageSize: 200 }),
        api.listPractitioners(token),
      ]);
      setAppointments(apptRes.appointments);
      setPractitioners(practRes.practitioners);
    } catch {
      toast.error("Erreur de chargement du planning du jour.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const todaysAppointments = useMemo(
    () =>
      appointments
        .filter((a) => !practitionerFilter || a.practitionerId === practitionerFilter)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [appointments, practitionerFilter]
  );

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = {};
    for (const a of todaysAppointments) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
    }
    return byStatus;
  }, [todaysAppointments]);

  const summaryStatuses = ["CONFIRMED", "PENDING", "RESCHEDULE_REQUESTED", "NO_SHOW"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Planning du jour</h1>
          <p className="mt-1 text-sm text-ink-muted capitalize">
            {TODAY_LABEL} — {cabinet?.name ?? "votre cabinet"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={practitionerFilter}
            onChange={(e) => setPractitionerFilter(e.target.value)}
            className="rounded-full border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none"
          >
            <option value="">Tous les praticiens</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised"
          >
            <RefreshCw size={15} /> Actualiser
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Printer size={15} /> Imprimer
          </button>
        </div>
      </div>

      {/* En-tête visible uniquement à l'impression */}
      <div className="hidden print:block">
        <h1 className="text-xl font-semibold text-black">Planning du jour — {cabinet?.name ?? ""}</h1>
        <p className="text-sm text-black capitalize">{TODAY_LABEL}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-ink-soft">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:hidden">
            <SummaryCard
              label="Rendez-vous aujourd'hui"
              value={todaysAppointments.length}
              icon={CalendarDays}
            />
            {summaryStatuses.map((status) => (
              <SummaryCard
                key={status}
                label={STATUS_CONFIG[status].label}
                value={counts[status] ?? 0}
                icon={STATUS_CONFIG[status].icon}
                badge={STATUS_CONFIG[status].badge}
              />
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border print:border-0">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-ink-soft print:bg-white print:text-black">
                <tr>
                  <th className="px-5 py-3">Heure</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3 print:hidden">Téléphone</th>
                  <th className="px-5 py-3">Praticien</th>
                  <th className="px-5 py-3">Motif</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-raised print:bg-white">
                {todaysAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-ink-soft">
                      Aucun rendez-vous aujourd&apos;hui.
                    </td>
                  </tr>
                ) : (
                  todaysAppointments.map((a) => {
                    const cfg = statusConfig(a.status);
                    const Icon = cfg.icon;
                    return (
                      <tr key={a.id}>
                        <td className="px-5 py-3 font-semibold text-ink print:text-black">
                          {new Date(a.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-ink print:text-black">{a.patient?.fullName ?? "—"}</td>
                        <td className="px-5 py-3 text-ink-muted print:hidden">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} /> {a.patient?.phoneNumber ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-muted print:text-black">
                          <span className="inline-flex items-center gap-1.5">
                            <Stethoscope size={13} /> {a.practitioner?.fullName ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-muted print:text-black">{a.careType ?? "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium print:border print:border-black print:bg-white print:text-black ${cfg.badge}`}>
                            <Icon size={12} /> {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  badge,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 shadow-card">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${badge ?? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
