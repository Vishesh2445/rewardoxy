import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AppShell from "@/components/app-shell";
import CashoutClient from "@/components/cashout-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function CashoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const admin = createAdminClient();

  const [userResult, withdrawalsResult, fraudNotifResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance, is_banned, email_verified, fraud_status, crypto_address, display_name")
      .eq("id", user.id)
      .single(),

    supabase
      .from("withdrawals")
      .select("id, requested_at, coins, amount_usd, status, tx_hash", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Check for undismissed cashout_blocked notification
    admin
      .from("notifications")
      .select("id, message")
      .eq("user_id", user.id)
      .eq("type", "cashout_blocked")
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const isBanned = userResult.data?.is_banned ?? false;
  const emailVerified = userResult.data?.email_verified ?? false;
  const fraudStatus = userResult.data?.fraud_status ?? "clean";
  const cryptoAddress = userResult.data?.crypto_address ?? "";
  const withdrawals = withdrawalsResult.data ?? [];
  const total = withdrawalsResult.count ?? 0;

  // Get fraud notification if exists
  const fraudNotification = fraudNotifResult.data?.[0] ?? null;

  return (
    <AppShell 
      coins={coins}
      userId={user.id}
      userName={userResult.data?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <CashoutClient
        userId={user.id}
        initialCoins={coins}
        initialWithdrawals={withdrawals}
        initialTotal={total}
        isBanned={isBanned}
        emailVerified={emailVerified}
        fraudStatus={fraudStatus}
        fraudNotification={fraudNotification}
        savedCryptoAddress={cryptoAddress}
      />
    </AppShell>
  );
}
