import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CashoutClient from "@/components/cashout-client";

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
      .select("id, created_at, coins, amount_usd, network, status, tx_hash", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const withdrawals = withdrawalsResult.data ?? [];
  const total = withdrawalsResult.count ?? 0;

  return (
    <CashoutClient
      userId={user.id}
      initialCoins={coins}
      initialWithdrawals={withdrawals}
      initialTotal={total}
    />
  );
}
