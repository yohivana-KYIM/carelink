"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";import { useSession } from "@/lib/session";
import { api } from "@/lib/api";
import { siteConfig } from "@/lib/site-config";
import { toast } from "react-hot-toast";
import { enablePushNotifications } from "@/lib/push";
import { HelpWidget } from "./HelpWidget";
import { OnboardingTour } from "./OnboardingTour";
import { CabinetTheme } from "@/components/providers/CabinetTheme";

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
  const { user, cabinet, token, logout } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("ecotocare_sidebar_collapsed");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration depuis localStorage, indisponible côté serveur
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleSidebar() {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      setCollapsed((prev) => {
        window.localStorage.setItem("ecotocare_sidebar_collapsed", prev ? "0" : "1");
        return !prev;
      });
    } else {
      setMenuOpen((prev) => !prev);
    }
  }

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
              body: "Vous avez des notifications non lues sur Ecotocare.",
              icon: "/images/ecotocare-icon.png",
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
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="hidden shrink-0 flex-col overflow-hidden border-r border-border bg-surface-raised lg:flex"
      >
        <SidebarContent
          navItems={navItems}
          roleLabel={roleLabel}
          pathname={pathname}
          userFullName={user?.fullName}
          avatarUrl={user?.avatarUrl}
          cabinetName={cabinet?.name}
          cabinetLogoUrl={cabinet?.logoUrl}
          collapsed={collapsed}
        />
      </motion.aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="relative flex w-64 flex-col bg-surface-raised"
            >
              <div className="flex justify-end p-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted transition-transform hover:rotate-90"
                >
                  <X size={16} />
                </button>
              </div>
              <SidebarContent
                navItems={navItems}
                roleLabel={roleLabel}
                pathname={pathname}
                userFullName={user?.fullName}
                avatarUrl={user?.avatarUrl}
                cabinetName={cabinet?.name}
                cabinetLogoUrl={cabinet?.logoUrl}
                onNavigate={() => setMenuOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-raised/95 backdrop-blur-sm px-4 sm:px-6 sticky top-0 z-30">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <span className="hidden lg:flex">
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </span>
            <span className="flex lg:hidden">
              <Menu size={16} />
            </span>
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
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle />
            <button
              type="button"
              onClick={startLogout}
              aria-label="Se déconnecter"
              className="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName}
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full border border-border object-cover"
                unoptimized
              />
            ) : user?.fullName ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            ) : null}
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
      <HelpWidget />
      <OnboardingTour userId={user?.id} />
      <CabinetTheme primaryColor={cabinet?.primaryColor} />
    </div>
  );
}

function SidebarContent({
  navItems,
  roleLabel,
  pathname,
  userFullName,
  avatarUrl,
  cabinetName,
  cabinetLogoUrl,
  collapsed,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  pathname: string;
  userFullName?: string;
  avatarUrl?: string | null;
  cabinetName?: string;
  cabinetLogoUrl?: string | null;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        href="/"
        className={`flex items-center gap-2.5 px-6 py-6 transition-opacity hover:opacity-80 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <Image
          src={cabinetLogoUrl || "/images/ecotocare-icon.png"}
          alt={`Logo ${cabinetName || siteConfig.name}`}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-xl object-cover shadow-sm"
          unoptimized={Boolean(cabinetLogoUrl)}
        />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-base font-bold text-ink">{cabinetName || siteConfig.name}</p>
            <p className="truncate text-xs font-medium text-ink-soft">{roleLabel}</p>
          </div>
        )}
      </Link>

      <nav className="flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <item.icon size={17} className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {userFullName ? (
        <div className={`mt-auto border-t border-border bg-surface/60 px-4 py-4 ${collapsed ? "flex justify-center px-2" : ""}`}>
          <div className={`flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface ${collapsed ? "justify-center" : ""}`}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userFullName}
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-full border border-border object-cover"
                unoptimized
              />
            ) : (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {userFullName.charAt(0).toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{userFullName}</p>
                <p className="flex items-center gap-1 text-xs text-ink-soft">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                  Connecté
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
