"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Coins,
  Flame,
  Clock,
  Gift,
  Wallet,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle,
  Gamepad2,
  FileText,
  Smartphone,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Completion {
  id: string;
  offer_name: string;
  coins_earned: number;
  created_at: string;
}

interface DashboardProps {
  userId: string;
  initialCoins: number;
  initialStreak: number;
  initialPending: number;
  initialCompletions: Completion[];
}

const NAV_CARDS = [
  { label: "Offers", href: "/offers", icon: Gift, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Wallet", href: "/wallet", icon: Wallet, color: "text-sky-400", bg: "bg-sky-500/10" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Referrals", href: "/referrals", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
];

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
  initialCoins,
  initialStreak,
  initialPending,
  initialCompletions,
}: DashboardProps) {
  const [coins, setCoins] = useState(initialCoins);
  const [streak, setStreak] = useState(initialStreak);
  const [pending, setPending] = useState(initialPending);
  const [completions, setCompletions] = useState<Completion[]>(initialCompletions);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  // Realtime subscription with visibility pause
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
            const row = payload.new as { coins_balance: number; streak_count: number };
            setCoins(row.coins_balance);
            setStreak(row.streak_count);
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
        // Refetch latest data when tab becomes visible
        refreshData();
      } else {
        unsubscribe();
      }
    }

    async function refreshData() {
      const { data: userData } = await supabase
        .from("users")
        .select("coins_balance, streak_count")
        .eq("id", userId)
        .single();

      if (userData) {
        setCoins(userData.coins_balance);
        setStreak(userData.streak_count);
      }

      const { count } = await supabase
        .from("postback_queue")
        .select("*", { count: "exact", head: true })
        .eq("player_id", userId)
        .eq("status", "pending");

      if (count !== null) setPending(count);

      const { data: recent } = await supabase
        .from("completions")
        .select("id, offer_name, coins_earned, created_at")
        .eq("player_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-400">
            Rewardoxy
          </Link>
          <span className="text-sm text-zinc-500">Dashboard</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Coin balance */}
          <div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <Coins className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Balance</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {coins.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-zinc-500">coins</span>
                </p>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <Flame className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Streak</p>
                <p className="text-2xl font-bold">
                  {streak}
                  <span className="ml-1 text-sm font-normal text-zinc-500">days</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pending tasks */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                <Clock className="h-5 w-5 text-sky-400" />
                {pending > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-zinc-950">
                    {pending}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Pending</p>
                <p className="text-2xl font-bold">
                  {pending}
                  <span className="ml-1 text-sm font-normal text-zinc-500">tasks</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {NAV_CARDS.map(({ label, href, icon: Icon, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-zinc-300 group-hover:text-zinc-100">
                {label}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </div>

        {/* Recent completions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>

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
                const Icon = offerIcon(c.offer_name);
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.offer_name}</p>
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
                      +{c.coins_earned}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
