# 🧪 TheoremReach URL Generation Test

## Issue Identified

The iframe is showing the **WRONG URL**:
```
https://theoremreach.com/campaigns?auid=f5ccf60e-ec73-4fcf-b9fc-2a1d627dcfc8&api_key=fcba67981b93e085f707a24500c9
```

**Problems:**
1. ❌ Wrong endpoint: `/campaigns` (should be `/respondent_entry/direct`)
2. ❌ Wrong API key: `fcba67981b93e085f707a24500c9` (should be `f95cc31c8d438a22dcc505f33673`)
3. ❌ Missing required parameters: `transaction_id`, `exchange_rate`, `currency_name_plural`, `hash`
4. ❌ Using `auid` instead of `user_id`

## ✅ Correct URL Should Be:

```
https://theoremreach.com/respondent_entry/direct
  ?api_key=f95cc31c8d438a22dcc505f33673
  &user_id={USER_ID}
  &transaction_id={USER_ID}_{TIMESTAMP}
  &currency_name_plural=Coins
  &currency_name_singular=Coin
  &exchange_rate=700
  &external_id={USER_ID}
  &partner_id=84246d7d-8e8b-4797-9cb2-faaafa56ad98
  &hash={SHA1_HMAC_HASH}
```

---

## 🔍 Root Cause

The old URL format suggests one of these scenarios:

### Scenario 1: Browser Cache
- The page is cached with old code
- **Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

### Scenario 2: Deployment Issue
- Old code still deployed on production
- **Solution:** Redeploy the latest code

### Scenario 3: Not Using Our Endpoint
- Frontend not calling `/api/theoremreach-url`
- **Solution:** Verify the frontend code

---

## 🧪 How to Test

### Test 1: Check URL Generator Endpoint

**Run this in your browser console or terminal:**
```bash
curl "https://rewardoxy.app/api/theoremreach-url?user_id=test123"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://theoremreach.com/respondent_entry/direct?api_key=f95cc31c8d438a22dcc505f33673&user_id=test123&transaction_id=test123_1234567890&currency_name_plural=Coins&currency_name_singular=Coin&exchange_rate=700&external_id=test123&partner_id=84246d7d-8e8b-4797-9cb2-faaafa56ad98&hash=...",
  "transaction_id": "test123_1234567890"
}
```

### Test 2: Check Frontend Code

**In browser console on /earn page:**
```javascript
// Check if the function is calling the right endpoint
fetch('/api/theoremreach-url?user_id=test123')
  .then(r => r.json())
  .then(console.log);
```

### Test 3: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click TheoremReach card
4. Look for request to `/api/theoremreach-url`
5. Check the response

---

## 🔧 Quick Fix

### Option 1: Clear Cache and Redeploy

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Redeploy to Vercel
git add .
git commit -m "Fix TheoremReach URL generation"
git push
```

### Option 2: Verify Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify these are set:
   - `THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673`
   - `THEOREMREACH_SECRET_KEY=3b77cff8a08ae8c642f5661b3f7b857801895837`
   - `NEXT_PUBLIC_THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673`
   - `NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID=84246d7d-8e8b-4797-9cb2-faaafa56ad98`

5. Redeploy after updating

---

## 📊 Verification Checklist

After fixing, verify:

- [ ] URL starts with `https://theoremreach.com/respondent_entry/direct`
- [ ] Contains `api_key=f95cc31c8d438a22dcc505f33673`
- [ ] Contains `user_id={actual_user_id}`
- [ ] Contains `transaction_id={user_id}_{timestamp}`
- [ ] Contains `exchange_rate=700`
- [ ] Contains `currency_name_plural=Coins`
- [ ] Contains `partner_id=84246d7d-8e8b-4797-9cb2-faaafa56ad98`
- [ ] Contains `hash={long_hash_string}`

---

## 🎯 Why This Matters

**Current (Wrong) URL:**
- ❌ No transaction tracking
- ❌ No exchange rate specified
- ❌ No hash security
- ❌ Callbacks won't work properly
- ❌ User won't get credited

**Correct URL:**
- ✅ Proper transaction tracking
- ✅ Correct exchange rate (700 coins = $1)
- ✅ Secure hash verification
- ✅ Callbacks work correctly
- ✅ User gets credited automatically

---

## 🚨 Immediate Action Required

1. **Hard refresh the page** (Ctrl+Shift+R)
2. **Check if URL changes** in iframe
3. **If still wrong**, redeploy the latest code
4. **Verify environment variables** on Vercel
5. **Test callback** after fixing URL

---

## ✅ Success Indicators

You'll know it's working when:
1. Iframe URL starts with `/respondent_entry/direct`
2. URL contains all required parameters
3. User completes survey
4. Callback received at your server
5. Coins credited to user account
6. Transaction logged in database

---

**The callback test showing "200 Success" is good! Now we just need to fix the iframe URL format.** 🚀

