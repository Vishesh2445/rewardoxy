import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import EarnContent from "@/components/earn-content";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;

  return (
    <AppShell coins={coins}>
      <EarnContent userId={user.id} />
    </AppShell>
  );
}
