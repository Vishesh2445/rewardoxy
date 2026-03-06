import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Fetch all initial data in parallel
  const [userResult, completionsResult] = await Promise.all([
    supabase
      .from("users")
      .select("coins_balance, streak_count")
      .eq("id", user.id)
      .single(),

    supabase
      .from("completions")
      .select("id, offer_name, coins_earned, created_at")
      .eq("player_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const coins = userResult.data?.coins_balance ?? 0;
  const streak = userResult.data?.streak_count ?? 0;
  const completions = completionsResult.data ?? [];

  return (
    <DashboardClient
      userId={user.id}
      initialCoins={coins}
      initialStreak={streak}
      initialCompletions={completions}
    />
  );
}
