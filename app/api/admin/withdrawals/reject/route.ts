import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { withdrawalId } = await request.json();

  if (!withdrawalId) {
    return NextResponse.json({ error: "Missing withdrawalId" }, { status: 400 });
  }

  // Fetch the withdrawal
  const { data: withdrawal, error: fetchError } = await adminSupabase
    .from("withdrawals")
    .select("id, user_id, coins, status")
    .eq("id", withdrawalId)
    .eq("status", "pending")
    .single();

  if (fetchError || !withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found or not pending" }, { status: 404 });
  }

  // Mark as failed
  const { error: updateError } = await adminSupabase
    .from("withdrawals")
    .update({ status: "failed" })
    .eq("id", withdrawalId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to reject withdrawal" }, { status: 500 });
  }

  // Refund coins using increment_coins RPC (avoids race conditions)
  const { error: refundError } = await adminSupabase.rpc("increment_coins", {
    uid: withdrawal.user_id,
    amount: withdrawal.coins,
  });

  if (refundError) {
    // Fallback: direct update
    const { data: userData } = await adminSupabase
      .from("users")
      .select("coins_balance")
      .eq("id", withdrawal.user_id)
      .single();

    await adminSupabase
      .from("users")
      .update({ coins_balance: (userData?.coins_balance ?? 0) + withdrawal.coins })
      .eq("id", withdrawal.user_id);
  }

  return NextResponse.json({ success: true });
}
