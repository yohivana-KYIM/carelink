"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareHeart, Sparkles, CheckCircle2, Clock3, CalendarCheck2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Relance, type RelanceStatus } from "@/lib/api";

export default function RelancesPage() {
  const { token } = useSession();
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .listRelances(token)
      .then((res) => setRelances(res.relances))
      .catch(() => toast.error("Erreur de chargement des relances"))
      .finally(() => setLoading(false));
  }, [token]);

  const rebookedCount = relances.filter((r) => r.status === "REBOOKED").length;
  const repliedOnlyCount = relances.filter((r) => r.status === "REPLIED").length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Relances</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Historique des relances envoyées aux patients inactifs, avec statut de réponse.
        </p>
      </div>

      {!loading && relances.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface-raised p-4">
            <p className="text-2xl font-semibold text-ink">{relances.length}</p>
            <p className="text-sm text-ink-soft">Relances envoyées</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised p-4">
            <p className="text-2xl font-semibold text-ink">{repliedOnlyCount}</p>
            <p className="text-sm text-ink-soft">Ont répondu</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised p-4">
            <p className="text-2xl font-semibold text-ink">{rebookedCount}</p>
            <p className="text-sm text-ink-soft">RDV repris</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-raised p-4">
            <p className="text-2xl font-semibold text-ink">
              {relances.length > 0 ? Math.round(((rebookedCount + repliedOnlyCount) / relances.length) * 100) : 0}%
            </p>
            <p className="text-sm text-ink-soft">Taux de réponse</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : relances.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center text-ink-soft">
          <MessageSquareHeart size={28} />
          <p className="text-sm">Aucune relance envoyée pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-raised">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Envoyée le</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {relances.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{r.patient.fullName}</p>
                    <p className="text-xs text-ink-soft">{r.patient.phoneNumber}</p>
                  </td>
                  <td className="max-w-xs px-5 py-3.5 text-ink-muted">
                    <div className="flex items-start gap-1.5">
                      {r.aiGenerated && (
                        <span title="Message généré par IA">
                          <Sparkles size={13} className="mt-0.5 shrink-0 text-brand-500" />
                        </span>
                      )}
                      <span className="line-clamp-2">{r.content}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <RelanceStatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RelanceStatusBadge({ status }: { status: RelanceStatus }) {
  if (status === "REBOOKED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CalendarCheck2 size={12} /> RDV repris
      </span>
    );
  }
  if (status === "REPLIED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
        <CheckCircle2 size={12} /> A répondu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock3 size={12} /> Envoyée
    </span>
  );
}
