"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, UsersRound, Bell, Calendar, UserSquare2, Settings, Stethoscope } from "lucide-react";
import { SessionProvider, useSession } from "@/lib/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const navItems: DashboardNavItem[] = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { label: "Rendez-vous", href: "/dashboard/appointments", icon: Calendar },
  { label: "Patients", href: "/dashboard/patients", icon: UserSquare2 },
  { label: "Praticiens", href: "/dashboard/practitioners", icon: Stethoscope },
  { label: "Équipe", href: "/dashboard/team", icon: UsersRound },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, user } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user?.role === "SUPERADMIN") {
      router.replace("/admin");
    }
  }, [status, user, router]);

  if (status === "loading" || status === "unauthenticated" || user?.role === "SUPERADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-ink-soft">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <DashboardShell navItems={navItems} roleLabel={user?.role === "ADMIN" ? "Docteur" : "Secrétariat"}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </SessionProvider>
  );
}
