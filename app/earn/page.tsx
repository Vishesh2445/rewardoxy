import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FullscreenShell from "@/components/fullscreen-shell";
import EarnContent from "@/components/earn-content";
import BalanceUpdater from "@/components/balance-updater";
import crypto from "crypto";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rewardoxy.app/earn",
  },
};

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
    .select("coins_balance, display_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;
  const fullName = userData?.display_name ?? "";
  const email = userData?.email ?? "";
  const avatarUrl = userData?.avatar_url ?? "";

  // Calculate CPX Secure Hash for frontend iframe (required if wall is secure)
  // Formula: hex(md5(user_id + your_hash))
  const secureHashAppCode = process.env.CPX_SECURE_HASH || "";
  const cpxHash = crypto.createHash("md5").update(`${user.id}-${secureHashAppCode}`).digest("hex");

  return (
    <FullscreenShell coins={coins} userName={fullName} userAvatar={avatarUrl} userId={user.id}>
      <BalanceUpdater userId={user.id} />
      <EarnContent 
        userId={user.id} 
        userName={fullName} 
        userEmail={email} 
        cpxHash={cpxHash} 
      />
    </FullscreenShell>
  );
}

