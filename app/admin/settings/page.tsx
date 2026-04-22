import { requireAdmin } from "@/lib/admin-auth";
import AdminShell from "@/components/admin-shell";
import AdminSettingsClient from "@/components/admin-settings-client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <AdminSettingsClient />
    </AdminShell>
  );
}
