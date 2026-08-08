"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Calendar, MessageCircle, User as UserIcon, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Patient } from "@/lib/api";

export default function PatientProfilePage() {
  const { token } = useSession();
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [relancing, setRelancing] = useState(false);
  const [togglingRelance, setTogglingRelance] = useState(false);

  useEffect(() => {
    if (!token || !params.id) return;

    api.getPatient(token, params.id as string)
      .then(res => setPatient(res.patient))
      .catch(() => toast.error("Impossible de charger le patient"))
      .finally(() => setLoading(false));
  }, [token, params.id]);

  async function handleRelanceNow() {
    if (!token || !patient) return;
    setRelancing(true);
    try {
      await api.relancePatientNow(token, patient.id);
      toast.success(`Relance envoyée à ${patient.fullName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi de la relance");
    } finally {
      setRelancing(false);
    }
  }

  async function handleToggleRelanceEnabled() {
    if (!token || !patient) return;
    const next = !patient.relanceEnabled;
    setTogglingRelance(true);
    try {
      const res = await api.updatePatient(token, patient.id, { relanceEnabled: next });
      setPatient(res.patient);
      toast.success(next ? "Relance automatique réactivée" : "Relance automatique désactivée pour ce patient");
    } catch {
      toast.error("Échec de la mise à jour");
    } finally {
      setTogglingRelance(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-ink-soft">
        <p>Patient introuvable</p>
        <button onClick={() => router.push("/dashboard/patients")} className="text-brand-600 hover:underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/dashboard/patients")} className="flex size-10 items-center justify-center rounded-full bg-surface-raised text-ink-soft hover:text-ink transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{patient.fullName}</h1>
          <p className="text-sm text-ink-muted">{patient.phoneNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Infos */}
        <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-ink">Informations</h2>
              <p className="text-xs text-ink-soft">Ajouté le {new Date(patient.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">WhatsApp</span>
            <span className={`font-semibold ${patient.whatsappOptIn ? "text-emerald-600" : "text-red-600"}`}>
              {patient.whatsappOptIn ? "Accepté" : "Refusé"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Fréquence de relance</span>
            <span className="font-semibold text-ink">{patient.relanceMonths ? `${patient.relanceMonths} mois` : "Non défini"}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-ink-muted">Relance automatique</span>
            <button
              onClick={handleToggleRelanceEnabled}
              disabled={togglingRelance}
              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                patient.relanceEnabled ? "bg-brand-600" : "bg-surface-raised border border-border"
              }`}
              aria-pressed={patient.relanceEnabled}
              aria-label="Activer ou désactiver la relance automatique"
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  patient.relanceEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleRelanceNow}
            disabled={relancing || !patient.whatsappOptIn}
            title={!patient.whatsappOptIn ? "Ce patient n'a pas donné son consentement WhatsApp" : undefined}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {relancing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Relancer maintenant
          </button>
        </div>

        {/* Historique RDV */}
        <div className="rounded-2xl border border-border bg-surface-raised p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
            <Calendar size={18} className="text-brand-500" /> Historique des rendez-vous
          </h2>
          {patient.appointments && patient.appointments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {patient.appointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-medium text-ink">{new Date(apt.scheduledAt).toLocaleString("fr-FR")}</p>
                    <p className="text-xs text-ink-soft">{apt.careType || "Consultation standard"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Aucun rendez-vous enregistré.</p>
          )}
        </div>

        {/* Historique Messages */}
        <div className="rounded-2xl border border-border bg-surface-raised p-6 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
            <MessageCircle size={18} className="text-brand-500" /> Historique des messages WhatsApp
          </h2>
          {patient.messageLogs && patient.messageLogs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {patient.messageLogs.map(msg => (
                <div key={msg.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 bg-surface">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-muted">{msg.type}</span>
                    <span className="text-xs text-ink-soft">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap">{msg.content}</p>
                  <span className={`self-end text-xs font-medium ${msg.direction === 'INBOUND' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {msg.direction === 'INBOUND' ? 'Reçu du patient' : 'Envoyé au patient'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Aucun message envoyé pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
