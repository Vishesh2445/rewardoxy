import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationIds } = (await request.json()) as {
    notificationIds?: string[];
  };

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return NextResponse.json({ error: "No notification IDs provided" }, { status: 400 });
  }

  // Mark targeted notifications as read
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .in("id", notificationIds);

  // For broadcast notifications, insert into notification_reads (ignore conflicts)
  const broadcastReads = notificationIds.map((nid) => ({
    notification_id: nid,
    user_id: user.id,
  }));

  await supabase
    .from("notification_reads")
    .upsert(broadcastReads, { onConflict: "notification_id,user_id", ignoreDuplicates: true });

  return NextResponse.json({ success: true });
}
