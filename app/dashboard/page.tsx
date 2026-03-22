import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import DashboardClient from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
      .select("coins_balance, streak_count, total_earned, display_name")
      .eq("id", user.id)
      .single(),

    supabase
      .from("completions")
      .select("id, program_id, coins_awarded, created_at, source")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const streak = userResult.data?.streak_count ?? 0;
  const totalEarned = userResult.data?.total_earned ?? 0;
  const displayName = userResult.data?.display_name ?? user.email?.split("@")[0] ?? "User";
  const completions = completionsResult.data ?? [];

  return (
    <AppShell coins={coins}>
      <DashboardClient
        userId={user.id}
        displayName={displayName}
        initialCoins={coins}
        initialStreak={streak}
        initialTotalEarned={totalEarned}
        initialCompletions={completions}
      />
    </AppShell>
  );
}
