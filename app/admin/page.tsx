import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminDashboardClient from "@/components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { adminSupabase } = await requireAdmin();

  const [
    usersResult,
    pendingResult,
    completionsCountResult,
    coinsDataResult,
    chargebackResult,
    bannedResult,
  ] = await Promise.all([
    adminSupabase.from("users").select("id", { count: "exact", head: true }),
    adminSupabase
      .from("withdrawals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminSupabase
      .from("completions")
      .select("id", { count: "exact", head: true })
      .gt("coins_awarded", 0),
    adminSupabase
      .from("completions")
      .select("coins_awarded"),
    adminSupabase
      .from("completions")
      .select("coins_awarded")
      .lt("coins_awarded", 0),
    adminSupabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("is_banned", true),
  ]);

  const totalUsers = usersResult.count ?? 0;
  const pendingWithdrawals = pendingResult.count ?? 0;
  const totalCompletions = completionsCountResult.count ?? 0;
  const bannedUsers = bannedResult.count ?? 0;

  const allCoins = coinsDataResult.data ?? [];
  const totalCoins = allCoins.reduce(
    (sum: number, t: { coins_awarded: number }) => sum + (Math.max(t.coins_awarded ?? 0, 0)),
    0
  );
  const netCoins = allCoins.reduce(
    (sum: number, t: { coins_awarded: number }) => sum + (t.coins_awarded ?? 0),
    0
  );

  const chargebackData = chargebackResult.data ?? [];
  const totalChargebacks = chargebackData.length;
  const totalChargebackCoins = chargebackData.reduce(
    (sum: number, t: { coins_awarded: number }) => sum + Math.abs(t.coins_awarded ?? 0),
    0
  );

  return (
    <AdminShell>
      <AdminDashboardClient
        totalUsers={totalUsers}
        totalCoins={totalCoins}
        pendingWithdrawals={pendingWithdrawals}
        totalCompletions={totalCompletions}
        bannedUsers={bannedUsers}
        totalChargebacks={totalChargebacks}
        totalChargebackCoins={totalChargebackCoins}
        netCoins={netCoins}
      />
    </AdminShell>
  );
}