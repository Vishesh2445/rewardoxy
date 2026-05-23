import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminUsersClient from "@/components/admin-users-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { adminSupabase } = await requireAdmin();
  const params = await searchParams;
  const source = params.source || "";

  let query = adminSupabase
    .from("users")
    .select("id, email, coins_balance, total_earned, role, is_banned, created_at, signup_country, last_seen_country, fraud_status, vpn_detected_count, mismatch_count, signup_source", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (source === "web" || source === "app") {
    query = query.eq("signup_source", source);
  }

  const { data: users, count } = await query;

  return (
    <AdminShell>
      <AdminUsersClient initialUsers={users ?? []} initialTotal={count ?? 0} source={source} />
    </AdminShell>
  );
}
