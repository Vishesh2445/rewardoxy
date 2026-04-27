# 🚨 TheoremReach Integration Troubleshooting

## Current Issue

**Iframe URL is wrong:**
```
https://theoremreach.com/campaigns?auid=f5ccf60e-ec73-4fcf-b9fc-2a1d627dcfc8&api_key=fcba67981b93e085f707a24500c9
```

**Problems:**
- ❌ No `user_id` parameter
- ❌ Wrong API key
- ❌ Wrong endpoint
- ❌ User not being identified

---

## 🔍 Diagnosis Steps

### Step 1: Test the API Endpoint

**Visit this URL in your browser:**
```
https://rewardoxy.app/api/theoremreach-test?user_id=test123
```

**You should see:**
```json
{
  "timestamp": "2026-04-28T...",
  "userId": "test123",
  "environment": {
    "THEOREMREACH_API_KEY": "✅ SET",
    "THEOREMREACH_SECRET_KEY": "✅ SET",
    "NEXT_PUBLIC_THEOREMREACH_API_KEY": "✅ SET",
    "NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID": "✅ SET"
  },
  "values": {
    "api_key": "f95cc31c8d438a22dcc505f33673",
    "placement_id": "84246d7d-8e8b-4797-9cb2-faaafa56ad98"
  }
}
```

**If you see ❌ MISSING for any variable, that's the problem!**

---

### Step 2: Test the URL Generator

**Visit this URL:**
```
https://rewardoxy.app/api/theoremreach-url?user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387
```

**You should see:**
```json
{
  "success": true,
  "url": "https://theoremreach.com/respondent_entry/direct?api_key=f95cc31c8d438a22dcc505f33673&user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387&transaction_id=26674964-55fe-4fbc-9d4f-f1a4916bb387_1234567890&currency_name_plural=Coins&currency_name_singular=Coin&exchange_rate=700&external_id=26674964-55fe-4fbc-9d4f-f1a4916bb387&partner_id=84246d7d-8e8b-4797-9cb2-faaafa56ad98&hash=...",
  "transaction_id": "26674964-55fe-4fbc-9d4f-f1a4916bb387_1234567890"
}
```

**Check:**
- ✅ URL starts with `/respondent_entry/direct`
- ✅ Contains your actual API key
- ✅ Contains the user_id
- ✅ Contains the hash parameter

---

### Step 3: Check Browser Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Hard refresh** (Ctrl+Shift+R)
4. **Click TheoremReach card** on /earn page
5. **Look for requests:**

**You should see:**
- ✅ `GET /api/theoremreach-url?user_id=...` (200 OK)
- ✅ Response contains correct URL

**You should NOT see:**
- ❌ Direct request to `theoremreach.com/campaigns`

---

### Step 4: Check Browser Console

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Click TheoremReach card**
4. **Look for messages:**

**Good signs:**
- ✅ No error messages
- ✅ URL fetched successfully

**Bad signs:**
- ❌ `Failed to get TheoremReach URL`
- ❌ `user_id is required`
- ❌ `TheoremReach not configured`

---

## 🔧 Solutions

### Solution 1: Hard Refresh (Most Likely Fix)

**The page is probably cached with old code.**

**Windows/Linux:**
```
Ctrl + Shift + R
```

**Mac:**
```
Cmd + Shift + R
```

**Or clear cache completely:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"

---

### Solution 2: Check Vercel Environment Variables

If hard refresh doesn't work, environment variables might not be set on Vercel:

1. **Go to:** https://vercel.com/dashboard
2. **Select your project:** rewardoxy
3. **Go to:** Settings → Environment Variables
4. **Verify these are set:**

```
THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673
THEOREMREACH_SECRET_KEY=3b77cff8a08ae8c642f5661b3f7b857801895837
NEXT_PUBLIC_THEOREMREACH_API_KEY=f95cc31c8d438a22dcc505f33673
NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID=84246d7d-8e8b-4797-9cb2-faaafa56ad98
```

**If any are missing:**
1. Add them
2. Click "Save"
3. Go to Deployments
4. Click "Redeploy" on the latest deployment
5. Wait for deployment to complete
6. Test again

---

### Solution 3: Redeploy Latest Code

If environment variables are set but still not working:

```bash
# In your local terminal
git add .
git commit -m "Redeploy TheoremReach fix"
git push origin main
```

**Then wait for Vercel to automatically redeploy.**

---

### Solution 4: Clear Vercel Cache

1. **Go to:** https://vercel.com/dashboard
2. **Select your project**
3. **Go to:** Settings → Git
4. **Scroll down to "Deployments"**
5. **Click "Clear Build Cache"**
6. **Redeploy**

---

## 📊 Verification Checklist

After applying a fix, verify:

- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Network tab shows `/api/theoremreach-url` request
- [ ] Response contains correct API key
- [ ] Response contains user_id
- [ ] Response contains hash
- [ ] Iframe URL starts with `/respondent_entry/direct`
- [ ] No console errors
- [ ] Click TheoremReach card opens surveywall
- [ ] Complete a survey
- [ ] Check if coins credited

---

## 🎯 Expected Final Result

### Correct Iframe URL:
```
https://theoremreach.com/respondent_entry/direct
  ?api_key=f95cc31c8d438a22dcc505f33673
  &user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387
  &transaction_id=26674964-55fe-4fbc-9d4f-f1a4916bb387_1234567890
  &currency_name_plural=Coins
  &currency_name_singular=Coin
  &exchange_rate=700
  &external_id=26674964-55fe-4fbc-9d4f-f1a4916bb387
  &partner_id=84246d7d-8e8b-4797-9cb2-faaafa56ad98
  &hash=...
```

### User Journey:
```
1. User clicks TheoremReach card
2. Frontend calls /api/theoremreach-url
3. Server generates secure URL with hash
4. Iframe loads with correct URL
5. User sees TheoremReach surveywall
6. User completes survey
7. TheoremReach sends callback
8. Server credits coins
9. User sees updated balance
```

---

## 🆘 Still Not Working?

**Try this in order:**

1. ✅ Hard refresh (Ctrl+Shift+R)
2. ✅ Clear browser cache completely
3. ✅ Check `/api/theoremreach-test` endpoint
4. ✅ Check `/api/theoremreach-url` endpoint
5. ✅ Verify Vercel environment variables
6. ✅ Redeploy from Vercel dashboard
7. ✅ Clear Vercel build cache and redeploy
8. ✅ Push new commit to trigger redeploy

---

## 📞 Debug Information to Collect

If you need help, provide:

1. **Screenshot of Network tab** showing the request
2. **Screenshot of Console tab** showing any errors
3. **Output of `/api/theoremreach-test` endpoint**
4. **Output of `/api/theoremreach-url` endpoint**
5. **Vercel environment variables** (screenshot)
6. **Current iframe URL** (from view-source)

---

## ✅ Quick Summary

| Issue | Solution |
|-------|----------|
| Wrong iframe URL | Hard refresh (Ctrl+Shift+R) |
| No user_id in URL | Check environment variables |
| Wrong API key | Verify Vercel settings |
| Still not working | Redeploy from Vercel |
| Cache issues | Clear Vercel build cache |

---

**Most likely: Just hard refresh the page!** 🔄

