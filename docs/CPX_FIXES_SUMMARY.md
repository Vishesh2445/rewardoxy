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
