"use client";

import { NotificationsList } from "@/components/dashboard/NotificationsList";

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Nouvelles inscriptions de cabinets et événements de la plateforme.
        </p>
      </div>
      <NotificationsList />
    </div>
  );
}
