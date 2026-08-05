"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api } from "@/lib/api";

const sortOptions = [
  { label: "Plus récent", value: "newest" },
  { label: "Plus ancien", value: "oldest" },
] as const;

export default function AdminContactsPage() {
  const { token } = useSession();
  const [messages, setMessages] = useState<Array<{ id: string; fullName: string; email: string; clinic?: string | null; phone?: string | null; subject?: string | null; message: string; createdAt: string }>>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const result = await api.listContactMessages(token, {
        page,
        pageSize: 20,
        search: search || undefined,
        sort,
      });
      setMessages(result.messages);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      toast.error("Impossible de charger les messages de contact.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, sort]);

  async function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    await load();
  }

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Messages de contact</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Consultez les messages envoyés depuis le formulaire de contact et gérez les demandes entrants.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 rounded-3xl border border-border bg-surface-raised p-4">
          <Search size={16} className="text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, cabinet ou sujet"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Rechercher
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface-raised p-4">
          <label className="text-sm font-medium text-ink">Trier par</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as "newest" | "oldest");
              setPage(1);
            }}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center text-ink-soft">
          <p className="text-sm">Aucun message trouvé.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface-raised">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Cabinet</th>
                <th className="px-5 py-4">Sujet</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {messages.map((message) => (
                <motion.tr key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{message.fullName}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-muted">{message.email}</td>
                  <td className="px-5 py-4 text-ink-muted">{message.clinic ?? "—"}</td>
                  <td className="px-5 py-4 text-ink-muted">{message.subject ?? "Sans sujet"}</td>
                  <td className="px-5 py-4 text-ink-muted max-w-[30rem] truncate">{message.message}</td>
                  <td className="px-5 py-4 text-ink-muted">{new Date(message.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface-raised p-4 text-sm text-ink-muted">
          <span>{total} message{total > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} />
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
