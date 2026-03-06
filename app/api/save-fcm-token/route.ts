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

  const body = await request.json();
  const { token } = body as { token?: string };

  if (!token || typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "FCM token is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("users")
    .update({ fcm_token: token.trim() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to save FCM token" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
