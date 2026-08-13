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
    { icon: CalendarClock, label: "Aujourd'hui", value: summary?.todayCount ?? 0, colorIcon: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400", colorGlow: "from-brand-50/60 dark:from-brand-500/10" },
    { icon: CalendarCheck, label: "Cette semaine", value: summary?.weekCount ?? 0, colorIcon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", colorGlow: "from-emerald-50/60 dark:from-emerald-500/10" },
    {
      icon: TrendingUp,
      label: "Taux de confirmation",
      value: summary?.confirmationRate != null ? `${Math.round(summary.confirmationRate * 100)}%` : "—",
      colorIcon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      colorGlow: "from-violet-50/60 dark:from-violet-500/10",
    },
    { icon: Users, label: "Récupérés (relances)", value: summary?.recoveredByRelance ?? 0, colorIcon: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400", colorGlow: "from-sky-50/60 dark:from-sky-500/10" },
    { icon: AlertTriangle, label: "No-shows", value: summary?.noShowCount ?? 0, colorIcon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", colorGlow: "from-amber-50/60 dark:from-amber-500/10" },
    { icon: RefreshCw, label: "À reprogrammer", value: summary?.rescheduleCount ?? 0, colorIcon: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400", colorGlow: "from-orange-50/60 dark:from-orange-500/10" },
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
            {stats.map(({ icon: Icon, label, value, colorIcon, colorGlow }) => (
              <div key={label} className="group relative overflow-hidden flex flex-col gap-2 rounded-2xl border border-border bg-surface-raised p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border">
                <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${colorGlow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <span className={`relative flex size-9 items-center justify-center rounded-xl ${colorIcon} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={16} />
                </span>
                <p className="relative text-xl font-bold text-ink">{value}</p>
                <p className="relative text-xs text-ink-soft leading-tight">{label}</p>
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
            <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <BarChart2 size={15} />
                </span>
                <h2 className="text-base font-semibold text-ink">Répartition par statut</h2>
              </div>
              <div className="flex flex-col gap-3">
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
              { href: "/dashboard/appointments", label: "Gérer les RDV", icon: CalendarCheck, colorIcon: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300", colorHover: "hover:border-brand-200 hover:bg-brand-50/60 dark:hover:border-brand-700 dark:hover:bg-brand-500/10" },
              { href: "/dashboard/patients", label: "Liste patients", icon: Users, colorIcon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", colorHover: "hover:border-emerald-200 hover:bg-emerald-50/60 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10" },
              { href: "/dashboard/reports", label: "Rapports", icon: FileText, colorIcon: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300", colorHover: "hover:border-violet-200 hover:bg-violet-50/60 dark:hover:border-violet-700 dark:hover:bg-violet-500/10" },
              { href: "/dashboard/availability", label: "Disponibilités", icon: CalendarClock, colorIcon: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300", colorHover: "hover:border-sky-200 hover:bg-sky-50/60 dark:hover:border-sky-700 dark:hover:bg-sky-500/10" },
            ].map(({ href, label, icon: Icon, colorIcon, colorHover }) => (
              <a key={href} href={href}
                className={`group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colorHover}`}>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colorIcon} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold">{label}</span>
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
      <span className="w-36 shrink-0 text-xs font-medium text-ink-muted">{STATUS_LABELS[status] ?? status}</span>
      <div className="flex-1 rounded-full bg-surface h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[status] ?? "bg-brand-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex w-16 shrink-0 items-center justify-end gap-1.5">
        <span className="text-xs font-bold text-ink">{count}</span>
        <span className="text-xs text-ink-soft">({pct}%)</span>
      </div>
    </div>
  );
}
