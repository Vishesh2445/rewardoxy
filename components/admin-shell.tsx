"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "User Management", href: "/admin/users", icon: "group" },
  { label: "Flagged Users", href: "/admin/users/flagged", icon: "report_problem" },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: "payments" },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications_active" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  function isSelected(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href.includes("?")) return currentUrl === href;
    return pathname === href || (pathname.startsWith(href) && !href.includes("?"));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 bg-primary-container border-r border-outline-variant">
        {/* Brand Header */}
        <div className="px-6 py-8">
          <h1 className="font-headline-md text-headline-md font-bold text-on-tertiary-container">Rewardoxy Admin</h1>
          <p className="text-on-primary-container font-body-sm text-body-sm opacity-80 mt-1">Management Portal</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-1 custom-scrollbar overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(({ label, href, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isSelected(href)
                  ? "border-l-4 border-on-tertiary-container bg-surface-variant/10 text-on-tertiary-container font-semibold"
                  : "text-on-primary-container hover:bg-surface-variant/5"
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 bg-black/20 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-variant/20 flex items-center justify-center overflow-hidden border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-primary">person</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-on-primary font-semibold truncate text-body-sm">Admin User</p>
              <p className="text-on-primary-container text-xs truncate">admin@rewardoxy.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] min-h-screen flex flex-col flex-1">
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center h-16 px-gutter w-full z-40 bg-surface border-b border-outline-variant sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all"
                placeholder="Search accounts, logs, or reports..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="font-title-sm text-title-sm text-on-surface">Rewardoxy</span>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-gutter flex-1 max-w-container-max w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile menu button */}
      <button
        className="fixed bottom-4 right-4 z-50 lg:hidden bg-on-tertiary-container text-white p-4 rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-screen w-[260px] bg-primary-container border-r border-outline-variant">
            <div className="px-6 py-8">
              <h1 className="font-headline-md text-headline-md font-bold text-on-tertiary-container">Rewardoxy Admin</h1>
              <p className="text-on-primary-container font-body-sm text-body-sm opacity-80 mt-1">Management Portal</p>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {ADMIN_NAV_ITEMS.map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                    isSelected(href)
                      ? "border-l-4 border-on-tertiary-container bg-surface-variant/10 text-on-tertiary-container font-semibold"
                      : "text-on-primary-container hover:bg-surface-variant/5"
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
