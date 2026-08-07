"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck, CalendarClock, Loader2, TrendingUp, Users,
  AlertTriangle, RefreshCw, BarChart2, FileText,
} from "lucide-react";
import { useSession } from "@/lib/session";
import { api, type DashboardSummary } from "@/lib/api";
import { PendingGate } from "@/components/dashboard/PendingGate";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function DashboardOverviewPage() {
  const { token, cabinet, user } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!token || cabinet?.status !== "ACTIVE") { setLoading(false); return; }
    setLoading(true);
    api.dashboardSummary(token, year ? { year } : {})
      .then(r => setSummary(r.summary))
      .finally(() => setLoading(false));
  }, [token, cabinet?.status, year]);

  if (cabinet && cabinet.status !== "ACTIVE") return <PendingGate cabinet={cabinet} />;

  const stats = [
    { icon: CalendarClock, label: "Aujourd'hui", value: summary?.todayCount ?? 0, color: "brand" },
    { icon: CalendarCheck, label: "Cette semaine", value: summary?.weekCount ?? 0, color: "emerald" },
    {
      icon: TrendingUp,
      label: "Taux de confirmation",
      value: summary?.confirmationRate != null ? `${Math.round(summary.confirmationRate * 100)}%` : "—",
      color: "violet",
    },
    { icon: Users, label: "Récupérés (relances)", value: summary?.recoveredByRelance ?? 0, color: "sky" },
    { icon: AlertTriangle, label: "No-shows", value: summary?.noShowCount ?? 0, color: "amber" },
    { icon: RefreshCw, label: "À reprogrammer", value: summary?.rescheduleCount ?? 0, color: "orange" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Bonjour {user?.fullName?.split(" ")[0] ?? ""} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Aperçu de l'activité de {cabinet?.name ?? "votre cabinet"}.
          </p>
        </div>
        {/* Filtre année */}
        <select
          value={year ?? ""}
          onChange={e => setYear(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink focus:outline-none"
        >
          <option value="">Toutes les années</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-ink-soft" size={22} /></div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-raised p-4">
                <span className={`flex size-9 items-center justify-center rounded-xl bg-${color}-50 text-${color}-600 dark:bg-${color}-500/10 dark:text-${color}-400`}>
                  <Icon size={16} />
                </span>
                <p className="text-xl font-bold text-ink">{value}</p>
                <p className="text-xs text-ink-soft leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Alertes */}
          {(summary?.rescheduleCount ?? 0) > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                🔄 {summary!.rescheduleCount} RDV en attente de reprogrammation
              </p>
              <a href="/dashboard/appointments?status=RESCHEDULE_REQUESTED"
                className="mt-1 inline-block text-xs font-medium text-amber-600 hover:underline">
                Gérer →
              </a>
            </div>
          )}

          {/* Status breakdown */}
          {summary && summary.statusBreakdown.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface-raised p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-brand-600" />
                <h2 className="text-base font-semibold text-ink">Répartition par statut</h2>
              </div>
              <div className="flex flex-col gap-2">
                {summary.statusBreakdown.map(({ status, count }) => (
                  <StatusBar key={status} status={status} count={count}
                    total={summary.statusBreakdown.reduce((s, e) => s + e.count, 0)} />
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/dashboard/appointments", label: "Gérer les RDV", icon: CalendarCheck, color: "brand" },
              { href: "/dashboard/patients", label: "Liste patients", icon: Users, color: "emerald" },
              { href: "/dashboard/reports", label: "Rapports", icon: FileText, color: "violet" },
              { href: "/dashboard/availability", label: "Disponibilités", icon: CalendarClock, color: "sky" },
            ].map(({ href, label, icon: Icon, color }) => (
              <a key={href} href={href}
                className={`flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 font-medium text-${color}-700 hover:bg-${color}-50 dark:text-${color}-300 dark:hover:bg-${color}-500/10 transition`}>
                <Icon size={18} />
                {label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  PENDING: "bg-amber-400",
  CANCELLED: "bg-red-400",
  NO_SHOW: "bg-red-600",
  RESCHEDULE_REQUESTED: "bg-orange-400",
  COMPLETED: "bg-blue-500",
  NO_RESPONSE: "bg-gray-400",
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmés",
  PENDING: "En attente",
  CANCELLED: "Annulés",
  NO_SHOW: "Absents",
  RESCHEDULE_REQUESTED: "À reprogrammer",
  COMPLETED: "Terminés",
  NO_RESPONSE: "Sans réponse",
};

function StatusBar({ status, count, total }: { status: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-xs text-ink-muted">{STATUS_LABELS[status] ?? status}</span>
      <div className="flex-1 rounded-full bg-surface h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${STATUS_COLORS[status] ?? "bg-brand-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-ink">{count}</span>
    </div>
  );
}
