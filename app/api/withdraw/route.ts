import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MIN_COINS = 2000;
const COINS_PER_USD = 1000;

async function sendTelegramNotification(details: {
  userId: string;
  email: string;
  coins: number;
  amount_usd: number;
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
    `*Address (LTC):* \`${details.address}\``,
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
  const { amount_coins, address } = body as { amount_coins?: number; address?: string };

  if (!address || typeof address !== "string" || address.trim().length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid LTC wallet address" },
      { status: 400 }
    );
  }

  if (!amount_coins || typeof amount_coins !== "number" || amount_coins < MIN_COINS) {
    return NextResponse.json(
      { error: `Minimum withdrawal is ${MIN_COINS} coins` },
      { status: 400 }
    );
  }

  // Get current balance
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("coins_balance, is_banned")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  if (userData.is_banned) {
    return NextResponse.json({ error: "Your account has been suspended" }, { status: 403 });
  }

  const { coins_balance: coins } = userData;

  if (coins < amount_coins) {
    return NextResponse.json(
      { error: "Insufficient coin balance" },
      { status: 400 }
    );
  }

  const amount_usd = amount_coins / COINS_PER_USD;

  // Deduct requested coins (gte guard prevents race conditions)
  const { error: deductError } = await supabase
    .from("users")
    .update({ coins_balance: coins - amount_coins })
    .eq("id", user.id)
    .gte("coins_balance", amount_coins);

  if (deductError) {
    return NextResponse.json({ error: "Failed to deduct balance" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("withdrawals").insert({
    user_id: user.id,
    coins: amount_coins,
    amount_usd,
    crypto_address: address.trim(),
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

  // Update user's crypto address for future convenience if they want to
  await supabase
    .from("users")
    .update({ crypto_address: address.trim() })
    .eq("id", user.id);

  // Best-effort Telegram notification
  sendTelegramNotification({
    userId: user.id,
    email: user.email ?? "unknown",
    coins: amount_coins,
    amount_usd,
    address: address.trim(),
  });

  return NextResponse.json({ success: true, amount_usd, coins: amount_coins });
}
