import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminDashboardClient from "@/components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { adminSupabase } = await requireAdmin();

  const [usersResult, coinsResult, pendingResult, completionsResult, cpxResult, notikResult, gemiadResult, theoremreachResult, bannedResult] =
    await Promise.all([
      adminSupabase.from("users").select("id", { count: "exact", head: true }),
      adminSupabase.from("users").select("total_earned").neq("role", "admin"),
      adminSupabase
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      adminSupabase
        .from("completions")
        .select("id", { count: "exact", head: true }),
      adminSupabase
        .from("cpx_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", 1), // Only count completions, not reversals
      adminSupabase
        .from("notik_transactions")
        .select("id", { count: "exact", head: true })
        .gt("amount", 0), // Only count positive amounts
      adminSupabase
        .from("gemiad_transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      adminSupabase
        .from("theoremreach_transactions")
        .select("id", { count: "exact", head: true })
        .eq("is_reversal", false)
        .gt("reward", 0),
      adminSupabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("is_banned", true),
    ]);

  const totalUsers = usersResult.count ?? 0;
  const totalCoins = (coinsResult.data ?? []).reduce(
    (sum, u: { total_earned: number }) => sum + (u.total_earned ?? 0),
    0
  );
  const pendingWithdrawals = pendingResult.count ?? 0;
  const totalCompletions = (completionsResult.count ?? 0) + (cpxResult.count ?? 0) + (notikResult.count ?? 0) + (gemiadResult.count ?? 0) + (theoremreachResult.count ?? 0);
  const bannedUsers = bannedResult.count ?? 0;

  return (
    <AdminShell>
      <AdminDashboardClient
        totalUsers={totalUsers}
        totalCoins={totalCoins}
        pendingWithdrawals={pendingWithdrawals}
        totalCompletions={totalCompletions}
        bannedUsers={bannedUsers}
      />
    </AdminShell>
  );
}
