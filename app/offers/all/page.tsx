import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FullscreenShell from "@/components/fullscreen-shell";
import AllOffersClient from "@/components/all-offers-client";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Offers - Rewardoxy",
  alternates: {
    canonical: "https://rewardoxy.app/offers/all",
  },
};

export default async function AllOffersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;
  const fullName = userData?.display_name ?? "";
  const avatarUrl = userData?.avatar_url ?? "";

  return (
    <FullscreenShell coins={coins} userName={fullName} userAvatar={avatarUrl}>
      <AllOffersClient userId={user.id} />
    </FullscreenShell>
  );
}
