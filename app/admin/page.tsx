import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminDashboardClient from "@/components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { adminSupabase } = await requireAdmin();

  const [usersResult, coinsResult, pendingResult, completionsResult, bannedResult] =
    await Promise.all([
      adminSupabase.from("users").select("id", { count: "exact", head: true }),
      adminSupabase.from("users").select("coins_balance"),
      adminSupabase
        .from("withdrawals")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      adminSupabase
        .from("completions")
        .select("id", { count: "exact", head: true }),
      adminSupabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("is_banned", true),
    ]);

  const totalUsers = usersResult.count ?? 0;
  const totalCoins = (coinsResult.data ?? []).reduce(
    (sum, u: { coins_balance: number }) => sum + (u.coins_balance ?? 0),
    0
  );
  const pendingWithdrawals = pendingResult.count ?? 0;
  const totalCompletions = completionsResult.count ?? 0;
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
