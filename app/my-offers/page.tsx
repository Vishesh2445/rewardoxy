import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import MyOffersClient from "@/components/my-offers-client";

export const metadata = {
  title: "My Offers - Rewardoxy",
  description: "Track your offer progress and earnings",
};

export default async function MyOffersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user data for AppShell
  const { data: userData } = await supabase
    .from("users")
    .select("coins_balance, display_name")
    .eq("id", user.id)
    .single();

  const coins = userData?.coins_balance ?? 0;

  return (
    <AppShell 
      coins={coins} 
      userId={user.id}
      userName={userData?.display_name ?? "User"}
      userAvatar={undefined}
    >
      <MyOffersClient userId={user.id} />
    </AppShell>
  );
}
