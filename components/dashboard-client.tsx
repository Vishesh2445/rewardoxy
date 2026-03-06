"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Coins,
  Flame,
  Gift,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Gamepad2,
  FileText,
  Smartphone,
  CalendarCheck,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Completion {
  id: string;
  program_id: string;
  coins_awarded: number;
  created_at: string;
}

interface DashboardProps {
  userId: string;
  displayName: string;
  initialCoins: number;
  initialStreak: number;
  initialTotalEarned: number;
  initialCompletions: Completion[];
}

const OFFER_ICONS: Record<string, typeof Gamepad2> = {
  game: Gamepad2,
  survey: FileText,
  app: Smartphone,
};

function offerIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("game") || lower.includes("play")) return OFFER_ICONS.game;
  if (lower.includes("survey") || lower.includes("fill")) return OFFER_ICONS.survey;
  return OFFER_ICONS.app;
}

export default function DashboardClient({
  userId,
  displayName,
  initialCoins,
  initialStreak,
  initialTotalEarned,
  initialCompletions,
}: DashboardProps) {
  const [coins, setCoins] = useState(initialCoins);
  const [streak, setStreak] = useState(initialStreak);
  const [totalEarned, setTotalEarned] = useState(initialTotalEarned);
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    function subscribe() {
      if (channelRef.current) return;
      const channel = supabase
        .channel(`user-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              coins_balance: number;
              streak_count: number;
              total_earned: number;
            };
            setCoins(row.coins_balance);
            setStreak(row.streak_count);
            setTotalEarned(row.total_earned);
          }
        )
        .subscribe();
      channelRef.current = channel;
    }

    function unsubscribe() {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        subscribe();
        refreshData();
      } else {
        unsubscribe();
      }
    }

    async function refreshData() {
      const { data: userData } = await supabase
        .from("users")
        .select("coins_balance, streak_count, total_earned")
        .eq("id", userId)
        .single();

      if (userData) {
        setCoins(userData.coins_balance);
        setStreak(userData.streak_count);
        setTotalEarned(userData.total_earned);
      }

      const { data: recent } = await supabase
        .from("completions")
        .select("id, program_id, coins_awarded, created_at")
        .eq("player_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (recent) setCompletions(recent);
    }

    subscribe();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [userId]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="text-emerald-400">{displayName}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s your earnings overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Coins className="h-5 w-5 text-emerald-400" />}
          bg="bg-emerald-500/10"
          label="Balance"
          value={coins.toLocaleString()}
          sub="coins"
          accent
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-sky-400" />}
          bg="bg-sky-500/10"
          label="Total Earned"
          value={totalEarned.toLocaleString()}
          sub="coins"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-amber-400" />}
          bg="bg-amber-500/10"
          label="Streak"
          value={String(streak)}
          sub="days"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-violet-400" />}
          bg="bg-violet-500/10"
          label="Completions"
          value={String(completions.length)}
          sub="recent"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickAction
          href="/offers"
          icon={<Gift className="h-6 w-6 text-emerald-400" />}
          title="Complete Offers"
          description="Earn coins by completing tasks"
        />
        <QuickAction
          href="/daily-bonus"
          icon={<CalendarCheck className="h-6 w-6 text-amber-400" />}
          title="Daily Bonus"
          description="Claim your daily reward"
        />
        <QuickAction
          href="/cashout"
          icon={<Wallet className="h-6 w-6 text-sky-400" />}
          title="Cash Out"
          description="Withdraw your earnings"
        />
      </div>

      {/* Recent activity */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          {completions.length > 0 && (
            <Link
              href="/history"
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {completions.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-sm text-zinc-500">
              No completions yet. Complete your first offer to see activity here.
            </p>
            <Link
              href="/offers"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Browse Offers
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {completions.map((c) => {
              const Icon = offerIcon(c.program_id);
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Program {c.program_id}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    +{c.coins_awarded}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className={`text-xl font-bold ${accent ? "text-emerald-400" : ""}`}>
            {value}
            <span className="ml-1 text-xs font-normal text-zinc-500">{sub}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-emerald-500/40"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
    </Link>
  );
}
