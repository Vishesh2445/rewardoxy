import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import DailyBonusClient from "@/components/daily-bonus-client";

export const dynamic = "force-dynamic";

export default async function DailyBonusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, streak_count")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;

  // Check today's claim
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: todayClaim } = await supabase
    .from("daily_bonus_claims")
    .select("id, streak_day, coins_awarded")
    .eq("user_id", user.id)
    .gte("claimed_at", todayStart.toISOString())
    .limit(1)
    .maybeSingle();

  // Get today's coins earned (from ALL sources: MyLead, CPX, etc.)
  const { data: todayCompletions } = await supabase
    .from("completions")
    .select("coins_awarded")
    .eq("player_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Get today's CPX earnings
  const { data: todayCpx } = await supabase
    .from("cpx_transactions")
    .select("amount_local, status")
    .eq("userid", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayCoinsFromCompletions = todayCompletions?.reduce(
    (sum, c) => sum + (c.coins_awarded || 0),
    0
  ) || 0;

  const todayCoinsFromCpx = todayCpx?.reduce((sum, c) => {
    const amount = Math.round(Number(c.amount_local || 0));
    return sum + (c.status === 2 ? -amount : amount); // Subtract reversals
  }, 0) || 0;

  const todayCoinsEarned = todayCoinsFromCompletions + todayCoinsFromCpx;

  return (
    <AppShell coins={coins}>
      <DailyBonusClient
        streakCount={userData?.streak_count ?? 0}
        alreadyClaimed={!!todayClaim}
        todayReward={todayClaim?.coins_awarded ?? null}
        todayStreak={todayClaim?.streak_day ?? null}
        todayCoinsEarned={todayCoinsEarned}
      />
    </AppShell>
  );
}
