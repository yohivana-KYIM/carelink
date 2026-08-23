"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Cabinet, type CabinetStatus, type PlatformStats } from "@/lib/api";

const statusFilters: Array<{ label: string; value: CabinetStatus | "ALL" }> = [
  { label: "Tous", value: "ALL" },
  { label: "En attente", value: "PENDING" },
  { label: "Actifs", value: "ACTIVE" },
  { label: "Refusés", value: "REJECTED" },
];

export default function AdminCabinetsPage() {
  const { token } = useSession();
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [status, setStatus] = useState<CabinetStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [whatsappCabinet, setWhatsappCabinet] = useState<Cabinet | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    const [cabinetsRes, statsRes] = await Promise.all([
      api.adminListCabinets(token, {
        page,
        status: status === "ALL" ? undefined : status,
        search: search || undefined,
      }),
      api.adminStats(token),
    ]);
    setCabinets(cabinetsRes.cabinets);
    setTotalPages(cabinetsRes.totalPages);
    setTotal(cabinetsRes.total);
    setStats(statsRes.stats);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/filter change
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, page]);

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    await load();
  }

  async function approve(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await api.adminApproveCabinet(token, id);
      toast.success("Cabinet approuvé avec succès");
      await load();
    } catch (err) {
      toast.error("Erreur lors de l'approbation du cabinet");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await api.adminRejectCabinet(token, id);
      toast.success("Cabinet refusé");
      await load();
    } catch (err) {
      toast.error("Erreur lors du refus du cabinet");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Tableau de bord Admin</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gérez les inscriptions et suivez l&apos;ensemble de l&apos;écosystème Ecotocare.
          </p>
        </div>
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Retour à l'accueil
        </a>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Building2} label="Cabinets" value={stats.totalCabinets} />
          <StatCard icon={Clock3} label="En attente" value={stats.pendingCabinets} tone="amber" />
          <StatCard icon={CheckCircle2} label="Actifs" value={stats.activeCabinets} tone="emerald" />
          <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
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

        <form onSubmit={handleSearchSubmit} className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cabinet..."
              className="rounded-full border border-border bg-surface-raised py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : cabinets.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center text-ink-soft">
          <Building2 size={28} />
          <p className="text-sm">Aucun cabinet ne correspond à ces filtres.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface-raised">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Cabinet</th>
                <th className="px-5 py-3">Administrateur</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Patients</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cabinets.map((cabinet) => (
                <motion.tr key={cabinet.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition-colors hover:bg-surface">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-ink">{cabinet.name}</p>
                    <p className="text-xs text-ink-soft">{cabinet.city ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {cabinet.users?.[0] ? (
                      <>
                        <p>{cabinet.users[0].fullName}</p>
                        <p className="text-xs text-ink-soft">{cabinet.users[0].email}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={cabinet.status} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">{cabinet._count?.patients ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setWhatsappCabinet(cabinet)}
                        aria-label="Connecter WhatsApp"
                        title="Connecter le numéro WhatsApp du cabinet"
                        className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                          cabinet.whatsappVerifiedAt
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-400"
                        }`}
                      >
                        <MessageCircle size={15} />
                      </button>
                      {cabinet.status !== "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() => approve(cabinet.id)}
                          disabled={busyId === cabinet.id}
                          aria-label="Valider"
                          title="Valider ce cabinet"
                          className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-500/15 dark:text-emerald-400"
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {cabinet.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => reject(cabinet.id)}
                          disabled={busyId === cabinet.id}
                          aria-label="Refuser"
                          title="Refuser ce cabinet"
                          className="flex size-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-500/15 dark:text-red-400"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <p>
            {total} cabinet{total > 1 ? "s" : ""} · page {page}/{totalPages}
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
      ) : null}

      <AnimatePresence>
        {whatsappCabinet ? (
          <WhatsappConnectModal
            token={token}
            cabinet={whatsappCabinet}
            whatsappProvider={stats?.whatsappProvider ?? "console"}
            onClose={() => setWhatsappCabinet(null)}
            onUpdated={(updated) => {
              setWhatsappCabinet(updated);
              setCabinets((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function WhatsappConnectModal({
  token,
  cabinet,
  whatsappProvider,
  onClose,
  onUpdated,
}: {
  token: string | null;
  cabinet: Cabinet;
  whatsappProvider: "console" | "twilio" | "evolution";
  onClose: () => void;
  onUpdated: (cabinet: Cabinet) => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState(cabinet.whatsappPhoneNumber ?? "");
  const [waLink, setWaLink] = useState<string | null>(
    cabinet.whatsappPhoneNumber ? `https://wa.me/${cabinet.whatsappPhoneNumber.replace(/\D/g, "")}` : null
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"number" | "code">(cabinet.whatsappPhoneNumber ? "code" : "number");
  const [savingNumber, setSavingNumber] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [codeSentAt, setCodeSentAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!waLink) return;
    let cancelled = false;
    QRCode.toDataURL(waLink, { margin: 1, width: 220 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [waLink]);

  async function saveNumber(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSavingNumber(true);
    try {
      const res = await api.adminSetCabinetWhatsapp(token, cabinet.id, phoneNumber);
      setWaLink(res.waLink);
      onUpdated(res.cabinet);
      setStep("code");
      toast.success("Numéro WhatsApp enregistré. Scannez le QR ou envoyez le code de vérification.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement du numéro");
    } finally {
      setSavingNumber(false);
    }
  }

  async function sendCode() {
    if (!token) return;
    setSendingCode(true);
    try {
      await api.adminSendWhatsappCode(token, cabinet.id);
      setCodeSentAt(new Date());
      toast.success("Code de vérification envoyé sur WhatsApp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du code");
    } finally {
      setSendingCode(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setConfirming(true);
    try {
      const res = await api.adminConfirmWhatsappCode(token, cabinet.id, code);
      onUpdated(res.cabinet);
      toast.success("Numéro WhatsApp vérifié avec succès");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code invalide ou expiré");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Connecter WhatsApp</h2>
            <p className="text-xs text-ink-soft">{cabinet.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface"
          >
            <X size={16} />
          </button>
        </div>

        {cabinet.whatsappVerifiedAt || cabinet.evolutionConnectedAt ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck size={16} /> Numéro vérifié
          </div>
        ) : null}

        {whatsappProvider === "evolution" ? (
          <EvolutionConnectSection token={token} cabinet={cabinet} onUpdated={onUpdated} />
        ) : (
          <>
            {step === "number" || !cabinet.whatsappVerifiedAt ? (
              <form onSubmit={saveNumber} className="mb-5 flex flex-col gap-2">
                <label className="text-xs font-medium text-ink-muted" htmlFor="wa-phone">
                  Numéro WhatsApp complet (format international)
                </label>
                <div className="flex gap-2">
                  <input
                    id="wa-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+33612345678"
                    required
                    className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                  <button
                    type="submit"
                    disabled={savingNumber}
                    className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    {savingNumber ? <Loader2 className="animate-spin" size={16} /> : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : null}

            {waLink ? (
              <div className="mb-5 flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL généré côté client, next/image inutile ici
                  <img src={qrDataUrl} alt="QR code de connexion WhatsApp" width={180} height={180} className="rounded-lg" />
                ) : (
                  <div className="flex size-[180px] items-center justify-center">
                    <Loader2 className="animate-spin text-ink-soft" size={20} />
                  </div>
                )}
                <p className="text-center text-xs text-ink-soft">
                  Scannez ce QR code depuis le téléphone du cabinet pour ouvrir la discussion WhatsApp, ou utilisez le code de vérification ci-dessous.
                </p>
              </div>
            ) : null}

            {waLink ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={sendingCode}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand-300 disabled:opacity-50"
                >
                  {sendingCode ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                  {codeSentAt ? "Renvoyer le code" : "Envoyer le code de vérification"}
                </button>

                <form onSubmit={confirmCode} className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code à 6 chiffres"
                    maxLength={6}
                    required
                    className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
                  />
                  <button
                    type="submit"
                    disabled={confirming || code.length !== 6}
                    className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    {confirming ? <Loader2 className="animate-spin" size={16} /> : "Confirmer"}
                  </button>
                </form>
              </div>
            ) : null}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function EvolutionConnectSection({
  token,
  cabinet,
  onUpdated,
}: {
  token: string | null;
  cabinet: Cabinet;
  onUpdated: (cabinet: Cabinet) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [checking, setChecking] = useState(false);
  const [state, setState] = useState<"open" | "connecting" | "close" | "unknown" | null>(
    cabinet.evolutionConnectedAt ? "open" : null
  );

  async function loadQrCode() {
    if (!token) return;
    setLoadingQr(true);
    try {
      const res = await api.adminGetEvolutionQrCode(token, cabinet.id);
      setQrDataUrl(res.qrCodeDataUrl);
      toast.success("QR code généré — scannez-le avec le téléphone du cabinet.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la génération du QR code");
    } finally {
      setLoadingQr(false);
    }
  }

  async function checkConnection() {
    if (!token) return;
    setChecking(true);
    try {
      const res = await api.adminCheckEvolutionConnection(token, cabinet.id);
      setState(res.state);
      onUpdated(res.cabinet);
      if (res.state === "open") {
        toast.success("Numéro connecté avec succès");
      } else {
        toast("QR pas encore scanné — réessayez après avoir scanné.", { icon: "⏳" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la vérification de la connexion");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        Connexion avancée non-officielle (Evolution API). Le numéro scanné n&apos;est pas couvert par
        l&apos;API Business officielle Meta et peut être bloqué par WhatsApp sans préavis.
      </div>

      {cabinet.evolutionConnectedAt ? (
        <p className="text-xs text-ink-soft">
          Connecté depuis le {new Date(cabinet.evolutionConnectedAt).toLocaleDateString("fr-FR")}.
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL généré côté client, next/image inutile ici
          <img src={qrDataUrl} alt="QR code Evolution API" width={220} height={220} className="rounded-lg" />
        ) : (
          <div className="flex size-[220px] items-center justify-center text-center text-xs text-ink-soft">
            {loadingQr ? <Loader2 className="animate-spin" size={20} /> : "Cliquez sur « Générer le QR »"}
          </div>
        )}
        <button
          type="button"
          onClick={loadQrCode}
          disabled={loadingQr}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-300 disabled:opacity-50"
        >
          {loadingQr ? <Loader2 className="animate-spin" size={16} /> : "Générer le QR"}
        </button>
      </div>

      <button
        type="button"
        onClick={checkConnection}
        disabled={checking}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {checking ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
        Vérifier la connexion
      </button>

      {state && state !== "open" ? (
        <p className="text-center text-xs text-ink-soft">
          Statut : {state === "connecting" ? "en attente du scan..." : state === "close" ? "déconnecté" : "inconnu"}
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: CabinetStatus }) {
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 size={12} /> Actif
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
        <XCircle size={12} /> Refusé
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock3 size={12} /> En attente
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  tone?: "brand" | "amber" | "emerald";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  }[tone];

  const glowClasses = {
    brand: "from-brand-50/60 dark:from-brand-500/10",
    amber: "from-amber-50/60 dark:from-amber-500/10",
    emerald: "from-emerald-50/60 dark:from-emerald-500/10",
  }[tone];

  return (
    <div className="group relative overflow-hidden flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${glowClasses} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <span className={`relative flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${toneClasses}`}>
        <Icon size={18} />
      </span>
      <div className="relative">
        <p className="text-2xl font-semibold text-ink">{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
