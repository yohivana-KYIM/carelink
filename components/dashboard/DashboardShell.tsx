"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";import { ConfirmDialog } from "@/components/ui/ConfirmDialog";import { useSession } from "@/lib/session";
import { api } from "@/lib/api";
import { siteConfig } from "@/lib/site-config";
import { toast } from "react-hot-toast";
import { enablePushNotifications } from "@/lib/push";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export function DashboardShell({
  navItems,
  roleLabel,
  children,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    // Notifications push activées par défaut : tentative d'abonnement
    // automatique à chaque connexion (silencieuse si déjà abonné, ne bloque
    // rien si l'utilisateur refuse la permission navigateur).
    if (!token) return;
    void enablePushNotifications(token).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    
    let prevCount = unreadCount;
    
    const checkNotifications = async () => {
      try {
        const res = await api.listNotifications(token, { unreadOnly: true, page: 1 });
        setUnreadCount(res.unreadCount);
        
        if (res.unreadCount > prevCount) {
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Nouvelle notification", {
              body: "Vous avez des notifications non lues sur Carelink.",
              icon: "/images/carelink-icon.png",
            });
          }
          toast("Vous avez une nouvelle notification.", { icon: "🔔" });
        }
        prevCount = res.unreadCount;
      } catch (err) {}
    };

    void checkNotifications();
    
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, pathname]);

  function startLogout() {
    setConfirmLogoutOpen(true);
  }

  async function handleLogout() {
    if (!token) {
      logout();
      router.push("/login");
      setConfirmLogoutOpen(false);
      return;
    }

    setLogoutLoading(true);
    try {
      await api.logout(token);
      logout();
      router.push("/login");
      toast.success("Vous êtes bien déconnecté.");
    } catch (error) {
      logout();
      router.push("/login");
      toast.success("Vous êtes bien déconnecté.");
    } finally {
      setLogoutLoading(false);
      setConfirmLogoutOpen(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface-raised lg:flex">
        <SidebarContent
          navItems={navItems}
          roleLabel={roleLabel}
          pathname={pathname}
          userFullName={user?.fullName}
        />
      </aside>

      {/* Sidebar mobile */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-surface-raised">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent
              navItems={navItems}
              roleLabel={roleLabel}
              pathname={pathname}
              userFullName={user?.fullName}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-raised px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted"
          >
            <Menu size={16} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={navItems.find((item) => item.label.toLowerCase().includes("notif"))?.href ?? "#"}
              className="relative flex size-9 items-center justify-center rounded-full border border-border text-ink-muted hover:text-brand-600 dark:hover:text-brand-400"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={startLogout}
              aria-label="Se déconnecter"
              className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Se déconnecter"
        description="Voulez-vous vraiment fermer votre session Ecotocare ? Vous devrez vous reconnecter pour accéder à votre tableau de bord."
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        onConfirm={handleLogout}
        onClose={() => setConfirmLogoutOpen(false)}
        loading={logoutLoading}
      />
    </div>
  );
}

function SidebarContent({
  navItems,
  roleLabel,
  pathname,
  userFullName,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  pathname: string;
  userFullName?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6 transition-opacity hover:opacity-80">
        <Image
          src="/images/ecotocare-icon.png"
          alt={`Logo ${siteConfig.name}`}
          width={36}
          height={36}
          className="rounded-xl shadow-sm"
        />
        <div className="leading-tight">
          <p className="text-base font-bold text-ink">{siteConfig.name}</p>
          <p className="text-xs font-medium text-ink-soft">{roleLabel}</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {userFullName ? (
        <div className="mt-auto border-t border-border bg-surface/50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{userFullName}</p>
              <p className="truncate text-xs text-ink-soft">Connecté</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
