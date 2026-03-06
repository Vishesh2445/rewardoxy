import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import CashoutClient from "@/components/cashout-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function CashoutPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [userResult, withdrawalsResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance")
      .eq("id", user.id)
      .single(),

    supabase
      .from("withdrawals")
      .select("id, requested_at, coins, amount_usd, network, status, tx_hash", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const withdrawals = withdrawalsResult.data ?? [];
  const total = withdrawalsResult.count ?? 0;

  return (
    <AppShell coins={coins}>
      <CashoutClient
        userId={user.id}
        initialCoins={coins}
        initialWithdrawals={withdrawals}
        initialTotal={total}
      />
    </AppShell>
  );
}
