import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = adminSupabase
    .from("users")
    .select("id, email, coins_balance, total_earned, role, is_banned, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (q.trim()) {
    query = query.ilike("email", `%${q.trim()}%`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0 });
}
