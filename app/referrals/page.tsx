import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const [userResult, countResult, coinsResult, listResult] = await Promise.all([
    supabase
      .from("users")
      .select("referral_code")
      .eq("id", user.id)
      .single(),

    supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_uid", user.id),

    supabase
      .from("referrals")
      .select("lifetime_coins_earned")
      .eq("referrer_uid", user.id),

    supabase
      .from("referrals")
      .select("id, referred_uid, lifetime_coins_earned, created_at, users!referrals_referred_uid_fkey(email)")
      .eq("referrer_uid", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const referralCode = userResult.data?.referral_code ?? "";
  const totalReferrals = countResult.count ?? 0;

  const totalCoins = (coinsResult.data ?? []).reduce(
    (sum, row) => sum + (row.lifetime_coins_earned ?? 0),
    0
  );

  const referrals = (listResult.data ?? []).map((row) => {
    const joined = row.users as unknown as { email: string } | null;
    return {
      id: row.id,
      masked_email: joined?.email ? maskEmail(joined.email) : "***",
      created_at: row.created_at,
    };
  });

  return (
    <ReferralsClient
      referralCode={referralCode}
      totalReferrals={totalReferrals}
      totalCoins={totalCoins}
      referrals={referrals}
    />
  );
}
