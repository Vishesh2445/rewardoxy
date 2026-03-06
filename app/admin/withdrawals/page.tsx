import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminWithdrawalsClient from "@/components/admin-withdrawals-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminWithdrawalsPage() {
  const { adminSupabase } = await requireAdmin();

  const { data: withdrawals, count } = await adminSupabase
    .from("withdrawals")
    .select(
      "id, user_id, coins, amount_usd, network, crypto_address, status, tx_hash, requested_at",
      { count: "exact" }
    )
    .order("requested_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const raw = withdrawals ?? [];

  // Fetch user emails
  const userIds = [...new Set(raw.map((w) => w.user_id))];
  const emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await adminSupabase
      .from("users")
      .select("id, email")
      .in("id", userIds);

    for (const u of users ?? []) {
      emailMap[u.id] = u.email;
    }
  }

  const enriched = raw.map((w) => ({
    ...w,
    user_email: emailMap[w.user_id] ?? "Unknown",
  }));

  return (
    <AdminShell>
      <AdminWithdrawalsClient
        initialWithdrawals={enriched}
        initialTotal={count ?? 0}
      />
    </AdminShell>
  );
}
