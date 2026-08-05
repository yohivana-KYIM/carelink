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

      <div className="rounded-2xl border border-border bg-surface-raised p-6 text-sm text-ink-muted">
        La gestion des rendez-vous et des patients arrive bientôt dans ce tableau de bord. L&apos;API
        est déjà disponible (
        <code className="rounded bg-surface px-1.5 py-0.5 text-xs">/api/patients</code>,{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-xs">/api/appointments</code>).
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
