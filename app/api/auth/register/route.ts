import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

const INSERT_ATTEMPTS = 3;
const INSERT_RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= INSERT_ATTEMPTS; attempt++) {
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(
      user_id
    );

    if (authError || !authData.user) {
      lastError = authError?.message ?? "Auth user not found";
    } else {
      const { error } = await admin.from("users").insert({
        id: user_id,
        email,
        referral_code,
        referred_by: referred_by_id,
      });

      if (!error) {
        return NextResponse.json({ success: true });
      }

      lastError = error.message;
    }

    if (attempt < INSERT_ATTEMPTS) {
      await sleep(INSERT_RETRY_DELAY_MS);
    }
  }

  return NextResponse.json(
    { error: lastError ?? "Failed to create user profile" },
    { status: 500 }
  );
}
