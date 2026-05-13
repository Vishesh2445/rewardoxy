import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FullscreenShell from "@/components/fullscreen-shell";
import EarnContent from "@/components/earn-content";
import BalanceUpdater from "@/components/balance-updater";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Earn Rewards — Complete Tasks & Surveys",
  description: "Browse hundreds of offers, surveys, and tasks to earn coins on Rewardoxy. Cash out as crypto anytime.",
  alternates: {
    canonical: "/earn",
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

  return (
    <FullscreenShell coins={coins} userName={fullName} userAvatar={avatarUrl} userId={user.id}>
      <BalanceUpdater userId={user.id} />
      <EarnContent
        userId={user.id}
        userName={fullName}
        userEmail={email}
      />
    </FullscreenShell>
  );
}

