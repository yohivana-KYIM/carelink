"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Bell, MessageCircle, Star } from "lucide-react";
import { SessionProvider, useSession } from "@/lib/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const navItems: DashboardNavItem[] = [
  { label: "Cabinets", href: "/admin", icon: Building2 },
  { label: "Contacts", href: "/admin/contacts", icon: MessageCircle },
  { label: "Avis", href: "/admin/reviews", icon: Star },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user?.role !== "SUPERADMIN") {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  if (status === "loading" || status === "unauthenticated" || user?.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-ink-soft">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <DashboardShell navItems={navItems} roleLabel="Super administrateur">
      {children}
    </DashboardShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminGuard>{children}</AdminGuard>
    </SessionProvider>
  );
}
