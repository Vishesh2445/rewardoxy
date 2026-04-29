import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import ProfileClient from "@/components/profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, display_name, crypto_address, total_earned, streak_count, created_at, email_verified, referred_by")
    .eq("id", user.id)
    .single();

  // Get referrer info if user was referred
  let referrerInfo = null;
  if (userData?.referred_by) {
    const { data: referrer } = await supabase
      .from("users")
      .select("email, display_name, referral_code")
      .eq("id", userData.referred_by)
      .single();
    if (referrer) {
      referrerInfo = {
        email: referrer.email,
        displayName: referrer.display_name,
        referralCode: referrer.referral_code
      };
    }
  }

  const { count: completionCount } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("player_id", user.id);

  // Get CPX completion count
  const { count: cpxCompletionCount } = await supabase
    .from("cpx_transactions")
    .select("*", { count: "exact", head: true })
    .eq("userid", user.id)
    .eq("status", 1); // Only count completed transactions, not reversals

  // Get Notik completion count
  const { count: notikCompletionCount } = await supabase
    .from("notik_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gt("amount", 0);

  // Get GemiAd completion count
  const { count: gemiadCompletionCount } = await supabase
    .from("gemiad_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  // Get TheoremReach completion count
  const { count: theoremreachCompletionCount } = await supabase
    .from("theoremreach_transactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_reversal", false)
    .gt("reward", 0);

  const totalCompletions = (completionCount ?? 0) + (cpxCompletionCount ?? 0) + (notikCompletionCount ?? 0) + (gemiadCompletionCount ?? 0) + (theoremreachCompletionCount ?? 0);

  const { count: withdrawalCount } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get this month's earnings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { data: monthlyCompletions } = await supabase
    .from("completions")
    .select("coins_awarded")
    .eq("player_id", user.id)
    .gte("created_at", startOfMonth);

  // Get this month's CPX earnings
  const { data: monthlyCpx } = await supabase
    .from("cpx_transactions")
    .select("amount_local, status")
    .eq("userid", user.id)
    .gte("created_at", startOfMonth);

  // Get this month's Notik earnings
  const { data: monthlyNotik } = await supabase
    .from("notik_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  // Get this month's GemiAd earnings
  const { data: monthlyGemiad } = await supabase
    .from("gemiad_transactions")
    .select("reward, status")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  // Get this month's TheoremReach earnings
  const { data: monthlyTheoremreach } = await supabase
    .from("theoremreach_transactions")
    .select("reward")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  const monthEarnedFromCompletions = monthlyCompletions?.reduce((sum, c) => sum + (c.coins_awarded || 0), 0) || 0;
  const monthEarnedFromCpx = monthlyCpx?.reduce((sum, c) => {
    const amount = Math.round(Number(c.amount_local || 0));
    return sum + (c.status === 2 ? -amount : amount); // Subtract reversals
  }, 0) || 0;
  const monthEarnedFromNotik = monthlyNotik?.reduce((sum, n) => {
    const amount = Math.round(Number(n.amount || 0));
    return sum + amount; // Notik amount can be negative for chargebacks
  }, 0) || 0;
  const monthEarnedFromGemiad = monthlyGemiad?.reduce((sum, g) => {
    const amount = Math.round(Number(g.reward || 0));
    return sum + amount; // GemiAd reward can be negative for reversals
  }, 0) || 0;
  const monthEarnedFromTheoremreach = monthlyTheoremreach?.reduce((sum, tr) => {
    const amount = Math.round(Number(tr.reward || 0));
    return sum + amount; // TheoremReach reward can be negative for reversals
  }, 0) || 0;
  const monthEarned = monthEarnedFromCompletions + monthEarnedFromCpx + monthEarnedFromNotik + monthEarnedFromGemiad + monthEarnedFromTheoremreach;

  const coins = userData?.coins_balance ?? 0;

  return (
    <AppShell 
      coins={coins} 
      userId={user.id}
      userName={userData?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <ProfileClient
        userId={user.id}
        email={user.email ?? ""}
        displayName={userData?.display_name ?? ""}
        cryptoAddress={userData?.crypto_address ?? ""}
        totalEarned={userData?.total_earned ?? 0}
        streakCount={userData?.streak_count ?? 0}
        totalCompletions={totalCompletions}
        totalWithdrawals={withdrawalCount ?? 0}
        monthEarned={monthEarned}
        memberSince={userData?.created_at ?? user.created_at}
        emailVerified={userData?.email_verified ?? false}
        referredBy={referrerInfo}
      />
    </AppShell>
  );
}