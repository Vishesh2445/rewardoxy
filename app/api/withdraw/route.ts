import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_NETWORKS = ["TRC-20", "BEP-20", "SOL"] as const;
const MIN_COINS = 2000;
const COINS_PER_USD = 1000;

async function sendTelegramNotification(details: {
  userId: string;
  email: string;
  coins: number;
  amount_usd: number;
  network: string;
  address: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "💸 *New Withdrawal Request*",
    "",
    `*User:* ${details.email}`,
    `*User ID:* \`${details.userId}\``,
    `*Coins:* ${details.coins.toLocaleString()}`,
    `*Amount:* $${details.amount_usd.toFixed(2)}`,
    `*Network:* ${details.network}`,
    `*Address:* \`${details.address}\``,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch {
    // Telegram notification is best-effort; don't block the withdrawal
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { network } = body as { network?: string };

  if (!network || !VALID_NETWORKS.includes(network as (typeof VALID_NETWORKS)[number])) {
    return NextResponse.json(
      { error: "Invalid network. Choose TRC-20, BEP-20 or SOL" },
      { status: 400 }
    );
  }

  // Get current balance and saved crypto address
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("coins_balance, crypto_address")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  const { coins_balance: coins, crypto_address } = userData;

  if (!crypto_address || typeof crypto_address !== "string" || crypto_address.trim().length < 10) {
    return NextResponse.json(
      { error: "Save a crypto address on your profile before withdrawing" },
      { status: 400 }
    );
  }

  if (coins < MIN_COINS) {
    return NextResponse.json(
      { error: `Minimum withdrawal is ${MIN_COINS} coins` },
      { status: 400 }
    );
  }

  const amount_usd = coins / COINS_PER_USD;

  // Deduct coins (gte guard prevents race conditions)
  const { error: deductError } = await supabase
    .from("users")
    .update({ coins_balance: 0 })
    .eq("id", user.id)
    .gte("coins_balance", coins);

  if (deductError) {
    return NextResponse.json({ error: "Failed to deduct balance" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    coins,
    amount_usd,
    network: network.trim(),
    crypto_address: crypto_address.trim(),
    status: "pending",
  });

  if (insertError) {
    // Attempt to restore coins on insert failure
    await supabase
      .from("users")
      .update({ coins_balance: coins })
      .eq("id", user.id);

    return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 });
  }

  // Best-effort Telegram notification
  sendTelegramNotification({
    userId: user.id,
    email: user.email ?? "unknown",
    coins,
    amount_usd,
    network: network.trim(),
    address: crypto_address.trim(),
  });

  return NextResponse.json({ success: true, amount_usd, coins });
}
