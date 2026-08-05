"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Plus, Search, Edit, X, Download, Upload, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Patient } from "@/lib/api";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

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

export default function PatientsPage() {
  const { token, user } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({ fullName: "", phoneNumber: "", whatsappOptIn: false, relanceMonths: 6 });

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.listPatients(token, search);
      setPatients(res.patients);
      setPage(1);
    } catch (e) {
      toast.error("Erreur de chargement des patients");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [token, search]);

  const totalPages = Math.ceil(patients.length / pageSize);
  const paginatedPatients = patients.slice((page - 1) * pageSize, page * pageSize);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExportCSV() {
    const headers = ["Nom", "Telephone", "WhatsApp", "Relance(mois)"];
    const rows = patients.map(p => [
      `"${p.fullName}"`,
      `"${p.phoneNumber}"`,
      p.whatsappOptIn ? "Oui" : "Non",
      p.relanceMonths || ""
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "patients_carelink.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      
      const lines = text.split("\n").filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("Le fichier est vide ou mal formaté.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      const rows = lines.slice(1);
      const parsedPatients = [];
      
      for (const row of rows) {
        const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2 && cols[0] && cols[1]) {
          parsedPatients.push({
            fullName: cols[0],
            phoneNumber: cols[1],
            whatsappOptIn: cols[2]?.toLowerCase() === "oui",
            relanceMonths: parseInt(cols[3]) || 6
          });
        }
      }
      
      if (parsedPatients.length === 0) {
        toast.error("Aucun patient valide trouvé dans le fichier.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      try {
        setLoading(true);
        const res = await api.bulkCreatePatients(token, parsedPatients);
        toast.success(`${res.count} patients importés avec succès !`);
        await load();
      } catch (err) {
        toast.error("Erreur lors de l'importation.");
        setLoading(false);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function copyBookingLink() {
    if (!user?.cabinetId) return;
    const url = `${window.location.origin}/book/${user.cabinetId}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien de réservation copié dans le presse-papiers !");
  }

  function openCreateModal() {
    setEditingPatient(null);
    setForm({ fullName: "", phoneNumber: "", whatsappOptIn: false, relanceMonths: 6 });
    setModalOpen(true);
  }

  function openEditModal(patient: Patient) {
    setEditingPatient(patient);
    setForm({ 
      fullName: patient.fullName, 
      phoneNumber: patient.phoneNumber, 
      whatsappOptIn: patient.whatsappOptIn, 
      relanceMonths: patient.relanceMonths ?? 6 
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (editingPatient) {
        await api.updatePatient(token, editingPatient.id, form);
        toast.success("Patient mis à jour avec succès");
      } else {
        await api.createPatient(token, form);
        toast.success("Patient ajouté avec succès");
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">Gérez votre base de patients et leurs préférences de relance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
            <Upload size={16} /> Importer
          </button>
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-raised">
            <Download size={16} /> Exporter
          </button>
          <button onClick={copyBookingLink} className="inline-flex items-center gap-2 rounded-full border border-border bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20">
            <Share2 size={16} /> Partager le lien
          </button>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Rechercher (nom ou téléphone)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface-raised py-2 pl-9 pr-4 text-sm text-ink focus:border-brand-400 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft"><Loader2 className="animate-spin" size={20} /></div>
      ) : patients.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-ink-soft">
          <p className="text-sm">Aucun patient trouvé.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">WhatsApp Opt-in</th>
                  <th className="px-5 py-3">Fréquence relance</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedPatients.map(p => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium text-ink">
                      <a href={`/dashboard/patients/${p.id}`} className="hover:text-brand-600 hover:underline">{p.fullName}</a>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{p.phoneNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.whatsappOptIn ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {p.whatsappOptIn ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{p.relanceMonths ? `${p.relanceMonths} mois` : "Non défini"}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEditModal(p)} className="text-ink-soft hover:text-brand-600"><Edit size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-ink-muted">
              <p>{patients.length} patients · page {page}/{totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Précédent</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPatient ? "Modifier le patient" : "Nouveau patient"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink">Nom complet</label>
            <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">Téléphone (WhatsApp)</label>
            <div className="phone-input-container">
              <PhoneInput
                defaultCountry="fr"
                value={form.phoneNumber}
                onChange={(phone) => setForm({ ...form, phoneNumber: phone })}
                required
                style={{ width: '100%' }}
                inputStyle={{ width: '100%', borderRadius: '9999px', borderTopLeftRadius: '0', borderBottomLeftRadius: '0', border: '1px solid var(--border)', background: 'var(--background)', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--ink)' }}
                countrySelectorStyleProps={{ buttonStyle: { borderTopLeftRadius: '9999px', borderBottomLeftRadius: '9999px', border: '1px solid var(--border)', background: 'var(--background)', padding: '0 0.5rem' } }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.whatsappOptIn} onChange={e => setForm({...form, whatsappOptIn: e.target.checked})} className="size-4 rounded border-border text-brand-600 focus:ring-brand-400" />
            <label className="text-sm text-ink-muted">Le patient accepte de recevoir des messages WhatsApp</label>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Fréquence de relance (mois)</label>
            <input type="number" min="1" max="24" required value={form.relanceMonths} onChange={e => setForm({...form, relanceMonths: parseInt(e.target.value) || 6})} className="mt-1 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-ink focus:border-brand-400 focus:outline-none" />
          </div>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : (editingPatient ? "Enregistrer" : "Créer")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
