import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const result = await requireAdminApi();
  if ("error" in result) return result.error;
  const { adminSupabase } = result;

  const { title, message, isBroadcast, email } = await request.json();

  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  if (isBroadcast) {
    const { error } = await adminSupabase.from("notifications").insert({
      user_id: null,
      title: title.trim(),
      message: message.trim(),
      is_broadcast: true,
      read: false,
      admin_sent: true,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
    }
  } else {
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required for targeted notification" }, { status: 400 });
    }

    const { data: targetUser } = await adminSupabase
      .from("users")
      .select("id")
      .eq("email", email.trim())
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error } = await adminSupabase.from("notifications").insert({
      user_id: targetUser.id,
      title: title.trim(),
      message: message.trim(),
      is_broadcast: false,
      read: false,
      admin_sent: true,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
