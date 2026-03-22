import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Streak-based bonus: day 1 = 10, day 2 = 20, ..., day 7+ = 100
const STREAK_REWARDS = [0, 10, 20, 30, 40, 50, 75, 100];

function getReward(streakDay: number): number {
  return STREAK_REWARDS[Math.min(streakDay, 7)];
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already claimed today (UTC)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { data: existingClaim } = await supabase
    .from("daily_bonus_claims")
    .select("id")
    .eq("user_id", user.id)
    .gte("claimed_at", todayStart.toISOString())
    .limit(1)
    .maybeSingle();

  if (existingClaim) {
    return NextResponse.json({ error: "Already claimed today" }, { status: 400 });
  }

  // Check if user earned at least $1 today (from ALL sources)
  const { data: todayCompletions } = await supabase
    .from("completions")
    .select("payout_decimal")
    .eq("player_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayEarnings = todayCompletions?.reduce(
    (sum, c) => sum + (c.payout_decimal || 0),
    0
  ) || 0;

  if (todayEarnings < 1) {
    return NextResponse.json(
      { error: "Earn at least $1 today to claim bonus" },
      { status: 400 }
    );
  }

  // Get last claim to check streak
  const { data: lastClaim } = await supabase
    .from("daily_bonus_claims")
    .select("streak_day, claimed_at")
    .eq("user_id", user.id)
    .order("claimed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let streakDay = 1;

  if (lastClaim) {
    const lastDate = new Date(lastClaim.claimed_at);
    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    // If claimed yesterday, continue streak
    if (lastDate >= yesterday) {
      streakDay = Math.min(lastClaim.streak_day + 1, 7);
    }
    // Otherwise streak resets to 1
  }

  const reward = getReward(streakDay);

  // Insert claim
  const { error: insertError } = await supabase
    .from("daily_bonus_claims")
    .insert({
      user_id: user.id,
      coins_awarded: reward,
      streak_day: streakDay,
    });

  if (insertError) {
    return NextResponse.json({ error: "Failed to claim bonus" }, { status: 500 });
  }

  // Credit coins
  const { error: updateError } = await supabase.rpc("increment_coins", {
    uid: user.id,
    amount: reward,
  });

  if (updateError) {
    // Fallback: direct update
    const { data: current } = await supabase
      .from("users")
      .select("coins_balance")
      .eq("id", user.id)
      .single();

    await supabase
      .from("users")
      .update({
        coins_balance: (current?.coins_balance ?? 0) + reward,
        streak_count: streakDay,
      })
      .eq("id", user.id);
  } else {
    // Update streak count
    await supabase
      .from("users")
      .update({ streak_count: streakDay })
      .eq("id", user.id);
  }

  return NextResponse.json({ streakDay, reward });
}
