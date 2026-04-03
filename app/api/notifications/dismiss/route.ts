import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { notificationId } = body as { notificationId?: string };

  if (!notificationId) {
    return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Mark as dismissed and read (user can only dismiss their own notifications)
  const { error } = await admin
    .from("notifications")
    .update({ is_dismissed: true, read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to dismiss notification" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
