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

  const [userResult, totalCountResult, initialCompletionsResult, allCompletionsResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance, display_name")
      .eq("id", user.id)
      .single(),

    supabase
      .from("completions")
      .select("id", { count: "exact", head: true })
      .eq("player_id", user.id),

    supabase
      .from("completions")
      .select("id, program_id, payout_decimal, coins_awarded, created_at, source")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE),

    supabase
      .from("completions")
      .select("coins_awarded")
      .eq("player_id", user.id),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const totalCount = totalCountResult.count ?? 0;
  const initialCompletions = initialCompletionsResult.data ?? [];
  
  // Calculate totals from ALL transactions
  const allCompletions = allCompletionsResult.data ?? [];
  const totalEarned = allCompletions
    .filter(c => c.coins_awarded > 0)
    .reduce((sum, c) => sum + Number(c.coins_awarded), 0);
  const totalDeducted = allCompletions
    .filter(c => c.coins_awarded < 0)
    .reduce((sum, c) => sum + Math.abs(Number(c.coins_awarded)), 0);

  return (
    <AppShell 
      coins={coins}
      userId={user.id}
      userName={userResult.data?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <HistoryClient
        userId={user.id}
        initialCompletions={initialCompletions}
        initialTotal={totalCount}
        totalEarned={totalEarned}
        totalDeducted={totalDeducted}
      />
    </AppShell>
  );
}
