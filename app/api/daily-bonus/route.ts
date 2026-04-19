import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Daily Bonus System
 * 
 * Requirements:
 * 1. User must earn at least 1000 coins in one day (from any offerwall or mixed)
 * 2. Streak continues only if user claims bonus on consecutive days
 * 3. Streak resets to day 1 after completing day 7 or missing any day
 * 4. Can only claim once per day (UTC timezone)
 * 
 * Rewards by streak day:
 * - Day 1: 10 coins
 * - Day 2: 20 coins
 * - Day 3: 30 coins
 * - Day 4: 40 coins
 * - Day 5: 50 coins
 * - Day 6: 75 coins
 * - Day 7: 100 coins
 * - Day 8+: Resets to Day 1 (10 coins)
 */

// Streak-based bonus: day 1 = 10, day 2 = 20, ..., day 7 = 100
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

  // Check if user earned at least 1000 coins ($1) today (from ALL sources)
  const { data: todayCompletions } = await supabase
    .from("completions")
    .select("coins_awarded")
    .eq("player_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // Check CPX earnings today
  const { data: todayCpx } = await supabase
    .from("cpx_transactions")
    .select("amount_local, status")
    .eq("userid", user.id)
    .gte("created_at", todayStart.toISOString());

  // Check Notik earnings today
  const { data: todayNotik } = await supabase
    .from("notik_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const todayCoinsFromCompletions = todayCompletions?.reduce(
    (sum, c) => sum + (c.coins_awarded || 0),
    0
  ) || 0;

  const todayCoinsFromCpx = todayCpx?.reduce((sum, c) => {
    const amount = Math.round(Number(c.amount_local || 0));
    return sum + (c.status === 2 ? -amount : amount); // Subtract reversals
  }, 0) || 0;

  const todayCoinsFromNotik = todayNotik?.reduce((sum, n) => {
    const amount = Math.round(Number(n.amount || 0));
    return sum + amount; // Notik amount can be negative for chargebacks
  }, 0) || 0;

  const todayCoinsEarned = todayCoinsFromCompletions + todayCoinsFromCpx + todayCoinsFromNotik;

  if (todayCoinsEarned < 1000) {
    return NextResponse.json(
      { error: `Earn at least 1000 coins ($1) today to claim bonus. You have earned ${todayCoinsEarned} coins today.` },
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
    lastDate.setUTCHours(0, 0, 0, 0);
    
    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    // If claimed yesterday, continue streak
    if (lastDate.getTime() === yesterday.getTime()) {
      streakDay = lastClaim.streak_day + 1;
      // After day 7, reset to day 1 (7-day cycle)
      if (streakDay > 7) {
        streakDay = 1;
      }
    }
    // Otherwise streak resets to 1 (missed a day or more)
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
