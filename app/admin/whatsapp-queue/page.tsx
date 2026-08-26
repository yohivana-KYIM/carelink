"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareWarning, RotateCw, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type WhatsappQueueItem, type WhatsappQueueStatus } from "@/lib/api";

const statusFilters: Array<{ label: string; value: WhatsappQueueStatus | "ALL" }> = [
  { label: "Tous", value: "ALL" },
  { label: "En attente", value: "PENDING" },
  { label: "Envoyés", value: "SENT" },
  { label: "Échecs", value: "FAILED" },
];

export default function AdminWhatsappQueuePage() {
  const { token } = useSession();
  const [items, setItems] = useState<WhatsappQueueItem[]>([]);
  const [status, setStatus] = useState<WhatsappQueueStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.adminListWhatsappQueue(token, {
        page,
        status: status === "ALL" ? undefined : status,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error("Erreur de chargement de la file d'envoi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, page]);

  async function retry(id: string) {
    if (!token) return;
    setRetryingId(id);
    try {
      await api.adminRetryWhatsappQueueItem(token, id);
      toast.success("Message remis en file d'attente");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la relance");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">File d&apos;envoi WhatsApp</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Messages Evolution API en attente d&apos;envoi humanisé, envoyés, ou en échec après plusieurs tentatives.
          Sans effet tant que le provider actif n&apos;est pas <code>evolution</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === filter.value
                ? "bg-brand-600 text-white"
                : "border border-border text-ink-muted hover:border-brand-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center text-ink-soft">
          <MessageSquareWarning size={28} />
          <p className="text-sm">Aucun message dans cette file.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-raised">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Cabinet</th>
                <th className="px-5 py-3">Destinataire</th>
                <th className="px-5 py-3">Message</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Créé le</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface">
                  <td className="px-5 py-3.5 text-ink">{item.cabinet.name}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{item.toNumber}</td>
                  <td className="max-w-xs px-5 py-3.5 text-ink-muted">
                    <span className="line-clamp-2">{item.text}</span>
                    {item.status === "FAILED" && item.lastError && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        {item.lastError} ({item.attempts} tentative{item.attempts > 1 ? "s" : ""})
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <QueueStatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.status === "FAILED" && (
                      <button
                        type="button"
                        onClick={() => retry(item.id)}
                        disabled={retryingId === item.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand-300 disabled:opacity-50"
                      >
                        {retryingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <RotateCw size={13} />}
                        Relancer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <p>
            {total} message{total > 1 ? "s" : ""} · page {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QueueStatusBadge({ status }: { status: WhatsappQueueStatus }) {
  if (status === "SENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 size={12} /> Envoyé
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
        <AlertTriangle size={12} /> Échec
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock3 size={12} /> En attente
    </span>
  );
}
