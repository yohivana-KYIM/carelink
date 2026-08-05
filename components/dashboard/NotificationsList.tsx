"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";
import { api, type Notification } from "@/lib/api";
import { useSession } from "@/lib/session";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function NotificationsList() {
  const { token } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    const res = await api.listNotifications(token, { page: 1 });
    setNotifications(res.notifications);
    setSelected(new Set());
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === notifications.length ? new Set() : new Set(notifications.map((n) => n.id))
    );
  }

  async function markAllRead() {
    if (!token) return;
    setBusy(true);
    await api.markAllNotificationsRead(token);
    await load();
    setBusy(false);
  }

  async function deleteSelected() {
    if (!token || selected.size === 0) return;
    setBusy(true);
    await api.bulkDeleteNotifications(token, Array.from(selected));
    await load();
    setBusy(false);
  }

  async function deleteAll() {
    if (!token) return;
    setBusy(true);
    await api.deleteAllNotifications(token);
    await load();
    setBusy(false);
  }

  async function markOneRead(id: string) {
    if (!token) return;
    await api.markNotificationRead(token, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={notifications.length > 0 && selected.size === notifications.length}
            onChange={toggleAll}
            className="size-4 rounded border-border text-brand-600 focus:ring-brand-400"
          />
          Tout sélectionner
        </label>

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={markAllRead}
            disabled={busy || notifications.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:hover:text-brand-300"
          >
            <CheckCheck size={14} />
            Tout marquer comme lu
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={busy || selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
          >
            <Trash2 size={14} />
            Supprimer la sélection ({selected.size})
          </button>
          <button
            type="button"
            onClick={deleteAll}
            disabled={busy || notifications.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <Trash2 size={14} />
            Tout supprimer
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center text-ink-soft">
          <Bell size={28} />
          <p className="text-sm">Aucune notification pour le moment.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {notifications.map((notification) => (
            <motion.li
              key={notification.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                notification.isRead
                  ? "border-border bg-surface-raised"
                  : "border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-500/10"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(notification.id)}
                onChange={() => toggle(notification.id)}
                className="mt-1 size-4 shrink-0 rounded border-border text-brand-600 focus:ring-brand-400"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{notification.title}</p>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{notification.body}</p>
                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={() => markOneRead(notification.id)}
                    className="mt-2 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Marquer comme lu
                  </button>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
