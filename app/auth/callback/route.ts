import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { getIPInfo, getRealIP } from "@/lib/fraud-check";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const ref = searchParams.get("ref");

  // Check for terms accepted cookie from Google OAuth signup
  const cookies = request.headers.get("cookie") || "";
  const termsAccepted = cookies.includes("oauth_terms_accepted=true");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If this is a new OAuth user, insert into public.users
      if (user) {
        const admin = createAdminClient();
        const { data: existing } = await admin
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          // VPN/Proxy/Tor check for new OAuth users (only if VPN detection is enabled)
          const clientIp = getRealIP(request);
          
          // Check if VPN detection is enabled in admin settings
          const { data: vpnSetting } = await admin
            .from("app_settings")
            .select("setting_value")
            .eq("setting_key", "vpn_detection_enabled")
            .single();
          
          const vpnDetectionEnabled = vpnSetting?.setting_value === "true" || vpnSetting?.setting_value === true;
          
          // Only call VPN API if detection is enabled (saves API calls and improves performance)
          const ipInfo = await getIPInfo(clientIp, vpnDetectionEnabled);

          if (vpnDetectionEnabled && (ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor)) {
            // Block: sign out and redirect with error
            await supabase.auth.signOut();
            try {
              await admin.auth.admin.deleteUser(user.id);
            } catch (e) {
              console.error("Failed to cleanup auth user after VPN block:", e);
            }
            return NextResponse.redirect(
              `${origin}/auth/signup?error=${encodeURIComponent("Please turn off your VPN or proxy to create an account on Rewardoxy.")}`
            );
          }

          let referred_by_id: string | null = null;
          if (ref) {
            const { data: referrer } = await admin
              .from("users")
              .select("id")
              .eq("referral_code", ref)
              .single();
            if (referrer) {
              referred_by_id = referrer.id;
            }
          }

          await admin.from("users").insert({
            id: user.id,
            email: user.email,
            referral_code: randomBytes(4).toString("hex"),
            referred_by: referred_by_id,
            email_verified: true,
            accepted_terms: termsAccepted,
            accepted_at: termsAccepted ? new Date().toISOString() : null,
            country: ipInfo.country || null,
            signup_country: ipInfo.country || null,
            signup_ip: clientIp,
          });

          // Create referral record if user was referred
          if (referred_by_id) {
            await admin.from("referrals").insert({
              referrer_uid: referred_by_id,
              referee_uid: user.id,
              lifetime_coins_earned: 0,
            });
          }

          // Add welcome notification for Google OAuth users
          await admin.from("notifications").insert({
            user_id: user.id,
            title: "Welcome to Rewardoxy!",
            message: "Your Google account is connected. Start earning by completing offers!",
            read: false,
          });
        }

        // Update login streak for returning OAuth users
        await supabase.rpc("update_streak");
      }

      // Create response and clear cookie if terms were accepted
      const response = NextResponse.redirect(`${origin}/profile`);
      if (termsAccepted) {
        response.headers.append("Set-Cookie", "oauth_terms_accepted=; path=/; max-age=0");
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
