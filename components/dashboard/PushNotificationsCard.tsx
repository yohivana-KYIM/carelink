"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushStatus,
  type PushStatus,
} from "@/lib/push";

export function PushNotificationsCard({ token }: { token: string | null }) {
  const [status, setStatus] = useState<PushStatus | "loading">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPushStatus().then(setStatus);
  }, []);

  async function handleToggle() {
    if (!token) return;
    setBusy(true);
    try {
      if (status === "subscribed") {
        await disablePushNotifications(token);
        setStatus("not-subscribed");
        toast.success("Notifications push désactivées.");
      } else {
        const next = await enablePushNotifications(token);
        setStatus(next);
        if (next === "subscribed") toast.success("Notifications push activées.");
        else if (next === "denied") toast.error("Autorisation refusée dans le navigateur.");
      }
    } catch {
      toast.error("Impossible de mettre à jour les notifications push.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") return null;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          {status === "subscribed" ? <BellRing size={18} /> : <Bell size={18} />}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">Notifications push</h2>
          <p className="text-sm text-ink-muted">
            {status === "loading"
              ? "Vérification du statut..."
              : status === "subscribed"
                ? "Activées sur cet appareil — vous recevez les notifications même hors d'Ecotocare."
                : status === "denied"
                  ? "Bloquées par le navigateur. Autorisez-les dans les paramètres du site pour les recevoir."
                  : "Activez-les pour recevoir les notifications même quand Ecotocare n'est pas ouvert."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={busy || status === "loading" || status === "denied"}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand-300 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : status === "subscribed" ? (
          <BellOff size={16} />
        ) : (
          <Bell size={16} />
        )}
        {status === "subscribed" ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
