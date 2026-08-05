"use client";

import { NotificationsList } from "@/components/dashboard/NotificationsList";

export default function DashboardNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Suivez les validations de compte et les mises à jour importantes.
        </p>
      </div>
      <NotificationsList />
    </div>
  );
}
