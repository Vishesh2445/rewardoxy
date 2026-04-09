import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import HistoryClient from "@/components/history-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [userResult, completionsResult, cpxResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance")
      .eq("id", user.id)
      .single(),

    supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at, source", {
        count: "exact",
      })
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),

    // Fetch CPX transactions
    supabase
      .from("cpx_transactions")
      .select("id, transid, amount_local, status, type, created_at", {
        count: "exact",
      })
      .eq("userid", user.id)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;

  // Merge completions and CPX transactions
  const allCompletions = [
    ...(completionsResult.data ?? []),
    ...(cpxResult.data ?? []).map((cpx) => ({
      id: cpx.id,
      program_id: cpx.type === 'complete' ? 'CPX Survey' : cpx.type === 'out' ? 'CPX Screen-out' : cpx.type === 'bonus' ? 'CPX Rating Bonus' : 'CPX Research',
      payout_decimal: cpx.amount_local,
      coins_awarded: cpx.status === 2 ? -Math.round(Number(cpx.amount_local)) : Math.round(Number(cpx.amount_local)),
      created_at: cpx.created_at,
      source: 'cpx',
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalCount = (completionsResult.count ?? 0) + (cpxResult.count ?? 0);

  return (
    <AppShell coins={coins}>
      <HistoryClient
        userId={user.id}
        initialCompletions={allCompletions.slice(0, PAGE_SIZE)}
        initialTotal={totalCount}
      />
    </AppShell>
  );
}
