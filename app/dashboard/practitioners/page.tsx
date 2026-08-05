"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Loader2, Plus, Stethoscope, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Practitioner } from "@/lib/api";

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-muted hover:bg-surface"><X size={20}/></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function PractitionersPage() {
  const { token, user } = useSession();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ fullName: "" });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.listPractitioners(token);
      setPractitioners(res.practitioners);
    } catch (e) {
      toast.error("Erreur de chargement des praticiens");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [token]);

  function openCreateModal() {
    setForm({ fullName: "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.createPractitioner(token, form);
      toast.success("Praticien ajouté avec succès");
      setModalOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Supprimer ce praticien ? Attention, cela pourrait affecter ses rendez-vous.")) return;
    try {
      await api.deletePractitioner(token, id);
      toast.success("Praticien supprimé");
      await load();
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  }

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Praticiens</h1>
          <p className="mt-1 text-sm text-ink-muted">Gérez la liste des médecins / dentistes du cabinet pour l'attribution des rendez-vous.</p>
        </div>
        {isAdmin && (
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus size={16} /> Ajouter un praticien
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft"><Loader2 className="animate-spin" size={20} /></div>
      ) : practitioners.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-ink-soft">
          <Stethoscope size={28} />
          <p className="text-sm">Aucun praticien n'a été ajouté à ce cabinet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {practitioners.map(p => (
            <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-5 relative group">
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="absolute top-4 right-4 text-ink-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="font-semibold text-ink">{p.fullName}</p>
                <p className="text-xs text-ink-soft mt-1">Ajouté le {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau praticien">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink">Nom complet (ex: Dr. Dupont)</label>
            <input 
              required 
              value={form.fullName} 
              onChange={e => setForm({...form, fullName: e.target.value})} 
              placeholder="Dr. Jean Dupont"
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" 
            />
          </div>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Créer le praticien"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
