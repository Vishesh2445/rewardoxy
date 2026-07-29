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
    recentResult,
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
    adminSupabase
      .from("completions")
      .select("id, player_id, program_id, offer_name, payout_decimal, coins_awarded, source, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
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

  const recentCompletions = recentResult.data ?? [];
  const userIds = [...new Set(recentCompletions.map(c => c.player_id))];
  const userMap: Record<string, { email: string; display_name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: usersData } = await adminSupabase
      .from("users")
      .select("id, email, display_name")
      .in("id", userIds);
    for (const u of (usersData ?? [])) {
      userMap[u.id] = { email: u.email, display_name: u.display_name };
    }
  }

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
        recentCompletions={recentCompletions}
        userMap={userMap}
      />
    </AdminShell>
  );
}