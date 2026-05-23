import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const admin = createAdminClient();

  const { data: userData, error } = await admin
    .from("users")
    .select("email, email_verified")
    .eq("id", user_id)
    .single();

  if (error || !userData) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (userData.email_verified) return NextResponse.json({ error: "Already verified" }, { status: 400 });

  // Generate 5-digit OTP
  const otp = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Store OTP (delete old ones first)
  await admin.from("email_otps").delete().eq("user_id", user_id);
  await admin.from("email_otps").insert({ user_id, otp, expires_at: expiresAt });

  // Send email via Brevo
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) return NextResponse.json({ error: "Email service not configured" }, { status: 500 });

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": brevoApiKey },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_FROM_NAME || "Rewardoxy", email: process.env.BREVO_FROM_EMAIL || "noreply@rewardoxy.app" },
      to: [{ email: userData.email }],
      subject: "Your Rewardoxy Verification Code",
      htmlContent: `
<body style="margin:0;padding:0;font-family:sans-serif;background:#0a0e17;color:#fff;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;margin:0 auto;padding:40px 20px;">
<tr><td align="center"><h1 style="color:#10B981;margin:0 0 8px;">Rewardoxy</h1></td></tr>
<tr><td style="background:#111827;border-radius:12px;padding:32px;text-align:center;">
<h2 style="margin:0 0 12px;">Your Verification Code</h2>
<p style="color:#9ca3af;margin:0 0 24px;">Enter this code in the app to verify your email:</p>
<div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#10B981;margin:0 0 24px;">${otp}</div>
<p style="color:#6b7280;font-size:13px;margin:0;">This code expires in 10 minutes.</p>
</td></tr>
</table></body>`,
    }),
  });

  if (!res.ok) return NextResponse.json({ error: "Failed to send email" }, { status: 500 });

  return NextResponse.json({ success: true });
}
