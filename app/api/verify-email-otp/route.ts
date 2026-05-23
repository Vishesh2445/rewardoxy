import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { user_id, otp } = await request.json();
  if (!user_id || !otp) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("email_otps")
    .select("otp, expires_at")
    .eq("user_id", user_id)
    .single();

  if (error || !data) return NextResponse.json({ error: "No OTP found. Request a new one." }, { status: 400 });

  if (new Date(data.expires_at) < new Date()) {
    await admin.from("email_otps").delete().eq("user_id", user_id);
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }

  if (data.otp !== otp.trim()) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

  // Mark email as verified
  await admin.from("users").update({ email_verified: true }).eq("id", user_id);
  await admin.from("email_otps").delete().eq("user_id", user_id);

  return NextResponse.json({ success: true });
}
