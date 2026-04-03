import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIPInfo, getRealIP } from "@/lib/fraud-check";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: userState } = await admin
      .from("users")
      .select("fraud_status, vpn_detected_count, mismatch_count")
      .eq("id", user.id)
      .single();

    const hasExistingFraudHits =
      (userState?.vpn_detected_count || 0) > 0 ||
      (userState?.mismatch_count || 0) > 0;

    if (userState?.fraud_status === "cashout_blocked" || hasExistingFraudHits) {
      if (userState?.fraud_status !== "cashout_blocked") {
        await admin
          .from("users")
          .update({ fraud_status: "cashout_blocked" })
          .eq("id", user.id);
      }
      return NextResponse.json({ success: true, skipped: true });
    }

    const ip = getRealIP(request);
    const ipInfo = await getIPInfo(ip);

    // Keep last seen country updated even for non-VPN traffic.
    await admin
      .from("users")
      .update({ last_seen_country: ipInfo.country })
      .eq("id", user.id);

    if (!(ipInfo.isVPN || ipInfo.isProxy || ipInfo.isTor)) {
      return NextResponse.json({ success: true, vpnDetected: false });
    }

    const { data: current } = await admin
      .from("users")
      .select("vpn_detected_count, fraud_flags")
      .eq("id", user.id)
      .single();

    const newCount = (current?.vpn_detected_count || 0) + 1;
    const flags = Array.isArray(current?.fraud_flags) ? [...current.fraud_flags] : [];

    flags.push({
      type: "vpn_detected",
      country: ipInfo.country,
      ip,
      timestamp: new Date().toISOString(),
      event: "cashout_page_view",
    });

    await admin
      .from("users")
      .update({
        vpn_detected_count: newCount,
        fraud_status: "cashout_blocked",
        fraud_flags: flags,
      })
      .eq("id", user.id);

    await admin.from("fraud_log").insert({
      user_id: user.id,
      event_type: "vpn_detected",
      detected_country: ipInfo.country,
      ip_address: ip,
      vpn_data: {
        isVPN: ipInfo.isVPN,
        isProxy: ipInfo.isProxy,
        isTor: ipInfo.isTor,
      },
      action_taken: "cashout_blocked",
    });

    const { data: existingNotif } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "cashout_blocked")
      .eq("is_dismissed", false)
      .limit(1);

    if (!existingNotif || existingNotif.length === 0) {
      await admin.from("notifications").insert({
        user_id: user.id,
        title: "Cashouts Paused",
        message:
          "Hey! \uD83D\uDC4B We have noticed some unusual activity in your account. As a result, we've paused cashouts for now. If this doesn't seem right, please contact support so we can help clear it up.",
        type: "cashout_blocked",
        read: false,
        is_dismissed: false,
      });
    }

    return NextResponse.json({ success: true, vpnDetected: true });
  } catch (error) {
    console.error("[cashout-page-view-fraud-check] error:", error);
    // Silent failure by design.
    return NextResponse.json({ success: true, vpnDetected: false });
  }
}
