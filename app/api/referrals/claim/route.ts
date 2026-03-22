import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's pending referral earnings
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("pending_referral_earnings, coins_balance, total_earned")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pendingEarnings = userData.pending_referral_earnings ?? 0;

    if (pendingEarnings <= 0) {
      return NextResponse.json({ error: "No pending earnings to claim" }, { status: 400 });
    }

    // Add pending earnings to balance and reset pending to 0
    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins_balance: (userData.coins_balance ?? 0) + pendingEarnings,
        total_earned: (userData.total_earned ?? 0) + pendingEarnings,
        pending_referral_earnings: 0,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error claiming referral earnings:", updateError);
      return NextResponse.json({ error: "Failed to claim earnings" }, { status: 500 });
    }

    // Add notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Referral Earnings Claimed!",
      message: `You have claimed ${pendingEarnings} coins from referral earnings.`,
      read: false,
    });

    return NextResponse.json({ 
      success: true, 
      claimedAmount: pendingEarnings,
      newBalance: (userData.coins_balance ?? 0) + pendingEarnings
    });
  } catch (error) {
    console.error("Claim referral earnings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get pending referral earnings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("pending_referral_earnings")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      pendingEarnings: userData.pending_referral_earnings ?? 0 
    });
  } catch (error) {
    console.error("Get pending earnings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
