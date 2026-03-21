import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // First get the user's auth UID to match with player_id in completions
  const { data: userData } = await adminSupabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!userData) {
    return NextResponse.json({ completions: [], withdrawals: [] });
  }

  const [completionsRes, withdrawalsRes] = await Promise.all([
    adminSupabase
      .from("completions")
      .select("id, program_id, coins_awarded, payout_decimal, created_at")
      .eq("player_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("withdrawals")
      .select("id, coins, amount_usd, network, status, requested_at")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(20),
  ]);

  // Transform completions data to match expected format
  const completions = (completionsRes.data ?? []).map(c => ({
    id: c.id,
    offer_name: c.program_id || 'Unknown Offer',
    coins: c.coins_awarded || 0,
    status: 'completed',
    completed_at: c.created_at,
  }));

  return NextResponse.json({
    completions,
    withdrawals: withdrawalsRes.data ?? [],
  });
}
