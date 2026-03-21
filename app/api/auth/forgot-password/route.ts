import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function sendPasswordResetEmail(email: string, resetToken: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rewardoxy.app";
  const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}`;
  
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
  <title>Reset your Rewardoxy password</title>
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
          <h2 style="margin: 0 0 20px 0; font-size: 22px;">Reset your password</h2>
          <p style="color: #9ca3af; margin: 0 0 24px 0; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #01D676 0%, #00B35D 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                  Reset Password
                </a>
              </td>
            </tr>
          </table>
          <p style="color: #6b7280; margin: 24px 0 0 0; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #6b7280; margin: 16px 0 0 0; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2024 Rewardoxy. All rights reserved.
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
      subject: "Reset your Rewardoxy password",
      htmlContent: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Brevo API error:", errorData);
    throw new Error("Failed to send password reset email");
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await admin.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error listing users:", authError);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }

    const user = authUser.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal whether the email exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    // Delete any existing reset tokens for this user
    await admin
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", user.id);

    // Create new reset token
    const { data: tokenData, error: tokenError } = await admin
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
      })
      .select("token")
      .single();

    if (tokenError) {
      console.error("Error creating reset token:", tokenError);
      return NextResponse.json(
        { error: "Failed to create reset token" },
        { status: 500 }
      );
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, tokenData.token);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send password reset email" },
        { status: 500 }
      );
    }

    // Log the password reset request for admin panel
    await admin.from("notifications").insert({
      user_id: user.id,
      title: "Password Reset Requested",
      message: "A password reset was requested for your account. If you didn't request this, please contact support.",
      read: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: "If an account exists with this email, you will receive a password reset link." 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
