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
    .select("coins_balance, streak_count, display_name")
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

  // Get today's coins earned (from ALL sources: MyLead, CPX, Notik, etc.)
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

  // Get today's Notik earnings
  const { data: todayNotik } = await supabase
    .from("notik_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Get today's GemiAd earnings
  const { data: todayGemiad } = await supabase
    .from("gemiad_transactions")
    .select("reward, status")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Get today's TheoremReach earnings
  const { data: todayTheoremreach } = await supabase
    .from("theoremreach_transactions")
    .select("reward")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Get today's Revtoo earnings
  const { data: todayRevtoo } = await supabase
    .from("revtoo_transactions")
    .select("reward, status")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Get today's Klink earnings
  const { data: todayKlink } = await supabase
    .from("klink_transactions")
    .select("coins_awarded, event_type")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayCoinsFromCompletions = todayCompletions?.reduce(
    (sum, c) => sum + (c.coins_awarded || 0),
    0
  ) || 0;

  const todayCoinsFromCpx = todayCpx?.reduce((sum, c) => {
    const amount = Math.round(Number(c.amount_local || 0));
    return sum + (c.status === 2 ? -amount : amount); // Subtract reversals
  }, 0) || 0;

  const todayCoinsFromNotik = todayNotik?.reduce((sum, n) => {
    const amount = Math.round(Number(n.amount || 0));
    return sum + amount; // Notik amount can be negative for chargebacks
  }, 0) || 0;

  const todayCoinsFromGemiad = todayGemiad?.reduce((sum, g) => {
    const amount = Math.round(Number(g.reward || 0));
    return sum + amount; // GemiAd reward can be negative for reversals
  }, 0) || 0;

  const todayCoinsFromTheoremreach = todayTheoremreach?.reduce((sum, tr) => {
    const amount = Math.round(Number(tr.reward || 0));
    return sum + amount; // TheoremReach reward can be negative for reversals
  }, 0) || 0;

  const todayCoinsFromRevtoo = todayRevtoo?.reduce((sum, r) => {
    const amount = Math.round(Number(r.reward || 0));
    return sum + (r.status === 1 ? amount : -Math.abs(amount)); // Status 2 is reversal
  }, 0) || 0;

  const todayCoinsFromKlink = todayKlink?.reduce((sum, k) => {
    const amount = Math.round(Number(k.coins_awarded || 0));
    return sum + (k.event_type === 'chargeback' ? -Math.abs(amount) : amount);
  }, 0) || 0;

  const todayCoinsEarned = todayCoinsFromCompletions + todayCoinsFromCpx + todayCoinsFromNotik + todayCoinsFromGemiad + todayCoinsFromTheoremreach + todayCoinsFromRevtoo + todayCoinsFromKlink;

  return (
    <AppShell 
      coins={coins}
      userId={user.id}
      userName={userData?.display_name ?? "User"}
      userAvatar={undefined}
    >
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
