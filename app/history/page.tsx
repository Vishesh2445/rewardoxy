import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import HistoryClient from "@/components/history-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [userResult, completionsResult] = await Promise.all([
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
  ]);

  const coins = userResult.data?.coins_balance ?? 0;

  return (
    <AppShell coins={coins}>
      <HistoryClient
        userId={user.id}
        initialCompletions={completionsResult.data ?? []}
        initialTotal={completionsResult.count ?? 0}
      />
    </AppShell>
  );
}
