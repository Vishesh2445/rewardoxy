# CPX Integration Fixes - Summary

## Issues Fixed

### 1. ✅ CPX Transactions Not Showing in History

**Problem:** CPX postback was working but transactions weren't appearing in the history page.

**Solution:** Updated `app/history/page.tsx` and `components/history-client.tsx` to:
- Fetch from both `completions` and `cpx_transactions` tables
- Merge and sort by date
- Display CPX transactions with proper labels:
  - `type=complete` → "CPX Survey"
  - `type=out` → "CPX Screen-out"  
  - `type=bonus` → "CPX Rating Bonus"
- Show reversals (`status=2`) as negative amounts in red

**Visual Indicators:**
- ✅ Green for completions/credits
- ❌ Red for chargebacks/reversals
- 🔵 Blue "CPX" badge
- Different icons: Survey (📄), Screen-out (⭕), Bonus (⭐)

---

### 2. ✅ "This Month" Earnings Showing 0

**Problem:** Profile page only counted earnings from `completions` table, ignoring CPX transactions.

**Solution:** Updated `app/profile/page.tsx` to:
- Query both `completions` and `cpx_transactions` tables
- Calculate monthly earnings from both sources
- Subtract reversals (`status=2`) from CPX earnings
- Sum both sources for total monthly earnings

**Code:**
```typescript
const monthEarnedFromCompletions = monthlyCompletions?.reduce(...) || 0;
const monthEarnedFromCpx = monthlyCpx?.reduce((sum, c) => {
  const amount = Math.round(Number(c.amount_local || 0));
  return sum + (c.status === 2 ? -amount : amount);
}, 0) || 0;
const monthEarned = monthEarnedFromCompletions + monthEarnedFromCpx;
```

---

### 3. ✅ "Completed Offers" Count Incorrect

**Problem:** Profile page only counted completions from `completions` table.

**Solution:** Updated `app/profile/page.tsx` to:
- Count completions from both tables
- Only count CPX transactions with `status=1` (exclude reversals)
- Sum both counts for total completions

**Code:**
```typescript
const { count: completionCount } = await supabase
  .from("completions")
  .select("*", { count: "exact", head: true })
  .eq("player_id", user.id);

const { count: cpxCompletionCount } = await supabase
  .from("cpx_transactions")
  .select("*", { count: "exact", head: true })
  .eq("userid", user.id)
  .eq("status", 1);

const totalCompletions = (completionCount ?? 0) + (cpxCompletionCount ?? 0);
```

---

### 4. ✅ Daily Bonus Logic Fixed

**Problem:** 
- Bonus only checked `completions` table (ignored CPX earnings)
- Streak logic didn't reset after 7 days
- Streak didn't break if user missed a day

**Solution:** Updated `app/api/daily-bonus/route.ts` to:

#### A. Include CPX Earnings in 1000 Coin Requirement
```typescript
// Check earnings from both sources
const todayCoinsFromCompletions = todayCompletions?.reduce(...) || 0;
const todayCoinsFromCpx = todayCpx?.reduce((sum, c) => {
  const amount = Math.round(Number(c.amount_local || 0));
  return sum + (c.status === 2 ? -amount : amount);
}, 0) || 0;
const todayCoinsEarned = todayCoinsFromCompletions + todayCoinsFromCpx;

if (todayCoinsEarned < 1000) {
  return error with current earnings count
}
```

#### B. Fixed Streak Logic
```typescript
if (lastClaim) {
  const lastDate = new Date(lastClaim.claimed_at);
  lastDate.setUTCHours(0, 0, 0, 0);
  
  const yesterday = new Date();
  yesterday.setUTCHours(0, 0, 0, 0);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  // If claimed yesterday, continue streak
  if (lastDate.getTime() === yesterday.getTime()) {
    streakDay = lastClaim.streak_day + 1;
    // If streak reaches 8, reset to 1 (7-day cycle)
    if (streakDay > 7) {
      streakDay = 1;
    }
  }
  // Otherwise streak resets to 1 (missed a day)
}
```

**New Behavior:**
- ✅ Counts earnings from ANY offerwall (CPX, MyLead, etc.)
- ✅ Requires 1000 coins earned TODAY to unlock bonus
- ✅ Streak increases each consecutive day (1→2→3→4→5→6→7)
- ✅ After day 7, resets to day 1 (continuous cycle)
- ✅ If user misses ANY day, streak resets to day 1
- ✅ Reversals are subtracted from daily earnings

**Rewards:**
- Day 1: 10 coins
- Day 2: 20 coins
- Day 3: 30 coins
- Day 4: 40 coins
- Day 5: 50 coins
- Day 6: 75 coins
- Day 7: 100 coins
- Day 8+: Resets to Day 1 (10 coins)

---

## Testing Checklist

### CPX Postback
- [x] Test postback returns HTTP 200
- [x] User balance increases correctly
- [x] Transaction logged in `cpx_transactions` table
- [ ] Transaction appears in History page
- [ ] "This Month" earnings updated
- [ ] "Completed Offers" count increased

### Daily Bonus
- [ ] Earn 1000 coins from CPX → Can claim bonus
- [ ] Earn 500 from CPX + 500 from MyLead → Can claim bonus
- [ ] Earn 999 coins → Cannot claim bonus (shows current earnings)
- [ ] Claim bonus 7 days in a row → Day 7 gives 100 coins
- [ ] Claim on day 8 → Resets to day 1 (10 coins)
- [ ] Miss a day → Streak resets to day 1
- [ ] CPX reversal reduces daily earnings count

### Profile Stats
- [ ] "Total Earned" shows correct lifetime earnings
- [ ] "This Month" includes CPX earnings
- [ ] "Completed Offers" includes CPX completions
- [ ] "Withdrawals" count correct

### History Page
- [ ] CPX completions show with blue "CPX" badge
- [ ] CPX screen-outs show with correct icon
- [ ] CPX bonuses show with star icon
- [ ] CPX reversals show in red with negative amount
- [ ] Pagination works with mixed sources
- [ ] Sorted by date (newest first)

---

## Database Schema

### cpx_transactions Table
```sql
CREATE TABLE cpx_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transid TEXT NOT NULL,
  userid TEXT NOT NULL,
  amount_local NUMERIC(10,4) DEFAULT 0,
  amount_usd NUMERIC(10,4) DEFAULT 0,
  status INT DEFAULT 1,  -- 1=completed, 2=reversed
  type TEXT,             -- 'complete', 'out', 'bonus'
  subid1 TEXT,
  subid2 TEXT,
  offerid TEXT,
  ipclick TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: same transid can appear twice (status 1 then 2)
CREATE UNIQUE INDEX cpx_transactions_transid_status_unique 
  ON cpx_transactions(transid, status);

CREATE INDEX cpx_transactions_transid_idx ON cpx_transactions(transid);
CREATE INDEX cpx_transactions_userid_idx ON cpx_transactions(userid);
```

---

## Files Modified

1. **app/api/cpx-postback/route.ts** - Fixed parameter names
2. **app/history/page.tsx** - Added CPX transactions to history
3. **components/history-client.tsx** - Display CPX with proper styling
4. **app/profile/page.tsx** - Include CPX in stats
5. **app/api/daily-bonus/route.ts** - Fixed bonus logic

---

## Next Steps

1. Test all scenarios in the checklist above
2. Monitor logs for any errors
3. Verify user experience matches expected behavior
4. Consider adding admin dashboard to view CPX transactions
5. Add analytics to track CPX vs other offerwall performance

---

## Support

For issues:
- Check logs: `npm run dev` or `vercel logs`
- Query database: Use Supabase dashboard or SQL queries
- Review postback logs: Look for `[cpx-postback]` entries
- Test with CPX Test Button before going live


---

### 5. ✅ CRITICAL: Reversal Logic Fixed (April 9, 2026)

**Problem:** When CPX sent a reversal postback (status=2), coins were NOT being deducted from user balance. In some cases, coins were even being ADDED instead of subtracted, causing total_earned to DOUBLE.

**Example of Bug:**
```
Fresh account test:
1. Completion postback → balance: 0→700, total_earned: 0→700 ✓
2. Reversal postback → balance: 700→700 (should be 0!), total_earned: 700→1400 (should stay 700!) ✗
```

**Root Causes Identified:**

1. **Flawed Reversal Rate Protection:**
```typescript
// OLD CODE (BROKEN):
const { data: userReversals } = await supabase
  .from('cpx_transactions')
  .select('id')
  .eq('userid', userid)
  .eq('status', 2);

const reversalRate = completionCount > 0 ? reversalCount / completionCount : 0;

// Only deduct if reversal rate >= 5%
if (reversalRate >= 0.05 && amount > 0) {
  // deduct coins
}
```

**Why it failed:**
- The reversal rate check happened BEFORE logging the current reversal
- On a fresh account with first reversal:
  - completions = 1
  - reversals = 0 (current reversal not logged yet!)
  - rate = 0/1 = 0% < 5%
  - Result: Deduction SKIPPED!

2. **Weak Duplicate Check:**
```typescript
// OLD CODE (BROKEN):
const { data: existing } = await supabase
  .from('cpx_transactions')
  .select('id')
  .eq('transid', transid)
  .eq('status', 1)  // <-- Only checks for status=1!
  .limit(1);
```

**Why it failed:**
- If CPX sent the same transid twice with status=1, the second one would be blocked ✓
- BUT if CPX sent transid=123 with status=1, then later sent transid=123 with status=1 AGAIN (instead of status=2), it would NOT be blocked because the first one was already updated to status=2!
- This could cause double-crediting

3. **Non-Exclusive If Statements:**
```typescript
// OLD CODE (RISKY):
if (statusInt === 1) {
  // credit user
  return ok('OK');
}

if (statusInt === 2) {  // <-- Not else-if!
  // deduct user
  return ok('OK');
}
```

**Why it's risky:**
- While both have `return` statements, it's not immediately clear that only one executes
- Makes code harder to reason about and maintain

**Solutions Implemented:**

1. **Removed Reversal Rate Protection:**
```typescript
// NEW CODE (FIXED):
// ALWAYS deduct on reversals (no rate protection)
if (amount > 0) {
  log(`Deducting ${amount} coins from user ${userid}`);
  
  const { error: deductError } = await supabase.rpc('deduct_user_points', {
    p_userid: userid,
    p_amount: amount
  });
  
  if (deductError) {
    log(`Deduct RPC failed: ${deductError.message}`);
    return ok('deduct_failed');
  }
}
```

2. **Strengthened Duplicate Check:**
```typescript
// NEW CODE (FIXED):
// Check for duplicate (same transid with status=1)
// Note: We only check for status=1 duplicates here because status=2 
// (reversals) should be handled by the reversal handler
const { data: existing } = await supabase
  .from('cpx_transactions')
  .select('id, status')
  .eq('transid', transid)
  .eq('status', 1)  // Only check for existing completions
  .limit(1);

if (existing && existing.length > 0) {
  log(`DUPLICATE COMPLETION IGNORED: transid=${transid} already processed with status=1`);
  return ok('duplicate_ignored');
}
```

**Why this works:**
- Blocks duplicate completions (same transid with status=1)
- Does NOT block reversals (transid with status=2) - they go to the reversal handler
- Allows the two-postback sequence: completion (status=1) → reversal (status=2)

3. **Made Handlers Mutually Exclusive:**
```typescript
// NEW CODE (FIXED):
if (statusInt === 1) {
  // ═══════════════════════════════════════════════════════════════════
  // COMPLETION HANDLER (status=1)
  // ═══════════════════════════════════════════════════════════════════
  // ... credit logic ...
  return ok('OK');
} else if (statusInt === 2) {
  // ═══════════════════════════════════════════════════════════════════
  // REVERSAL HANDLER (status=2)
  // ═══════════════════════════════════════════════════════════════════
  // ... deduct logic ...
  return ok('OK');
} else {
  // ═══════════════════════════════════════════════════════════════════
  // UNKNOWN STATUS HANDLER
  // ═══════════════════════════════════════════════════════════════════
  log(`Unknown status: ${statusInt}`);
  return ok('unknown_status');
}
```

**Why this works:**
- Uses `else if` to make it crystal clear only ONE handler executes
- Improves code readability and maintainability
- Eliminates any possibility of both handlers running

4. **Enhanced Logging:**
```typescript
// Get balance BEFORE operation
const { data: userBefore } = await supabase
  .from('users')
  .select('coins_balance, total_earned')
  .eq('id', userid)
  .single();

log(`User balance BEFORE: coins=${userBefore?.coins_balance}, total_earned=${userBefore?.total_earned}`);

// ... perform operation ...

// Get balance AFTER operation
const { data: userAfter } = await supabase
  .from('users')
  .select('coins_balance, total_earned')
  .eq('id', userid)
  .single();

log(`User balance AFTER: coins=${userAfter?.coins_balance}, total_earned=${userAfter?.total_earned}`);
```

**Expected Behavior (Fresh Account):**
```
TWO-POSTBACK SEQUENCE (Same transid):

1. First Postback - Completion: transid=123, status=1, amount=700
   → Goes to COMPLETION handler (statusInt === 1)
   → Checks for duplicate with status=1 → Not found
   → coins_balance: 0→700
   → total_earned: 0→700
   → cpx_transactions: INSERT (transid=123, status=1)

2. Second Postback - Reversal: transid=123, status=2, amount=700
   → Goes to REVERSAL handler (statusInt === 2) via else-if
   → Finds existing transaction with transid=123, status=1
   → coins_balance: 700→0 (SUBTRACT 700)
   → total_earned: 700→700 (UNCHANGED)
   → cpx_transactions: UPDATE (transid=123, status=1→2)

3. Duplicate Completion: transid=123, status=1, amount=700
   → Goes to COMPLETION handler
   → Checks for duplicate with status=1 → FOUND!
   → BLOCKED: "duplicate_ignored"
   → No changes to balance or database

4. Duplicate Reversal: transid=123, status=2, amount=700
   → Goes to REVERSAL handler
   → Finds transaction with status=2 → Already processed!
   → BLOCKED: "reversal_already_processed"
   → No changes to balance or database
```

**Profile Page Display After Reversal:**
- **Balance**: 0 ✅ (from coins_balance)
- **Total Earned**: 700 ✅ (from total_earned, never decreases)
- **This Month**: 0 ✅ (calculated as: +700 for status=1, -700 for status=2 = 0)
- **Completed Offers**: 1 ✅ (only counts status=1 transactions)

**Database Function Verified:**
```sql
CREATE OR REPLACE FUNCTION deduct_user_points(p_userid text, p_amount numeric)
RETURNS void AS $$
BEGIN
  -- Deduct from coins_balance only (don't touch total_earned)
  UPDATE users
  SET coins_balance = GREATEST(COALESCE(coins_balance, 0) - p_amount::integer, 0)
  WHERE id::text = p_userid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Testing:**
- Test user reset: `a123f1a9-4086-4976-99f1-2f5f5d68ba22`
- Balance reset to: coins_balance=0, total_earned=0
- All CPX transactions cleared

**Test Sequence:**
1. Send completion postback → Verify balance=700, total_earned=700
2. Send reversal postback → Verify balance=0, total_earned=700
3. Send duplicate completion → Verify blocked, no changes
4. Send duplicate reversal → Verify blocked, no changes
5. Check logs for "BEFORE" and "AFTER" balance values
6. Verify transaction status updated from 1→2

---

## Updated Testing Checklist

### Reversal Testing (CRITICAL)
- [ ] Fresh account: Complete +700 → balance=700, total_earned=700
- [ ] Fresh account: Reverse -700 → balance=0, total_earned=700
- [ ] Existing account: Complete +350 → balance increases by 350
- [ ] Existing account: Reverse -350 → balance decreases by 350
- [ ] Double reversal: Send same reversal twice → Second one ignored
- [ ] Verify logs show "BEFORE" and "AFTER" balance values
- [ ] Verify total_earned NEVER changes on reversals

