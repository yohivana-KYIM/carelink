import { AlertCircle, Ban, CheckCircle2, Clock3, PauseCircle, UserX } from "lucide-react";

// ─── Statuts : une seule source de vérité pour le badge, le point de couleur,
// la barre de répartition et la couleur des événements du calendrier — évite
// que les différentes vues (dashboard, rendez-vous, planning du jour,
// calendrier) se désynchronisent visuellement ou omettent un statut.
export const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string; bar: string; icon: typeof CheckCircle2; color: string }
> = {
  PENDING: {
    label: "En attente",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    icon: Clock3,
    color: "#0284c7",
  },
  CONFIRMED: {
    label: "Confirmé",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
    color: "#059669",
  },
  RESCHEDULE_REQUESTED: {
    label: "Report demandé",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    icon: AlertCircle,
    color: "#d97706",
  },
  NO_RESPONSE: {
    label: "Sans réponse",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
    icon: PauseCircle,
    color: "#64748b",
  },
  CANCELLED: {
    label: "Annulé",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-400",
    bar: "bg-red-400",
    icon: Ban,
    color: "#94a3b8",
  },
  COMPLETED: {
    label: "Terminé",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
    icon: CheckCircle2,
    color: "#7c3aed",
  },
  NO_SHOW: {
    label: "Absent",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    dot: "bg-rose-600",
    bar: "bg-rose-600",
    icon: UserX,
    color: "#e11d48",
  },
};
export const FALLBACK_STATUS = STATUS_CONFIG.PENDING;

export function statusConfig(status: string) {
  return STATUS_CONFIG[status] ?? FALLBACK_STATUS;
}
