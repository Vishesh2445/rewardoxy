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
    .select("coins_balance, display_name, crypto_address, preferred_network, total_earned, streak_count, created_at, email_verified, referred_by")
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

  const { count: withdrawalCount } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const coins = userData?.coins_balance ?? 0;

  return (
    <AppShell coins={coins}>
      <ProfileClient
        userId={user.id}
        email={user.email ?? ""}
        displayName={userData?.display_name ?? ""}
        cryptoAddress={userData?.crypto_address ?? ""}
        preferredNetwork={userData?.preferred_network ?? "TRC-20"}
        totalEarned={userData?.total_earned ?? 0}
        streakCount={userData?.streak_count ?? 0}
        totalCompletions={completionCount ?? 0}
        totalWithdrawals={withdrawalCount ?? 0}
        memberSince={userData?.created_at ?? user.created_at}
        emailVerified={userData?.email_verified ?? false}
        referredBy={referrerInfo}
      />
    </AppShell>
  );
}
