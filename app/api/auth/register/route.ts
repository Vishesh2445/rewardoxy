import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";

const INSERT_ATTEMPTS = 3;
const INSERT_RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

// Helper function to get country from IP
async function getCountryFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Get client IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "";

    // Skip localhost
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
      return "US"; // Default for localhost
    }

    // Use free IP geolocation API
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`, {
      headers: { "Accept": "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        return data.countryCode;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to get country from IP:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, email, referred_by, accepted_terms, is_google_oauth } = body as {
    user_id: string;
    email: string;
    referred_by?: string;
    accepted_terms?: boolean;
    is_google_oauth?: boolean;
  };

  if (!user_id || !email) {
    return NextResponse.json(
      { error: "user_id and email are required" },
      { status: 400 }
    );
  }

  const referral_code = randomBytes(4).toString("hex"); // 8-char alphanumeric

  const admin = createAdminClient();

  // Get country from IP
  const country = await getCountryFromRequest(request);

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
        email_verified: is_google_oauth ?? false,
        accepted_terms: accepted_terms ?? false,
        accepted_at: accepted_terms ? new Date().toISOString() : null,
        country: country,
      });

      if (!error) {
        // Create referral record if user was referred
        if (referred_by_id) {
          await admin.from("referrals").insert({
            referrer_uid: referred_by_id,
            referee_uid: user_id,
            lifetime_coins_earned: 0,
          });
        }
        // Create email verification token for non-Google users
        if (!is_google_oauth) {
          // Create token
          const { data: tokenData, error: tokenError } = await admin
            .from("email_verification_tokens")
            .insert({
              user_id: user_id,
            })
            .select("token")
            .single();

          if (!tokenError && tokenData) {
            try {
              await sendVerificationEmail(email, tokenData.token);
            } catch (emailError) {
              console.error("Failed to send verification email:", emailError);
            }
          }

          // Add notification to verify email
          await admin.from("notifications").insert({
            user_id: user_id,
            title: "Verify your email",
            message: "Please verify your email to start earning! Verified users earn 5% referral commission on their referrals' earnings.",
            read: false,
          });
        }
        
        return NextResponse.json({ success: true, needsVerification: !is_google_oauth });
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
