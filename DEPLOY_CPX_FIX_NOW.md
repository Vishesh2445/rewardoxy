# 🚨 URGENT: Deploy CPX Reversal Fix

## Current Status
- ✅ Code is fixed locally in `app/api/cpx-postback/route.ts`
- ❌ OLD broken code is still deployed on Vercel
- ❌ Users are still experiencing the bug (balance not deducted on reversals)

## What's Wrong on Production
The deployed code is still using the OLD logic that:
1. Has the flawed reversal rate protection (skips deduction on first reversal)
2. May be calling `add_user_points` instead of `deduct_user_points`
3. Doesn't have the proper duplicate checks

## Evidence
User `205e816a-6375-4a9c-a81e-1b75e1f0681c` just tested:
- Had 1 completion (+700) and 1 reversal (-700)
- Expected: coins_balance=0, total_earned=700
- Actual: coins_balance=700, total_earned=1400
- This proves the reversal handler is NOT deducting coins

## Deploy Steps

### Option 1: Git Push (Recommended)
```bash
# Make sure all changes are committed
git add app/api/cpx-postback/route.ts
git commit -m "fix: CPX reversal logic - always deduct on status=2"
git push origin main
```

Vercel will automatically deploy the changes.

### Option 2: Manual Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project (rewardoxy)
3. Click "Deployments"
4. Click "Redeploy" on the latest deployment
5. Wait for deployment to complete

### Option 3: Vercel CLI
```bash
vercel --prod
```

## After Deployment

### 1. Verify the fix is deployed
Check the deployment logs or test with a fresh user:

**Test URL (completion):**
```
https://rewardoxy.app/api/cpx-postback?userid=TEST_USER_ID&transid=TEST_001&amountlocal=700&amountusd=1.00&status=1&type=complete&hash=HASH
```

**Test URL (reversal):**
```
https://rewardoxy.app/api/cpx-postback?userid=TEST_USER_ID&transid=TEST_001&amountlocal=700&amountusd=1.00&status=2&type=complete&hash=HASH
```

### 2. Check the logs
Look for these log messages:
```
[cpx-postback] User balance BEFORE reversal: coins=700, total_earned=700
[cpx-postback] Deducting 700 coins from user ...
[cpx-postback] User balance AFTER reversal: coins=0, total_earned=700
[cpx-postback] SUCCESS: Deducted 700 from user ...
```

### 3. Fix existing affected users (optional)
If you want to fix users who were affected by the bug:

```sql
-- Find all users with reversals who have incorrect balances
SELECT 
  u.id,
  u.email,
  u.coins_balance,
  u.total_earned,
  (SELECT SUM(amount_local::numeric) FROM cpx_transactions WHERE userid = u.id::text AND status = 1) as should_have_added,
  (SELECT SUM(amount_local::numeric) FROM cpx_transactions WHERE userid = u.id::text AND status = 2) as should_have_deducted
FROM users u
WHERE EXISTS (
  SELECT 1 FROM cpx_transactions 
  WHERE userid = u.id::text AND status = 2
);

-- To fix a specific user (example):
-- UPDATE users 
-- SET 
--   coins_balance = 0,  -- or calculate correct amount
--   total_earned = 700  -- or calculate correct amount
-- WHERE id = 'USER_ID';
```

## Key Changes in the Fix

1. **Removed reversal rate protection** - Now ALWAYS deducts on status=2
2. **Fixed duplicate check** - Only checks for status=1 duplicates in completion handler
3. **Made handlers exclusive** - Uses `else if` to ensure only one handler executes
4. **Enhanced logging** - Shows balance before/after every operation

## Files Changed
- `app/api/cpx-postback/route.ts` - Main fix
- `docs/CPX_FIXES_SUMMARY.md` - Documentation
- `docs/CPX_REVERSAL_TEST_PLAN.md` - Test plan

## Expected Behavior After Deploy
- Completion (status=1): Adds to balance AND total_earned
- Reversal (status=2): Subtracts from balance, keeps total_earned unchanged
- Profile shows correct values for all stats
