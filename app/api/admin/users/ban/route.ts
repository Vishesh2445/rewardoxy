import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { userId, banned } = await request.json();

  if (!userId || typeof banned !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await adminSupabase
    .from("users")
    .update({ is_banned: banned })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
