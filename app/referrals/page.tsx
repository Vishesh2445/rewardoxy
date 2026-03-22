import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import ReferralsClient from "@/components/referrals-client";

export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return `**@${domain ?? "***"}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.min(local.length - 2, 4))}@${domain}`;
}

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [userResult, referredUsersResult] = await Promise.all([
    supabase
      .from("users")
      .select("referral_code, coins_balance, total_earned, pending_referral_earnings")
      .eq("id", user.id)
      .single(),

    // Get users who were referred by this user (using referred_by field)
    supabase
      .from("users")
      .select("id, email, created_at, total_earned, email_verified")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const referralCode = userResult.data?.referral_code ?? "";
  const coins = userResult.data?.coins_balance ?? 0;
  const totalReferrals = referredUsersResult.data?.length ?? 0;
  const pendingReferralEarnings = userResult.data?.pending_referral_earnings ?? 0;

  // Calculate total coins earned from referrals (5% of each verified referral's total_earned)
  const totalCoins = (referredUsersResult.data ?? []).reduce(
    (sum, row) => sum + (row.email_verified ? Math.round((row.total_earned ?? 0) * 0.05) : 0),
    0
  );

  const referrals = (referredUsersResult.data ?? []).map((row) => ({
    id: row.id,
    masked_email: row.email ? maskEmail(row.email) : "***",
    created_at: row.created_at,
  }));

  return (
    <AppShell coins={coins}>
      <ReferralsClient
        referralCode={referralCode}
        totalReferrals={totalReferrals}
        totalCoins={totalCoins}
        referrals={referrals}
        pendingEarnings={pendingReferralEarnings}
      />
    </AppShell>
  );
}
