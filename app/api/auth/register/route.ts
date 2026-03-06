import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, email, referred_by } = body as {
    user_id: string;
    email: string;
    referred_by?: string;
  };

  if (!user_id || !email) {
    return NextResponse.json(
      { error: "user_id and email are required" },
      { status: 400 }
    );
  }

  const referral_code = randomBytes(4).toString("hex"); // 8-char alphanumeric

  const admin = createAdminClient();

  // Validate referred_by: must be a real user's referral_code
  let referred_by_id: string | null = null;
  if (referred_by) {
    const { data: referrer } = await admin
      .from("users")
      .select("id")
      .eq("referral_code", referred_by)
      .single();

    if (referrer) {
      referred_by_id = referrer.id;
    }
  }

  const { error } = await admin.from("users").insert({
    id: user_id,
    email,
    referral_code,
    referred_by: referred_by_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
