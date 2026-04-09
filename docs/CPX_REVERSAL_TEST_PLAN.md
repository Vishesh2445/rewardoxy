# CPX Reversal Test Plan

## Test User
- **User ID**: `a123f1a9-4086-4976-99f1-2f5f5d68ba22`
- **Email**: visheshsingh7655@gmail.com
- **Initial State**: coins_balance=0, total_earned=0, cpx_transactions=0

## Test Scenario: Completion → Reversal

### Step 1: Send Completion Postback

**URL:**
```
https://rewardoxy.app/api/cpx-postback?userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22&transid=TEST_REV_001&amountlocal=700.0000&amountusd=1.00&status=1&type=complete&hash=CALCULATE_HASH
```

**Expected Result:**
- HTTP 200 with body "OK"
- User balance: 0 → 700
- User total_earned: 0 → 700
- CPX transaction created: transid=TEST_REV_001, status=1, amount=700
- Profile page shows:
  - Balance: 700
  - Total Earned: 700
  - This Month: 700
  - Completed Offers: 1

**Logs to check:**
```
[cpx-postback] User balance BEFORE credit: coins=0, total_earned=0
[cpx-postback] Crediting user: userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22, amount=700
[cpx-postback] User balance AFTER credit: coins=700, total_earned=700
[cpx-postback] SUCCESS: Credited 700 to user a123f1a9-4086-4976-99f1-2f5f5d68ba22
[cpx-postback] Transaction logged: transid=TEST_REV_001, status=1
```

---

### Step 2: Send Reversal Postback (Same transid, status=2)

**URL:**
```
https://rewardoxy.app/api/cpx-postback?userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22&transid=TEST_REV_001&amountlocal=700.0000&amountusd=1.00&status=2&type=complete&hash=CALCULATE_HASH
```

**Expected Result:**
- HTTP 200 with body "OK"
- User balance: 700 → 0 (DEDUCTED 700)
- User total_earned: 700 → 700 (UNCHANGED)
- CPX transaction updated: transid=TEST_REV_001, status=1→2
- Profile page shows:
  - Balance: 0 ✅
  - Total Earned: 700 ✅ (unchanged)
  - This Month: 0 ✅ (700 - 700 = 0)
  - Completed Offers: 1 ✅ (only counts status=1)

**Logs to check:**
```
[cpx-postback] REVERSAL: transid=TEST_REV_001, userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22, amount=700
[cpx-postback] User balance BEFORE reversal: coins=700, total_earned=700
[cpx-postback] Deducting 700 coins from user a123f1a9-4086-4976-99f1-2f5f5d68ba22
[cpx-postback] SUCCESS: Deducted 700 from user a123f1a9-4086-4976-99f1-2f5f5d68ba22
[cpx-postback] User balance AFTER reversal: coins=0, total_earned=700
[cpx-postback] REVERSAL PROCESSED: transid=TEST_REV_001 updated to status=2
```

---

### Step 3: Send Duplicate Completion (Should be blocked)

**URL:**
```
https://rewardoxy.app/api/cpx-postback?userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22&transid=TEST_REV_001&amountlocal=700.0000&amountusd=1.00&status=1&type=complete&hash=CALCULATE_HASH
```

**Expected Result:**
- HTTP 200 with body "duplicate_ignored"
- User balance: 0 → 0 (NO CHANGE)
- User total_earned: 700 → 700 (NO CHANGE)
- CPX transaction: NO CHANGE (still status=2)

**Logs to check:**
```
[cpx-postback] DUPLICATE COMPLETION IGNORED: transid=TEST_REV_001 already processed with status=1
```

---

### Step 4: Send Duplicate Reversal (Should be blocked)

**URL:**
```
https://rewardoxy.app/api/cpx-postback?userid=a123f1a9-4086-4976-99f1-2f5f5d68ba22&transid=TEST_REV_001&amountlocal=700.0000&amountusd=1.00&status=2&type=complete&hash=CALCULATE_HASH
```

**Expected Result:**
- HTTP 200 with body "reversal_already_processed"
- User balance: 0 → 0 (NO CHANGE)
- User total_earned: 700 → 700 (NO CHANGE)
- CPX transaction: NO CHANGE (still status=2)

**Logs to check:**
```
[cpx-postback] REVERSAL ALREADY PROCESSED: transid=TEST_REV_001 already has status=2
```

---

## Database Verification Queries

### Check user balance
```sql
SELECT 
  id, 
  email,
  coins_balance, 
  total_earned
FROM users 
WHERE id = 'a123f1a9-4086-4976-99f1-2f5f5d68ba22';
```

### Check CPX transactions
```sql
SELECT 
  transid,
  userid,
  amount_local,
  status,
  type,
  created_at,
  updated_at
FROM cpx_transactions 
WHERE userid = 'a123f1a9-4086-4976-99f1-2f5f5d68ba22'
ORDER BY created_at DESC;
```

### Check monthly earnings calculation
```sql
SELECT 
  transid,
  amount_local,
  status,
  CASE 
    WHEN status = 1 THEN amount_local
    WHEN status = 2 THEN -amount_local
    ELSE 0
  END as contribution_to_monthly
FROM cpx_transactions 
WHERE userid = 'a123f1a9-4086-4976-99f1-2f5f5d68ba22'
  AND created_at >= date_trunc('month', CURRENT_DATE);
```

---

## Success Criteria

✅ **Completion postback**:
- Credits coins_balance
- Credits total_earned
- Creates transaction with status=1

✅ **Reversal postback**:
- Deducts from coins_balance
- Does NOT modify total_earned
- Updates transaction to status=2

✅ **Profile page**:
- Balance shows current coins_balance
- Total Earned shows lifetime earnings (never decreases)
- This Month calculates: sum(status=1) - sum(status=2)
- Completed Offers counts only status=1

✅ **Duplicate protection**:
- Duplicate completion (status=1) is blocked
- Duplicate reversal (status=2) is blocked

✅ **Logging**:
- Shows BEFORE and AFTER balance for every operation
- Clear indication of what action was taken
- Easy to debug issues

---

## Hash Calculation

To calculate the hash for testing:
```javascript
const crypto = require('crypto');
const transid = 'TEST_REV_001';
const secret = process.env.CPX_SECRET_HASH; // Get from .env.local
const hash = crypto.createHash('md5').update(`${transid}-${secret}`).digest('hex');
console.log(hash);
```

Or use CPX Research test button which automatically includes the correct hash.
