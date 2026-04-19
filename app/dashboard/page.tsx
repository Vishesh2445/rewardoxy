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

  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, streak_count, total_earned, display_name")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;
  const streak = userData?.streak_count ?? 0;
  const totalEarned = userData?.total_earned ?? 0;
  const displayName = userData?.display_name ?? user.email?.split("@")[0] ?? "User";

  return (
    <AppShell coins={coins} userId={user.id}>
      <DashboardClient
        userId={user.id}
        displayName={displayName}
        initialCoins={coins}
        initialStreak={streak}
        initialTotalEarned={totalEarned}
        initialCompletions={[]}
      />
    </AppShell>
  );
}
