import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch targeted notifications for this user
  const { data: targeted } = await supabase
    .from("notifications")
    .select("id, title, message, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  // Fetch broadcast notifications
  const { data: broadcasts } = await supabase
    .from("notifications")
    .select("id, title, message, created_at")
    .eq("is_broadcast", true)
    .order("created_at", { ascending: false })
    .limit(30);

  // Fetch which broadcasts this user has read
  const broadcastIds = (broadcasts ?? []).map((b) => b.id);
  let readBroadcastIds: Set<string> = new Set();

  if (broadcastIds.length > 0) {
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id)
      .in("notification_id", broadcastIds);

    readBroadcastIds = new Set((reads ?? []).map((r) => r.notification_id));
  }

  // Merge and sort
  const all = [
    ...(targeted ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      created_at: n.created_at,
      is_broadcast: false,
    })),
    ...(broadcasts ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: readBroadcastIds.has(n.id),
      created_at: n.created_at,
      is_broadcast: true,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);

  const unreadCount = all.filter((n) => !n.read).length;

  return NextResponse.json({ notifications: all, unreadCount });
}
