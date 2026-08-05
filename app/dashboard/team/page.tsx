"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type TeamMember } from "@/lib/api";
import { PendingGate } from "@/components/dashboard/PendingGate";

export default function TeamPage() {
  const { token, cabinet, user } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<{ fullName: string; email: string; password: string; role: "STANDARD" | "ADMIN" }>({ fullName: "", email: "", password: "", role: "STANDARD" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true);
    const res = await api.listTeam(token);
    setMembers(res.members);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (cabinet && cabinet.status !== "ACTIVE") {
    return <PendingGate cabinet={cabinet} />;
  }

  const isAdmin = user?.role === "ADMIN";

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError("");
    setSubmitting(true);
    try {
      await api.createTeamMember(token, form);
      toast.success("Membre de l'équipe ajouté");
      setForm({ fullName: "", email: "", password: "", role: "STANDARD" });
      setFormOpen(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossible de créer ce compte.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await api.deleteTeamMember(token, id);
      toast.success("Membre supprimé avec succès");
      await load();
    } catch (err) {
      toast.error("Erreur lors de la suppression du membre");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Équipe du cabinet</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gérez les comptes assistant(e)s et secrétaires ayant accès au cabinet.
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <UserPlus size={16} />
            Ajouter un membre
          </button>
        ) : null}
      </div>

      {formOpen ? (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="grid gap-4 rounded-2xl border border-border bg-surface-raised p-6 sm:grid-cols-4"
        >
          <input
            required
            placeholder="Nom complet"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe (8+ caractères)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "STANDARD" | "ADMIN" }))}
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          >
            <option value="STANDARD">Secrétaire / Assistant(e)</option>
            <option value="ADMIN">Docteur (Admin)</option>
          </select>
          <div className="sm:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              Créer le compte
            </button>
            {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
          </div>
        </motion.form>
      ) : null}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rôle</th>
                {isAdmin ? <th className="px-5 py-3" /> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{member.fullName}</td>
                  <td className="px-5 py-3.5 text-ink-muted">{member.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                      {member.role === "ADMIN" ? "Docteur" : "Secrétariat"}
                    </span>
                  </td>
                  {isAdmin ? (
                    <td className="px-5 py-3.5 text-right">
                      {member.role === "STANDARD" ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          aria-label="Supprimer"
                          className="text-ink-soft transition-colors hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
