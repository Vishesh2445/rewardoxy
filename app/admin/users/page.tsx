import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminUsersClient from "@/components/admin-users-client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminUsersPage() {
  const { adminSupabase } = await requireAdmin();

  const { data: users, count } = await adminSupabase
    .from("users")
    .select("id, email, coins_balance, total_earned, role, is_banned, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <AdminShell>
      <AdminUsersClient initialUsers={users ?? []} initialTotal={count ?? 0} />
    </AdminShell>
  );
}
