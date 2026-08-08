"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2, Plus, Search, Edit, Download, Upload, Share2,
  Users, AlertTriangle, MessageCircle, UserPlus, Trash2, SlidersHorizontal, X, Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Patient, type PatientStats } from "@/lib/api";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-ink-muted hover:bg-surface"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function PatientsPage() {
  const { token, user } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filtres
  const [search, setSearch] = useState("");
  const [noShowOnly, setNoShowOnly] = useState(false);
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  const [sortBy, setSortBy] = useState("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [relancingId, setRelancingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", email: "", whatsappOptIn: false, relanceMonths: 6 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.listPatients(token, { search, noShowOnly, whatsappOptIn: whatsappOnly || undefined, page, pageSize, sortBy, sortDir }),
        api.getPatientStats(token),
      ]);
      setPatients(pRes.patients);
      setTotal(pRes.total);
      setStats(sRes.stats);
    } catch { toast.error("Erreur de chargement"); }
    setLoading(false);
  }

  useEffect(() => { void load(); }, [token, search, noShowOnly, whatsappOnly, page, sortBy, sortDir]);

  // Export CSV
  function handleExportCSV() {
    const headers = ["Nom", "Telephone", "Email", "WhatsApp", "Relance(mois)", "No-shows"];
    const rows = patients.map(p => [
      `"${p.fullName}"`, `"${p.phoneNumber}"`, `"${p.email ?? ""}"`,
      p.whatsappOptIn ? "Oui" : "Non", p.relanceMonths ?? "", p.noShowCount ?? 0,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "patients_ecotocare.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length <= 1) { toast.error("Fichier vide."); return; }
      const parsed = lines.slice(1).map(row => {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          return { fullName: cols[0], phoneNumber: cols[1], email: cols[2] || undefined, whatsappOptIn: cols[3]?.toLowerCase() === "oui", relanceMonths: parseInt(cols[4]) || 6 };
        }
        return null;
      }).filter(Boolean) as Partial<Patient>[];
      if (!parsed.length) { toast.error("Aucun patient valide."); return; }
      try {
        setLoading(true);
        const res = await api.bulkCreatePatients(token, parsed);
        toast.success(`${res.count} patients importés`);
        await load();
      } catch { toast.error("Erreur d'importation"); setLoading(false); }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function copyBookingLink() {
    if (!user?.cabinetId) return;
    const url = `${window.location.origin}/book/${user.cabinetId}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié !");
  }

  function openCreate() {
    setEditingPatient(null);
    setForm({ fullName: "", phoneNumber: "", email: "", whatsappOptIn: false, relanceMonths: 6 });
    setModalOpen(true);
  }

  function openEdit(p: Patient) {
    setEditingPatient(p);
    setForm({ fullName: p.fullName, phoneNumber: p.phoneNumber, email: p.email ?? "", whatsappOptIn: p.whatsappOptIn, relanceMonths: p.relanceMonths ?? 6 });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (editingPatient) {
        await api.updatePatient(token, editingPatient.id, form);
        toast.success("Patient mis à jour");
      } else {
        await api.createPatient(token, form);
        toast.success("Patient ajouté");
      }
      setModalOpen(false);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Supprimer ce patient ? Ses rendez-vous et messages seront également supprimés.")) return;
    try {
      await api.deletePatient(token, id);
      toast.success("Patient supprimé");
      await load();
    } catch { toast.error("Erreur de suppression"); }
  }

  async function handleRelanceNow(p: Patient) {
    if (!token) return;
    setRelancingId(p.id);
    try {
      await api.relancePatientNow(token, p.id);
      toast.success(`Relance envoyée à ${p.fullName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi de la relance");
    } finally {
      setRelancingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">Gérez votre base de patients et leurs préférences.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
            <Upload size={15} /> Importer
          </button>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
            <Download size={15} /> Exporter
          </button>
          <button onClick={copyBookingLink}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Share2 size={15} /> Lien RDV
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users, label: "Total patients", value: stats.total, color: "brand" },
            { icon: MessageCircle, label: "Opt-in WhatsApp", value: stats.withWhatsapp, color: "emerald" },
            { icon: AlertTriangle, label: "Patients no-show", value: stats.noShows, color: "amber" },
            { icon: UserPlus, label: "Nouveaux ce mois", value: stats.newThisMonth, color: "violet" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface-raised p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={`text-${color}-600`} />
                <span className="text-xs text-ink-muted">{label}</span>
              </div>
              <p className="text-2xl font-bold text-ink">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Barre de recherche + filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input type="text" placeholder="Nom, téléphone, email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-full border border-border bg-surface-raised py-2 pl-9 pr-4 text-sm text-ink focus:border-brand-400 focus:outline-none" />
        </div>
        <button onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${showFilters ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-border text-ink-muted hover:bg-surface-raised"}`}>
          <SlidersHorizontal size={14} /> Filtres
          {(noShowOnly || whatsappOnly) && (
            <span className="flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
              {[noShowOnly, whatsappOnly].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Panneau filtres avancés */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-border bg-surface-raised p-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={noShowOnly} onChange={e => { setNoShowOnly(e.target.checked); setPage(1); }}
                className="size-4 rounded border-border text-brand-600" />
              Patients avec no-show uniquement
            </label>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={whatsappOnly} onChange={e => { setWhatsappOnly(e.target.checked); setPage(1); }}
                className="size-4 rounded border-border text-brand-600" />
              Opt-in WhatsApp uniquement
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-ink-muted">Trier par :</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-ink focus:outline-none">
                <option value="fullName">Nom</option>
                <option value="createdAt">Date d'ajout</option>
                <option value="noShowCount">No-shows</option>
                <option value="lastVisitAt">Dernière visite</option>
              </select>
              <select value={sortDir} onChange={e => setSortDir(e.target.value as "asc" | "desc")}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-ink focus:outline-none">
                <option value="asc">↑ Croissant</option>
                <option value="desc">↓ Décroissant</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[20vh] items-center justify-center"><Loader2 className="animate-spin text-ink-soft" size={22} /></div>
      ) : patients.length === 0 ? (
        <div className="flex min-h-[20vh] flex-col items-center justify-center gap-2 text-ink-soft">
          <Users size={32} className="opacity-30" />
          <p className="text-sm">Aucun patient trouvé.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface-raised">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="hidden sm:table-cell px-5 py-3">WhatsApp</th>
                  <th className="hidden md:table-cell px-5 py-3">No-shows</th>
                  <th className="hidden lg:table-cell px-5 py-3">Relance</th>
                  <th className="px-5 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-3">
                      <a href={`/dashboard/patients/${p.id}`} className="font-medium text-ink hover:text-brand-600 hover:underline">
                        {p.fullName}
                      </a>
                      {(p.noShowCount ?? 0) > 2 && (
                        <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">⚠</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{p.phoneNumber}</td>
                    <td className="hidden sm:table-cell px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.whatsappOptIn ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {p.whatsappOptIn ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-5 py-3 text-ink-muted">
                      {(p.noShowCount ?? 0) > 0
                        ? <span className="font-semibold text-amber-600">{p.noShowCount}</span>
                        : "—"}
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3 text-ink-muted">
                      {p.relanceMonths ? `${p.relanceMonths} mois` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRelanceNow(p)}
                          disabled={!p.whatsappOptIn || relancingId === p.id}
                          title={p.whatsappOptIn ? "Relancer maintenant" : "Le patient n'a pas donné son consentement WhatsApp"}
                          className="text-ink-soft hover:text-brand-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          {relancingId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        </button>
                        <button onClick={() => openEdit(p)} className="text-ink-soft hover:text-brand-600 transition-colors"><Edit size={15} /></button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(p.id)} className="text-ink-soft hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <p>{total} patients · page {page}/{totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Précédent</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal ajout/édition */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editingPatient ? "Modifier le patient" : "Nouveau patient"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink">Nom complet *</label>
            <input required value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Téléphone WhatsApp *</label>
            <div className="phone-input-container">
              <PhoneInput defaultCountry="fr" value={form.phoneNumber} onChange={phone => setForm(f => ({ ...f, phoneNumber: phone }))}
                style={{ width: "100%" }}
                inputStyle={{ width: "100%", borderRadius: "9999px", borderTopLeftRadius: "0", borderBottomLeftRadius: "0", border: "1px solid var(--border)", background: "var(--background)", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--ink)" }}
                countrySelectorStyleProps={{ buttonStyle: { borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", border: "1px solid var(--border)", background: "var(--background)", padding: "0 0.5rem" } }} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Email (optionnel)</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="patient@email.fr"
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
            <input type="checkbox" checked={form.whatsappOptIn} onChange={e => setForm(f => ({ ...f, whatsappOptIn: e.target.checked }))}
              className="size-4 rounded border-border text-brand-600 focus:ring-brand-400" />
            Accepte de recevoir des messages WhatsApp
          </label>
          <div>
            <label className="text-sm font-medium text-ink">Fréquence de relance (mois)</label>
            <input type="number" min="1" max="24" value={form.relanceMonths}
              onChange={e => setForm(f => ({ ...f, relanceMonths: parseInt(e.target.value) || 6 }))}
              className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? "Enregistrement..." : editingPatient ? "Enregistrer" : "Créer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
