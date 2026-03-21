import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/app-shell";
import EarnContent from "@/components/earn-content";
import crypto from "crypto";

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
    .select("coins_balance, full_name, email")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;
  const fullName = userData?.full_name ?? "";
  const email = userData?.email ?? "";

  // Calculate CPX Secure Hash for frontend iframe (required if wall is secure)
  // Formula: hex(md5(user_id + your_hash))
  const secureHashAppCode = process.env.CPX_SECURE_HASH || "";
  const cpxHash = crypto.createHash("md5").update(`${user.id}-${secureHashAppCode}`).digest("hex");

  return (
    <AppShell coins={coins}>
      <EarnContent 
        userId={user.id} 
        userName={fullName} 
        userEmail={email} 
        cpxHash={cpxHash} 
      />
    </AppShell>
  );
}

