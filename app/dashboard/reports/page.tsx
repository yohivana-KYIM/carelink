"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, TrendingUp, RefreshCw, Calendar, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Report } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Journalier",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};

export default function ReportsPage() {
  const { token, user } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState("");
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.listReports(token, { period: filter || undefined, pageSize: 30 });
      setReports(res.reports);
    } catch { toast.error("Erreur de chargement"); }
    setLoading(false);
  }

  useEffect(() => { void load(); }, [token, filter]);

  async function generate(period: "DAILY" | "WEEKLY" | "MONTHLY") {
    if (!token) return;
    setGenerating(true);
    try {
      await api.generateReport(token, period);
      toast.success(`Rapport ${PERIOD_LABELS[period].toLowerCase()} généré et envoyé par email`);
      await load();
    } catch { toast.error("Erreur de génération"); }
    setGenerating(false);
  }

  async function downloadPdf(id: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/reports/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur de téléchargement du PDF");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Rapports</h1>
          <p className="mt-1 text-sm text-ink-muted">Historique des rapports générés automatiquement.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            {(["DAILY", "WEEKLY", "MONTHLY"] as const).map(p => (
              <button key={p} onClick={() => generate(p)} disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-raised disabled:opacity-50">
                {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtre */}
      <div className="flex gap-2">
        {["", "DAILY", "WEEKLY", "MONTHLY"].map(v => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === v ? "bg-brand-600 text-white" : "border border-border text-ink-muted hover:bg-surface-raised"}`}>
            {v === "" ? "Tous" : PERIOD_LABELS[v]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-ink-soft" size={24} /></div>
      ) : reports.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-3 text-ink-soft">
          <FileText size={36} className="opacity-30" />
          <p className="text-sm">Aucun rapport disponible. Les rapports automatiques se génèrent chaque jour, semaine et mois.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map(r => {
            let data: Record<string, unknown> = {};
            try { data = JSON.parse(r.data); } catch { /* ignore */ }
            const appts = data.appointments as { total?: number; confirmed?: number; noShows?: number; cancelled?: number } | undefined;
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-surface-raised p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                      <FileText size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Rapport {PERIOD_LABELS[r.period]} — {new Date(r.periodStart).toLocaleDateString("fr-FR")} au {new Date(r.periodEnd).toLocaleDateString("fr-FR")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={12} className="text-ink-soft" />
                        <p className="text-xs text-ink-muted">Généré le {new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                        {r.sentAt && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Envoyé</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadPdf(r.id)}
                    title="Télécharger en PDF"
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface hover:text-ink transition-colors"
                  >
                    <Download size={13} /> PDF
                  </button>
                </div>

                {appts && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "RDV total", value: appts.total ?? 0, color: "brand" },
                      { label: "Confirmés", value: appts.confirmed ?? 0, color: "emerald" },
                      { label: "Absents", value: appts.noShows ?? 0, color: "amber" },
                      { label: "Taux confirm.", value: `${(data.confirmationRate as number | undefined) ?? 0}%`, color: "violet" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-xl bg-${color}-50 dark:bg-${color}-500/10 p-3`}>
                        <p className={`text-xs text-${color}-600 dark:text-${color}-400`}>{label}</p>
                        <p className={`text-xl font-bold text-${color}-700 dark:text-${color}-300`}>{String(value)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {Boolean(data.topCareTypes) && Array.isArray(data.topCareTypes) && (data.topCareTypes as unknown[]).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-ink-muted mb-2 flex items-center gap-1"><TrendingUp size={12} /> Types de soins populaires</p>
                    <div className="flex flex-wrap gap-2">
                    {(data.topCareTypes as { type: string; count: number }[]).map(t => (
                        <span key={t.type} className="rounded-full border border-border px-2.5 py-1 text-xs text-ink">
                          {String(t.type)} ({String(t.count)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
