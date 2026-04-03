import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { user, adminSupabase } = result;

  const body = await request.json();
  const { userId } = body as { userId?: string };

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Set fraud_status to suspended
    const { error: updateError } = await adminSupabase
      .from("users")
      .update({ fraud_status: "suspended" })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to suspend user" }, { status: 500 });
    }

    // Log in fraud_log
    const { data: userData } = await adminSupabase
      .from("users")
      .select("signup_country, last_seen_country")
      .eq("id", userId)
      .single();

    await adminSupabase.from("fraud_log").insert({
      user_id: userId,
      event_type: "admin_suspend",
      signup_country: userData?.signup_country || null,
      detected_country: userData?.last_seen_country || null,
      ip_address: null,
      vpn_data: null,
      action_taken: "suspended",
      resolved_by_admin_id: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[fraud-suspend] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
