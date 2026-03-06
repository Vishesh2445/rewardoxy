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

  const [completionsRes, withdrawalsRes] = await Promise.all([
    adminSupabase
      .from("completions")
      .select("id, offer_name, coins, status, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(20),
    adminSupabase
      .from("withdrawals")
      .select("id, coins, amount_usd, network, status, requested_at")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    completions: completionsRes.data ?? [],
    withdrawals: withdrawalsRes.data ?? [],
  });
}
