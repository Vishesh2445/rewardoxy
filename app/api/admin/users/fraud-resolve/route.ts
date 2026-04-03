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
    // 1. Reset fraud fields on user
    const { error: updateError } = await adminSupabase
      .from("users")
      .update({
        fraud_status: "clean",
        vpn_detected_count: 0,
        mismatch_count: 0,
        fraud_flags: [],
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to reset fraud status" }, { status: 500 });
    }

    // 2. Mark all cashout_blocked notifications as dismissed
    await adminSupabase
      .from("notifications")
      .update({ is_dismissed: true, read: true })
      .eq("user_id", userId)
      .eq("type", "cashout_blocked");

    // 3. Insert cashout_unlocked notification
    await adminSupabase.from("notifications").insert({
      user_id: userId,
      title: "Cashouts Unlocked 🎉",
      message:
        "Great news! Your cashouts have been unlocked. You can now withdraw your rewards normally.",
      type: "cashout_unlocked",
      read: false,
      is_dismissed: false,
    });

    // 4. Log the resolve action in fraud_log
    const { data: userData } = await adminSupabase
      .from("users")
      .select("signup_country, last_seen_country")
      .eq("id", userId)
      .single();

    await adminSupabase.from("fraud_log").insert({
      user_id: userId,
      event_type: "admin_resolve",
      signup_country: userData?.signup_country || null,
      detected_country: userData?.last_seen_country || null,
      ip_address: null,
      vpn_data: null,
      action_taken: "resolved_and_reset",
      resolved_by_admin_id: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[fraud-resolve] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
