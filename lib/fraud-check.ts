import { createAdminClient } from "@/lib/supabase/admin";

interface IPInfo {
  country: string | null;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
}

/**
 * Get IP info from vpnapi.io with fallback to ipapi.co and ipinfo.io
 */
export async function getIPInfo(ip: string): Promise<IPInfo> {
  const apiKey = process.env.VPNAPI_KEY;

  // Skip for localhost
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return { country: "US", isVPN: false, isProxy: false, isTor: false };
  }

  // Primary: vpnapi.io
  if (apiKey) {
    try {
      const res = await fetch(`https://vpnapi.io/api/${ip}?key=${apiKey}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          country: data?.location?.country_code || null,
          isVPN: data?.security?.vpn === true,
          isProxy: data?.security?.proxy === true,
          isTor: data?.security?.tor === true,
        };
      }
    } catch (err) {
      console.error("[fraud-check] vpnapi.io failed, falling back:", err);
    }
  }

  // Fallback 1: ipapi.co
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code) {
        return {
          country: data.country_code,
          isVPN: false,
          isProxy: false,
          isTor: false,
        };
      }
    }
  } catch (err) {
    console.error("[fraud-check] ipapi.co fallback failed:", err);
  }

  // Fallback 2: ipinfo.io (free tier)
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN || ""}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country) {
        return {
          country: data.country,
          isVPN: false,
          isProxy: false,
          isTor: false,
        };
      }
    }
  } catch (err) {
    console.error("[fraud-check] ipinfo.io fallback also failed:", err);
  }

  return { country: null, isVPN: false, isProxy: false, isTor: false };
}

/**
 * Extract real client IP from request headers
 */
export function getRealIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

/**
 * Process fraud check silently. Never blocks earnings.
 * Only updates fraud_status in the background.
 */
export async function processFraudCheck(
  userId: string,
  ip: string,
  eventType: "offer_completion" | "cashout"
): Promise<{ isFraud: boolean; reason: "vpn" | "mismatch" | null }> {
  try {
    const admin = createAdminClient();
    // Check user fraud state first so we can skip external VPN lookups for blocked users.
    const { data: userData } = await admin
      .from("users")
      .select("signup_country, fraud_status, vpn_detected_count, mismatch_count")
      .eq("id", userId)
      .single();

    if (!userData) {
      return { isFraud: false, reason: null };
    }

    const hasExistingFraudHits =
      (userData.vpn_detected_count || 0) > 0 ||
      (userData.mismatch_count || 0) > 0;

    if (userData.fraud_status === "cashout_blocked" || hasExistingFraudHits) {
      if (userData.fraud_status !== "cashout_blocked") {
        await admin
          .from("users")
          .update({ fraud_status: "cashout_blocked" })
          .eq("id", userId);
      }
      return { isFraud: true, reason: null };
    }

    const ipInfo = await getIPInfo(ip);

    const signupCountry = userData.signup_country;
    const detectedCountry = ipInfo.country;

    // Always update last_seen_country
    await admin
      .from("users")
      .update({ last_seen_country: detectedCountry })
      .eq("id", userId);

    // Check VPN/Proxy/Tor
    if (ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor) {
      // Increment vpn_detected_count and set fraud_status silently
      await admin.rpc("increment_field", undefined); // we'll do it manually
      const { data: current } = await admin
        .from("users")
        .select("vpn_detected_count, fraud_flags")
        .eq("id", userId)
        .single();

      const newCount = (current?.vpn_detected_count || 0) + 1;
      const flags = Array.isArray(current?.fraud_flags) ? current.fraud_flags : [];
      flags.push({
        type: "vpn_detected",
        country: detectedCountry,
        ip,
        timestamp: new Date().toISOString(),
        event: eventType,
      });

      await admin
        .from("users")
        .update({
          vpn_detected_count: newCount,
          fraud_status: "cashout_blocked",
          fraud_flags: flags,
        })
        .eq("id", userId);

      // Insert fraud_log
      await admin.from("fraud_log").insert({
        user_id: userId,
        event_type: "vpn_detected",
        signup_country: signupCountry,
        detected_country: detectedCountry,
        ip_address: ip,
        vpn_data: {
          isVPN: ipInfo.isVPN,
          isProxy: ipInfo.isProxy,
          isTor: ipInfo.isTor,
        },
        action_taken: "cashout_blocked",
      });

      return { isFraud: true, reason: "vpn" };
    }

    // Check country mismatch
    if (
      signupCountry &&
      detectedCountry &&
      signupCountry !== detectedCountry
    ) {
      const { data: current } = await admin
        .from("users")
        .select("mismatch_count, fraud_flags")
        .eq("id", userId)
        .single();

      const newCount = (current?.mismatch_count || 0) + 1;
      const flags = Array.isArray(current?.fraud_flags) ? current.fraud_flags : [];
      flags.push({
        type: "country_mismatch",
        signup: signupCountry,
        detected: detectedCountry,
        ip,
        timestamp: new Date().toISOString(),
        event: eventType,
      });

      await admin
        .from("users")
        .update({
          mismatch_count: newCount,
          fraud_status: "cashout_blocked",
          fraud_flags: flags,
        })
        .eq("id", userId);

      // Insert fraud_log
      await admin.from("fraud_log").insert({
        user_id: userId,
        event_type: "country_mismatch",
        signup_country: signupCountry,
        detected_country: detectedCountry,
        ip_address: ip,
        vpn_data: {
          isVPN: ipInfo.isVPN,
          isProxy: ipInfo.isProxy,
          isTor: ipInfo.isTor,
        },
        action_taken: "cashout_blocked",
      });

      return { isFraud: true, reason: "mismatch" };
    }

    return { isFraud: false, reason: null };
  } catch (err) {
    console.error("[fraud-check] processFraudCheck error:", err);
    // Never block on error - fail open
    return { isFraud: false, reason: null };
  }
}
