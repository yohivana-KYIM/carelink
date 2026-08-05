"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CalendarClock, Loader2, TrendingUp, Users } from "lucide-react";
import { useSession } from "@/lib/session";
import { api, type DashboardSummary } from "@/lib/api";
import { PendingGate } from "@/components/dashboard/PendingGate";

export default function DashboardOverviewPage() {
  const { token, cabinet, user } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || cabinet?.status !== "ACTIVE") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no fetch needed, resolve loading state synchronously
      setLoading(false);
      return;
    }
    api
      .dashboardSummary(token)
      .then((res) => setSummary(res.summary))
      .finally(() => setLoading(false));
  }, [token, cabinet?.status]);

  if (cabinet && cabinet.status !== "ACTIVE") {
    return <PendingGate cabinet={cabinet} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Bonjour {user?.fullName?.split(" ")[0] ?? ""} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Voici un aperçu de l&apos;activité de {cabinet?.name ?? "votre cabinet"}.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarClock}
            label="Rendez-vous aujourd'hui"
            value={summary?.todayCount ?? 0}
          />
          <StatCard icon={CalendarCheck} label="Rendez-vous cette semaine" value={summary?.weekCount ?? 0} />
          <StatCard
            icon={TrendingUp}
            label="Taux de confirmation"
            value={
              summary?.confirmationRate != null
                ? `${Math.round(summary.confirmationRate * 100)}%`
                : "—"
            }
          />
          <StatCard
            icon={Users}
            label="RDV récupérés (relances)"
            value={summary?.recoveredByRelance ?? 0}
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface-raised p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/dashboard/appointments" className="flex items-center justify-center gap-2 rounded-xl bg-brand-50 p-4 font-medium text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20">
              <CalendarCheck size={18} /> Gérer les RDV
            </a>
            <a href="/dashboard/patients" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-4 font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20">
              <Users size={18} /> Liste Patients
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface-raised p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Statut Automatisations</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3 text-sm font-medium text-ink">
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <CalendarClock size={16} />
                </span>
                Rappels de rendez-vous (J-2, J-1)
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Actif</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3 text-sm font-medium text-ink">
                <span className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <TrendingUp size={16} />
                </span>
                Relances patients inactifs
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Actif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
