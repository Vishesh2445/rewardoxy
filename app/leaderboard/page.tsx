import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import { Clock, Trophy, Medal } from "lucide-react";

export const dynamic = "force-dynamic";

const MEDALS = ["", "gold", "silver", "bronze"] as const;

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-lg" role="img" aria-label="1st place">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-400/10 text-lg" role="img" aria-label="2nd place">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700/10 text-lg" role="img" aria-label="3rd place">
        🥉
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center text-sm font-medium text-zinc-500">
      {rank}
    </span>
  );
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [leaderboardResult, userResult] = await Promise.all([
    supabase
      .from("leaderboard_cache")
      .select("rank, user_id, display_name, weekly_coins")
      .order("rank", { ascending: true }),
    user
      ? supabase
          .from("users")
          .select("coins_balance")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const leaderboard = leaderboardResult.data ?? [];
  const coins = userResult.data?.coins_balance ?? 0;

  return (
    <AppShell coins={user ? coins : undefined}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="h-6 w-6 text-amber-400" />
              Leaderboard
            </h1>
            <p className="text-sm text-zinc-500">Top earners this week</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] font-medium text-zinc-400">
            <Clock className="h-3 w-3" />
            Updated every 6 hours
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            <Medal className="mx-auto h-10 w-10 text-zinc-700" />
            <p className="mt-3 text-sm text-zinc-500">
              No leaderboard data yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {leaderboard.map((row) => {
                const isMe = user?.id === row.user_id;
                return (
                  <div
                    key={row.user_id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      isMe
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-900/60"
                    }`}
                  >
                    <RankCell rank={row.rank} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${isMe ? "text-emerald-400" : ""}`}>
                        {row.display_name}
                        {isMe && (
                          <span className="ml-2 text-[10px] font-semibold uppercase text-emerald-500">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">
                      {row.weekly_coins.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-zinc-800 sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="w-16 px-4 py-3 text-center font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Player</th>
                    <th className="px-4 py-3 text-right font-medium">Weekly Coins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {leaderboard.map((row) => {
                    const isMe = user?.id === row.user_id;
                    return (
                      <tr
                        key={row.user_id}
                        className={
                          isMe
                            ? "bg-emerald-500/5"
                            : "bg-zinc-900/40"
                        }
                      >
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <RankCell rank={row.rank} />
                          </div>
                        </td>
                        <td className={`px-4 py-3 font-medium ${isMe ? "text-emerald-400" : ""}`}>
                          {row.display_name}
                          {isMe && (
                            <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                          {row.weekly_coins.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
