import PasswordResetsClient from "@/components/admin-password-resets-client";
import { requireAdmin } from "@/lib/admin-auth";

export default async function PasswordResetsPage() {
  await requireAdmin();
  return <PasswordResetsClient />;
}
