"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const FALLBACK = 2000;

export async function getMinWithdrawalCoins(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("app_settings")
      .select("setting_value")
      .eq("setting_key", "min_withdrawal_coins")
      .single();

    if (data?.setting_value) {
      const val = parseInt(data.setting_value, 10);
      if (!isNaN(val) && val > 0) return val;
    }
  } catch {}
  return FALLBACK;
}
