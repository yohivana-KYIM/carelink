"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck, CalendarClock, Loader2, TrendingUp, Users,
  AlertTriangle, RefreshCw, BarChart2, FileText, ListFilter,
} from "lucide-react";
import { useSession } from "@/lib/session";
import { api, type DashboardSummary, type DashboardPeriod, type Practitioner } from "@/lib/api";
import { PendingGate } from "@/components/dashboard/PendingGate";
import { statusConfig } from "@/lib/appointment-status";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i);

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois-ci" },
  { value: "year", label: "Cette année" },
  { value: "all", label: "Tout" },
  { value: "custom", label: "Période personnalisée" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardOverviewPage() {
  const { token, cabinet, user } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<DashboardPeriod>("all");
  const [year, setYear] = useState(currentYear);
  const [dateFrom, setDateFrom] = useState(todayStr());
  const [dateTo, setDateTo] = useState(todayStr());
  const [practitionerId, setPractitionerId] = useState("");

  useEffect(() => {
    if (!token) return;
    api.listPractitioners(token).then((r) => setPractitioners(r.practitioners)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || cabinet?.status !== "ACTIVE") { setLoading(false); return; }
    setLoading(true);
    api
      .dashboardSummary(token, {
        period,
        year: period === "year" ? year : undefined,
        dateFrom: period === "custom" ? dateFrom : undefined,
        dateTo: period === "custom" ? dateTo : undefined,
        practitionerId: practitionerId || undefined,
      })
      .then((r) => setSummary(r.summary))
      .finally(() => setLoading(false));
  }, [token, cabinet?.status, period, year, dateFrom, dateTo, practitionerId]);

  if (cabinet && cabinet.status !== "ACTIVE") return <PendingGate cabinet={cabinet} />;

  const fixedStats = [
    { icon: CalendarClock, label: "Aujourd'hui", value: summary?.todayCount ?? 0, href: "/dashboard/planning", colorIcon: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400", colorGlow: "from-brand-50/60 dark:from-brand-500/10" },
    { icon: CalendarCheck, label: "Cette semaine", value: summary?.weekCount ?? 0, href: "/dashboard/appointments?range=week", colorIcon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", colorGlow: "from-emerald-50/60 dark:from-emerald-500/10" },
  ];

  const periodStats = [
    { icon: ListFilter, label: summary?.periodLabel ?? "Période", value: summary?.periodCount ?? 0, href: "/dashboard/appointments", colorIcon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", colorGlow: "from-indigo-50/60 dark:from-indigo-500/10" },
    {
      icon: TrendingUp,
      label: "Taux de confirmation",
      value: summary?.confirmationRate != null ? `${Math.round(summary.confirmationRate * 100)}%` : "—",
      href: "/dashboard/appointments?status=CONFIRMED",
      colorIcon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
      colorGlow: "from-violet-50/60 dark:from-violet-500/10",
    },
    { icon: Users, label: "Récupérés (relances)", value: summary?.recoveredByRelance ?? 0, href: "/dashboard/relances", colorIcon: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400", colorGlow: "from-sky-50/60 dark:from-sky-500/10" },
    { icon: AlertTriangle, label: "No-shows", value: summary?.noShowCount ?? 0, href: "/dashboard/appointments?status=NO_SHOW", colorIcon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", colorGlow: "from-amber-50/60 dark:from-amber-500/10" },
    { icon: RefreshCw, label: "À reprogrammer", value: summary?.rescheduleCount ?? 0, href: "/dashboard/appointments?status=RESCHEDULE_REQUESTED", colorIcon: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400", colorGlow: "from-orange-50/60 dark:from-orange-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Bonjour {user?.fullName?.split(" ")[0] ?? ""} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Aperçu de l&apos;activité de {cabinet?.name ?? "votre cabinet"}.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {practitioners.length > 0 ? (
              <select
                value={practitionerId}
                onChange={(e) => setPractitionerId(e.target.value)}
                className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink focus:outline-none"
              >
                <option value="">Tous les praticiens</option>
                {practitioners.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            ) : null}

            {period === "year" ? (
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-full border border-border bg-surface-raised px-4 py-2 text-sm text-ink focus:outline-none"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            ) : null}

            {period === "custom" ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo}
                  className="rounded-full border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:outline-none"
                />
                <span className="text-xs text-ink-soft">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  className="rounded-full border border-border bg-surface-raised px-3 py-2 text-sm text-ink focus:outline-none"
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  period === p.value
                    ? "bg-brand-600 text-white"
                    : "border border-border text-ink-muted hover:border-brand-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-ink-soft" size={22} /></div>
      ) : (
        <>
          {/* Repères fixes, toujours "à l'instant" quelle que soit la période choisie */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fixedStats.map(({ icon: Icon, label, value, href, colorIcon, colorGlow }) => (
              <StatCard key={label} icon={Icon} label={label} value={value} href={href} colorIcon={colorIcon} colorGlow={colorGlow} />
            ))}
          </div>

          {/* Statistiques scopées à la période sélectionnée */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Statistiques pour : {summary?.periodLabel}
              {practitionerId ? ` · ${practitioners.find((p) => p.id === practitionerId)?.fullName ?? ""}` : ""}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {periodStats.map(({ icon: Icon, label, value, href, colorIcon, colorGlow }) => (
                <StatCard key={label} icon={Icon} label={label} value={value} href={href} colorIcon={colorIcon} colorGlow={colorGlow} />
              ))}
            </div>
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
                <div>
                  <h2 className="text-base font-semibold text-ink">Répartition par statut</h2>
                  <p className="text-xs text-ink-soft">{summary.periodLabel}</p>
                </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  colorIcon,
  colorGlow,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  href?: string;
  colorIcon: string;
  colorGlow: string;
}) {
  const className = "group relative overflow-hidden flex flex-col gap-2 rounded-2xl border border-border bg-surface-raised p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border";
  const content = (
    <>
      <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${colorGlow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <span className={`relative flex size-9 items-center justify-center rounded-xl ${colorIcon} transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={16} />
      </span>
      <p className="relative text-xl font-bold text-ink">{value}</p>
      <p className="relative text-xs text-ink-soft leading-tight">{label}</p>
    </>
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return <div className={className}>{content}</div>;
}

function StatusBar({ status, count, total }: { status: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const cfg = statusConfig(status);
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs font-medium text-ink-muted">{cfg.label}</span>
      <div className="flex-1 rounded-full bg-surface h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
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
