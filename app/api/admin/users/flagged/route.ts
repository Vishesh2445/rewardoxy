import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await adminSupabase
    .from("users")
    .select(
      "id, email, display_name, signup_country, last_seen_country, fraud_status, vpn_detected_count, mismatch_count, created_at",
      { count: "exact" }
    )
    .neq("fraud_status", "clean")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch flagged users" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0 });
}
