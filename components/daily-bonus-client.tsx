"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Flame,
  Gift,
  Loader2,
  CheckCircle,
  Coins,
  Star,
} from "lucide-react";

const STREAK_REWARDS = [0, 10, 20, 30, 40, 50, 75, 100];

interface Claim {
  id: string;
  streak_day: number;
  coins_awarded: number;
  claimed_at: string;
}

interface DailyBonusClientProps {
  streakCount: number;
  alreadyClaimed: boolean;
  todayReward: number | null;
  todayStreak: number | null;
  recentClaims: Claim[];
}

export default function DailyBonusClient({
  streakCount,
  alreadyClaimed: initialClaimed,
  todayReward: initialReward,
  todayStreak: initialStreak,
  recentClaims,
}: DailyBonusClientProps) {
  const router = useRouter();
  const [claimed, setClaimed] = useState(initialClaimed);
  const [reward, setReward] = useState(initialReward);
  const [streak, setStreak] = useState(initialStreak ?? streakCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/daily-bonus", { method: "POST" });
    const body = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(body.error || "Failed to claim bonus");
      return;
    }

    setClaimed(true);
    setReward(body.reward);
    setStreak(body.streakDay);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarCheck className="h-6 w-6 text-amber-400" />
          Daily Bonus
        </h1>
        <p className="text-sm text-zinc-500">Claim your daily reward and build your streak</p>
      </div>

      {/* Streak progress */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Flame className="h-5 w-5 text-amber-400" />
            7-Day Streak
          </h2>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            Day {claimed ? streak : Math.max(streakCount, 0)}
          </span>
        </div>

        {/* Day circles */}
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const currentDay = claimed ? (streak ?? 0) : streakCount;
            const isCompleted = day <= currentDay;
            const isCurrent = day === currentDay;
            const dayReward = STREAK_REWARDS[day];

            return (
              <div
                key={day}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${
                  isCompleted
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : isCurrent && !claimed
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-zinc-800 bg-zinc-900/40"
                }`}
              >
                <span className="text-[10px] font-medium uppercase text-zinc-500">Day {day}</span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted ? "bg-emerald-500/20" : "bg-zinc-800"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Star className="h-4 w-4 text-zinc-600" />
                  )}
                </div>
                <span className={`text-xs font-semibold ${isCompleted ? "text-emerald-400" : "text-zinc-500"}`}>
                  +{dayReward}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim card */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
        {claimed ? (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Bonus Claimed!</h3>
            <p className="mt-1 text-sm text-zinc-500">
              You earned{" "}
              <span className="font-semibold text-emerald-400">+{reward}</span>{" "}
              coins today
            </p>
            <p className="mt-2 text-xs text-zinc-600">Come back tomorrow to continue your streak</p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Gift className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold">Daily Bonus Ready!</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Claim your Day {Math.min(streakCount + 1, 7)} reward of{" "}
              <span className="font-semibold text-emerald-400">
                +{STREAK_REWARDS[Math.min(streakCount + 1, 7)]}
              </span>{" "}
              coins
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleClaim}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Claim Bonus
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Claims</h2>
          <div className="space-y-2">
            {recentClaims.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                    <CalendarCheck className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Day {c.streak_day} Bonus</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(c.claimed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                  <Coins className="h-3.5 w-3.5" />
                  +{c.coins_awarded}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
