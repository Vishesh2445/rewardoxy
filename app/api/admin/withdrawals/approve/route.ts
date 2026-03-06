import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { withdrawalId, txHash } = await request.json();

  if (!withdrawalId || !txHash || typeof txHash !== "string" || txHash.trim().length < 5) {
    return NextResponse.json({ error: "Invalid input. TX hash must be at least 5 characters." }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("withdrawals")
    .update({ status: "paid", tx_hash: txHash.trim() })
    .eq("id", withdrawalId)
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: "Failed to approve withdrawal" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
