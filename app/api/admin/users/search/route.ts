import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const source = searchParams.get("source") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminSupabase
    .from("users")
    .select("id, email, coins_balance, total_earned, role, is_banned, created_at, signup_country, last_seen_country, fraud_status, vpn_detected_count, mismatch_count, signup_source", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (source === "web" || source === "app") {
    query = query.eq("signup_source", source);
  }

  if (q.trim()) {
    const searchTerm = q.trim();
    // Check if it looks like a UUID (user ID search)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
    
    if (isUuid) {
      // Exact match on ID
      query = query.eq("id", searchTerm.toLowerCase());
    } else {
      // Partial match on email
      query = query.ilike("email", `%${searchTerm}%`);
    }
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0 });
}
