"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Users, UserMinus } from "lucide-react";
import { useSession } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Subscriber = {
  id: string;
  email: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
};

type Stats = { total: number; active: number; unsubscribed: number };

export default function AdminNewsletterPage() {
  const { token } = useSession();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
      });
      const [subRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/newsletter/subscribers?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/newsletter/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const subData = await subRes.json();
      const statsData = await statsRes.json();
      setSubscribers(subData.subscribers ?? []);
      setTotal(subData.total ?? 0);
      setStats(statsData.stats ?? null);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token, page, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Newsletter</h1>
        <p className="mt-1 text-sm text-ink-muted">Gérez les abonnés à la newsletter Ecotocare.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total inscrits", value: stats.total, icon: Mail },
            { label: "Actifs", value: stats.active, icon: Users },
            { label: "Désinscrits", value: stats.unsubscribed, icon: UserMinus },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface-raised p-5 flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                <Icon size={16} />
              </span>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="search"
        placeholder="Rechercher un email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-full border border-border bg-surface-raised px-4 py-2 text-sm focus:border-brand-400 focus:outline-none"
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase text-ink-soft">
            <tr>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Inscrit le</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center">
                  <Loader2 className="animate-spin mx-auto text-ink-soft" size={20} />
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ink-soft">Aucun abonné.</td>
              </tr>
            ) : subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3 font-medium text-ink">{s.email}</td>
                <td className="px-5 py-3 text-ink-muted">
                  {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.unsubscribedAt ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {s.unsubscribedAt ? "Désinscrit" : "Actif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <p>{total} abonnés · page {page}/{totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Précédent</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
