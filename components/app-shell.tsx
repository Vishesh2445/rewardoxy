"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  Trophy,
  Users,
  Wallet,
  User,
  History,
  CalendarCheck,
  Menu,
  X,
  LogOut,
  Coins,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Earn", href: "/offers", icon: Gift },
  { label: "Daily Bonus", href: "/daily-bonus", icon: CalendarCheck },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Referrals", href: "/referrals", icon: Users },
  { label: "History", href: "/history", icon: History },
  { label: "Cash Out", href: "/cashout", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

interface AppShellProps {
  children: React.ReactNode;
  coins?: number;
}

export default function AppShell({ children, coins }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/40 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <Link href="/dashboard" className="text-xl font-bold text-emerald-400">
            Rewardoxy
          </Link>
        </div>

        {coins !== undefined && (
          <div className="mx-4 mt-4 rounded-xl bg-emerald-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance</span>
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-400">{coins.toLocaleString()}</p>
          </div>
        )}

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-red-400"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <aside className="relative z-50 flex h-full w-72 flex-col bg-zinc-900 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
              <span className="text-xl font-bold text-emerald-400">Rewardoxy</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="text-zinc-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {coins !== undefined && (
              <div className="mx-4 mt-4 rounded-xl bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance</span>
                </div>
                <p className="mt-1 text-xl font-bold text-emerald-400">{coins.toLocaleString()}</p>
              </div>
            )}

            <nav className="mt-4 flex-1 space-y-1 px-3">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-zinc-800 p-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-red-400"
              >
                <LogOut className="h-4.5 w-4.5" />
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="text-zinc-400">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="text-lg font-bold text-emerald-400">
            Rewardoxy
          </Link>
          {coins !== undefined && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <Coins className="h-4 w-4" />
              {coins.toLocaleString()}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
