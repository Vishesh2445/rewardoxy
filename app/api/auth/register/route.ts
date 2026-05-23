import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { getIPInfo, getRealIP } from "@/lib/fraud-check";
import { verifyTurnstileToken } from "@/lib/turnstile";

const INSERT_ATTEMPTS = 3;
const INSERT_RETRY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendVerificationEmail(email: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.rewardoxy.app";
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
        <stop stop-color="#10B981"/><stop offset="1" stop-color="#059669"/>
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
            <span style="color: #10B981;">Reward</span>oxy
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
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px;">
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
    const errorText = await response.text();
    console.error("Brevo API error response:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    throw new Error(`Failed to send verification email: ${response.status} - ${errorData.message || errorText}`);
  }

  console.log("Brevo API response: Email sent successfully");
  return true;
}

// VPN/country check at signup using fraud-check utility

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, email, referred_by, accepted_terms, is_google_oauth, turnstile_token, source } = body as {
    user_id: string;
    email: string;
    referred_by?: string;
    accepted_terms?: boolean;
    is_google_oauth?: boolean;
    turnstile_token?: string;
    source?: string;
  };

  console.log("Registration attempt:", { user_id, email, referred_by, is_google_oauth });

  if (!user_id || !email) {
    console.error("Missing required fields:", { user_id, email });
    return NextResponse.json(
      { error: "user_id and email are required" },
      { status: 400 }
    );
  }

  // Verify Turnstile token
  if (!is_google_oauth && turnstile_token) {
    console.log("Verifying Turnstile token...");
    const isValidToken = await verifyTurnstileToken(turnstile_token);
    if (!isValidToken) {
      console.error("Turnstile verification failed");
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }
    console.log("Turnstile verification successful");
  }

  // VPN/Proxy/Tor check at signup (only if VPN detection is enabled)
  const clientIp = getRealIP(request);
  console.log("Client IP:", clientIp);
  
  const admin = createAdminClient();
  
  // Check if VPN detection is enabled in admin settings
  const { data: vpnSetting } = await admin
    .from("app_settings")
    .select("setting_value")
    .eq("setting_key", "vpn_detection_enabled")
    .single();
  
  const vpnDetectionEnabled = vpnSetting?.setting_value === "true" || vpnSetting?.setting_value === true;
  console.log("VPN Detection Enabled:", vpnDetectionEnabled);
  
  // Only call VPN API if detection is enabled (saves API calls and improves performance)
  const ipInfo = await getIPInfo(clientIp, vpnDetectionEnabled);
  console.log("IP Info:", ipInfo);

  if (vpnDetectionEnabled && (ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor)) {
    console.error("VPN/Proxy/Tor detected, blocking registration");
    // Block account creation - delete the auth user that was just created
    try {
      await admin.auth.admin.deleteUser(user_id);
      console.log("Cleaned up auth user after VPN block");
    } catch (e) {
      console.error("Failed to cleanup auth user after VPN block:", e);
    }
    return NextResponse.json(
      { error: "Please turn off your VPN or proxy to create an account on Rewardoxy." },
      { status: 403 }
    );
  }

  const referral_code = randomBytes(4).toString("hex"); // 8-char alphanumeric
  console.log("Generated referral code:", referral_code);

  // Country from the VPN check we already did
  let country = ipInfo.country;

  // If country detection failed, try the fallback get-country API
  if (!country && clientIp !== "127.0.0.1") {
    try {
      const countryRes = await fetch(
        `https://${request.headers.get("host") || "rewardoxy.app"}/api/get-country`,
        {
          headers: {
            "x-forwarded-for": clientIp,
          },
        }
      );
      if (countryRes.ok) {
        const countryData = await countryRes.json();
        country = countryData.country || null;
        console.log("Country from fallback API:", country);
      }
    } catch (err) {
      console.error("Failed to get country from fallback API:", err);
    }
  }

  console.log("Final country:", country);

  // Validate referred_by: must be a real user's referral_code
  let referred_by_id: string | null = null;
  if (referred_by) {
    console.log("Checking referral code:", referred_by);
    const { data: referrer } = await admin
      .from("users")
      .select("id")
      .eq("referral_code", referred_by)
      .single();

    if (referrer) {
      referred_by_id = referrer.id;
      console.log("Valid referrer found:", referred_by_id);
    } else {
      console.log("Referral code not found:", referred_by);
    }
  }

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= INSERT_ATTEMPTS; attempt++) {
    console.log(`Registration attempt ${attempt}/${INSERT_ATTEMPTS}`);
    
    const { data: authData, error: authError } = await admin.auth.admin.getUserById(
      user_id
    );

    if (authError || !authData.user) {
      lastError = authError?.message ?? "Auth user not found";
      console.error(`Attempt ${attempt} - Auth user not found:`, lastError);
    } else {
      console.log(`Attempt ${attempt} - Auth user found, inserting into users table...`);
      
      const { error } = await admin.from("users").insert({
        id: user_id,
        email,
        referral_code,
        referred_by: referred_by_id,
        email_verified: is_google_oauth ?? false,
        accepted_terms: accepted_terms ?? false,
        accepted_at: accepted_terms ? new Date().toISOString() : null,
        country: country,
        signup_country: country,
        signup_ip: clientIp,
      });

      if (!error) {
        console.log("User profile created successfully");
        
        // Create referral record if user was referred
        if (referred_by_id) {
          console.log("Creating referral record...");
          await admin.from("referrals").insert({
            referrer_uid: referred_by_id,
            referee_uid: user_id,
            lifetime_coins_earned: 0,
          });
          console.log("Referral record created");
        }
        
        // Create email verification token for non-Google users (skip for app - app uses OTP)
        if (!is_google_oauth && source !== 'app') {
          // Create token
          const { data: tokenData, error: tokenError } = await admin
            .from("email_verification_tokens")
            .insert({
              user_id: user_id,
            })
            .select("token")
            .single();

          if (tokenError) {
            console.error("Failed to create verification token:", tokenError);
          } else if (tokenData) {
            try {
              console.log(`Attempting to send verification email to ${email}`);
              await sendVerificationEmail(email, tokenData.token);
              console.log(`Verification email sent successfully to ${email}`);
            } catch (emailError: any) {
              console.error("Failed to send verification email:", emailError);
              console.error("Email error details:", {
                message: emailError.message,
                stack: emailError.stack,
                email: email,
                token: tokenData.token
              });
              // Don't fail registration, but log the error
            }
          } else {
            console.error("No token data returned after insert");
          }

          // Add notification to verify email
          console.log("Adding verification notification...");
          await admin.from("notifications").insert({
            user_id: user_id,
            title: "Verify your email",
            message: "Please verify your email to start earning! Verified users earn 5% referral commission on their referrals' earnings.",
            read: false,
          });
          console.log("Verification notification added");
        }
        
        console.log("Registration completed successfully");
        return NextResponse.json({ success: true, needsVerification: !is_google_oauth });
      }

      lastError = error.message;
      console.error(`Attempt ${attempt} - Database insert error:`, error);
    }

    if (attempt < INSERT_ATTEMPTS) {
      console.log(`Waiting ${INSERT_RETRY_DELAY_MS}ms before retry...`);
      await sleep(INSERT_RETRY_DELAY_MS);
    }
  }

  console.error("All registration attempts failed. Last error:", lastError);
  return NextResponse.json(
    { error: lastError ?? "Failed to create user profile" },
    { status: 500 }
  );
}
