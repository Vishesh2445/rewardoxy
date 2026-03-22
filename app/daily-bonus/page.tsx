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

  // Get recent claims for history
  const { data: recentClaims } = await supabase
    .from("daily_bonus_claims")
    .select("id, streak_day, coins_awarded, claimed_at")
    .eq("user_id", user.id)
    .order("claimed_at", { ascending: false })
    .limit(7);

  // Get today's earnings (from ALL sources: MyLead, CPX, etc.)
  const { data: todayCompletions } = await supabase
    .from("completions")
    .select("payout_decimal")
    .eq("player_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayEarnings = todayCompletions?.reduce(
    (sum, c) => sum + (c.payout_decimal || 0),
    0
  ) || 0;

  return (
    <AppShell coins={coins}>
      <DailyBonusClient
        streakCount={userData?.streak_count ?? 0}
        alreadyClaimed={!!todayClaim}
        todayReward={todayClaim?.coins_awarded ?? null}
        todayStreak={todayClaim?.streak_day ?? null}
        recentClaims={recentClaims ?? []}
        todayEarnings={todayEarnings}
      />
    </AppShell>
  );
}
