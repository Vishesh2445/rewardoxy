import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminFlaggedUsersClient from "@/components/admin-flagged-users-client";

export const dynamic = "force-dynamic";

export default async function AdminFlaggedUsersPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <AdminFlaggedUsersClient />
    </AdminShell>
  );
}
