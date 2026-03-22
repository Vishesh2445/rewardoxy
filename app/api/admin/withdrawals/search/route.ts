import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const status = searchParams.get("status") ?? "";
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminSupabase
    .from("withdrawals")
    .select(
      "id, user_id, coins, amount_usd, crypto_address, status, tx_hash, requested_at",
      { count: "exact" }
    )
    .order("requested_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }

  const withdrawals = data ?? [];

  // Fetch user emails for all unique user_ids
  const userIds = [...new Set(withdrawals.map((w) => w.user_id))];
  const emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await adminSupabase
      .from("users")
      .select("id, email")
      .in("id", userIds);

    for (const u of users ?? []) {
      emailMap[u.id] = u.email;
    }
  }

  const enriched = withdrawals.map((w) => ({
    ...w,
    user_email: emailMap[w.user_id] ?? "Unknown",
  }));

  return NextResponse.json({ withdrawals: enriched, total: count ?? 0 });
}
