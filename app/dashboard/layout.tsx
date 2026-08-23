"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, UsersRound, Bell, Calendar, UserSquare2, Settings, Stethoscope, Clock, FileText } from "lucide-react";
import { SessionProvider, useSession } from "@/lib/session";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/DashboardShell";

const baseNavItems: (DashboardNavItem & { adminOnly?: boolean })[] = [
  { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { label: "Rendez-vous", href: "/dashboard/appointments", icon: Calendar },
  { label: "Patients", href: "/dashboard/patients", icon: UserSquare2 },
  { label: "Praticiens", href: "/dashboard/practitioners", icon: Stethoscope },
  // Configuration des créneaux hebdomadaires et consultation des statistiques
  // relèvent de l'administration du cabinet (cahier des charges §2) — pas du secrétariat.
  { label: "Disponibilités", href: "/dashboard/availability", icon: Clock, adminOnly: true },
  { label: "Rapports", href: "/dashboard/reports", icon: FileText, adminOnly: true },
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

  const navItems = baseNavItems.filter((item) => !item.adminOnly || user?.role === "ADMIN");

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
