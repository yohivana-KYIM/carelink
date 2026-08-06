import { api } from "./api";

export type PushStatus = "unsupported" | "denied" | "not-subscribed" | "subscribed";

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getRegistration() {
  return navigator.serviceWorker.register("/sw.js");
}

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";

  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    return subscription ? "subscribed" : "not-subscribed";
  } catch {
    return "not-subscribed";
  }
}

/**
 * Active les notifications push : enregistre le service worker, demande la
 * permission si nécessaire, s'abonne et envoie l'abonnement au backend.
 * Appelée automatiquement à la connexion (activée par défaut) et disponible
 * manuellement depuis les paramètres.
 */
export async function enablePushNotifications(token: string): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";
  }
  if (Notification.permission === "denied") return "denied";

  const { publicKey } = await api.getVapidPublicKey();
  if (!publicKey) return "not-subscribed";

  const registration = await getRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return "not-subscribed";
  }

  await api.subscribePush(token, {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });

  return "subscribed";
}

export async function disablePushNotifications(token: string) {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await api.unsubscribePush(token, endpoint).catch(() => {});
}
