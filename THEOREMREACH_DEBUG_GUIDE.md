# 🔍 TheoremReach URL Debug Guide

## Problem Identified

The iframe is loading the **WRONG URL** with no user_id:
```
https://theoremreach.com/campaigns?auid=f5ccf60e-ec73-4fcf-b9fc-2a1d627dcfc8&api_key=fcba67981b93e085f707a24500c9
```

**Issues:**
1. ❌ No `user_id` parameter
2. ❌ Wrong API key (not your actual key)
3. ❌ Wrong endpoint (`/campaigns`)
4. ❌ Using `auid` instead of `user_id`

---

## 🔧 Step-by-Step Debug

### Step 1: Verify the API Endpoint Works

**Open your browser console and run:**
```javascript
fetch('/api/theoremreach-url?user_id=test-user-123')
  .then(r => r.json())
  .then(data => {
    console.log('Response:', data);
    if (data.url) {
      console.log('URL:', data.url);
    }
  });
```

**Expected output:**
```
Response: {
  success: true,
  url: "https://theoremreach.com/respondent_entry/direct?api_key=f95cc31c8d438a22dcc505f33673&user_id=test-user-123&...",
  transaction_id: "test-user-123_1234567890"
}
```

**If you get an error or wrong response, the endpoint is not working correctly.**

---

### Step 2: Check Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Click the TheoremReach card** on /earn page
4. **Look for these requests:**
   - ✅ Should see: `GET /api/theoremreach-url?user_id=...`
   - ❌ Should NOT see: Direct call to `theoremreach.com/campaigns`

**If you don't see the `/api/theoremreach-url` request, the frontend code is not being executed.**

---

### Step 3: Check Browser Cache

The page might be cached with old code:

**Hard refresh the page:**
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

**Or clear cache completely:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"

---

### Step 4: Check Console for Errors

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Click TheoremReach card**
4. **Look for any error messages**

**Common errors:**
- `Failed to get TheoremReach URL` - API endpoint not responding
- `user_id is required` - user_id not being passed
- `TheoremReach not configured` - Environment variables missing

---

### Step 5: Verify Environment Variables on Production

If the issue persists after hard refresh, the environment variables might not be set on Vercel:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Verify these are set:**
   ```
   THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673
   THEOREMREACH_SECRET_KEY=3b77cff8a08ae8c642f5661b3f7b857801895837
   NEXT_PUBLIC_THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673
   NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID=84246d7d-8e8b-4797-9cb2-faaafa56ad98
   ```

**If missing, add them and redeploy.**

---

## 🚀 Quick Fix Checklist

- [ ] **Hard refresh** the page (Ctrl+Shift+R)
- [ ] **Check Network tab** for `/api/theoremreach-url` request
- [ ] **Check Console** for any error messages
- [ ] **Verify environment variables** on Vercel
- [ ] **Redeploy** if environment variables were missing
- [ ] **Test again** after redeploy

---

## 📊 Expected Behavior After Fix

### Before (Wrong):
```
User clicks TheoremReach card
    ↓
Iframe loads: https://theoremreach.com/campaigns?auid=...&api_key=...
    ↓
❌ No user_id sent
❌ Surveys don't know who the user is
❌ Completions not credited
```

### After (Correct):
```
User clicks TheoremReach card
    ↓
Frontend calls: /api/theoremreach-url?user_id={actual_user_id}
    ↓
Server generates secure URL with hash
    ↓
Iframe loads: https://theoremreach.com/respondent_entry/direct?api_key=...&user_id=...&hash=...
    ↓
✅ User_id properly sent
✅ Surveys know who the user is
✅ Completions credited correctly
```

---

## 🧪 Test Commands

### Test 1: Direct API Call
```bash
curl "https://rewardoxy.app/api/theoremreach-url?user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387"
```

### Test 2: Browser Console
```javascript
// Replace with actual user ID
const userId = "26674964-55fe-4fbc-9d4f-f1a4916bb387";
fetch(`/api/theoremreach-url?user_id=${userId}`)
  .then(r => r.json())
  .then(console.log);
```

### Test 3: Check Deployment
```bash
# Check if latest code is deployed
curl "https://rewardoxy.app/api/theoremreach-url?user_id=test" -v
```

---

## 🎯 Root Cause Analysis

### Possible Causes:

1. **Browser Cache** (Most Likely)
   - Old code cached in browser
   - **Fix:** Hard refresh (Ctrl+Shift+R)

2. **Vercel Cache** (Likely)
   - Old deployment still active
   - **Fix:** Redeploy latest code

3. **Missing Environment Variables** (Possible)
   - Variables not set on Vercel
   - **Fix:** Add to Vercel dashboard and redeploy

4. **Code Not Updated** (Unlikely)
   - Old code still in repository
   - **Fix:** Verify latest code is committed

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Network tab shows `/api/theoremreach-url` request
2. ✅ Response contains correct API key: `f95cc31c8d438a22dcc505f33673`
3. ✅ Response contains user_id parameter
4. ✅ Response contains `hash` parameter
5. ✅ Iframe URL starts with `/respondent_entry/direct`
6. ✅ User completes survey
7. ✅ Callback received at server
8. ✅ Coins credited to user

---

## 🆘 If Still Not Working

**Try this nuclear option:**

1. **Clear everything:**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Verify code:**
   ```bash
   grep -n "theoremreach-url" components/earn-content.tsx
   ```

3. **Check environment:**
   ```bash
   echo $THEOREMREACH_API_KEY
   echo $THEOREMREACH_SECRET_KEY
   ```

4. **Redeploy:**
   ```bash
   git add .
   git commit -m "Force redeploy TheoremReach fix"
   git push
   ```

---

**Most likely fix: Hard refresh the page (Ctrl+Shift+R)** 🔄

