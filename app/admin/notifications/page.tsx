import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminNotificationsClient from "@/components/admin-notifications-client";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const { adminSupabase } = await requireAdmin();

  // Only show admin-sent notifications
  const { data: recent } = await adminSupabase
    .from("notifications")
    .select("id, user_id, title, message, is_broadcast, created_at")
    .eq("admin_sent", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <AdminShell>
      <AdminNotificationsClient initialNotifications={recent ?? []} />
    </AdminShell>
  );
}
