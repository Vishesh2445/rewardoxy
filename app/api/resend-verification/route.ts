import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function sendVerificationEmail(email: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rewardoxy.app";
  const verifyUrl = `${siteUrl}/api/verify?token=${token}`;
  
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || "noreply@rewardoxy.app";
  const fromName = process.env.BREVO_FROM_NAME || "Rewardoxy";

  if (!brevoApiKey) {
    throw new Error("BREVO_API_KEY not configured");
  }

  // Rewardoxy logo as embedded SVG
  const logoSvg = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#gradient)"/>
    <path d="M20 8L23.48 16.35L32 17.45L25.5 23.55L27.68 32L20 27.6L12.32 32L14.5 23.55L8 17.45L16.52 16.35L20 8Z" fill="white"/>
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stop-color="#01D676"/><stop offset="1" stop-color="#007e45"/>
      </linearGradient>
    </defs>
  </svg>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Rewardoxy account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17; color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <tr>
        <td align="center">
          ${logoSvg}
          <h1 style="color: #ffffff; margin: 16px 0 20px 0; font-size: 24px; font-weight: 700;">
            <span style="color: #01D676;">Reward</span>oxy
          </h1>
        </td>
      </tr>
      <tr>
        <td style="background-color: #111827; border-radius: 12px; padding: 40px;">
          <h2 style="margin: 0 0 20px 0; font-size: 22px;">Verify your email address</h2>
          <p style="color: #9ca3af; margin: 0 0 24px 0; line-height: 1.6;">
            Welcome to Rewardoxy! To get started, please verify your email address by clicking the button below.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #01D676 0%, #00B35D 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                  Verify Email
                </a>
              </td>
            </tr>
          </table>
          <p style="color: #6b7280; margin: 24px 0 0 0; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Verify your Rewardoxy account",
      htmlContent: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Brevo API error:", errorData);
    throw new Error("Failed to send verification email");
  }

  return true;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if user's email is already verified
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("email_verified, email")
    .eq("id", user.id)
    .single();

  if (userError) {
    console.error("Error fetching user data:", userError);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }

  if (userData?.email_verified) {
    return NextResponse.json(
      { error: "Email is already verified" },
      { status: 400 }
    );
  }

  // Delete old tokens for this user
  const admin = createAdminClient();
  await admin
    .from("email_verification_tokens")
    .delete()
    .eq("user_id", user.id);

  // Create new token
  const { data: newToken, error: tokenError } = await admin
    .from("email_verification_tokens")
    .insert({
      user_id: user.id,
    })
    .select("token")
    .single();

  if (tokenError || !newToken) {
    console.error("Error creating token:", tokenError);
    return NextResponse.json(
      { error: "Failed to create verification token" },
      { status: 500 }
    );
  }

  // Send verification email
  try {
    await sendVerificationEmail(userData.email, newToken.token);
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}