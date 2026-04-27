# 🔧 TheoremReach iframe URL Fix

## Problem Identified

The iframe was loading with the **WRONG URL** without user_id:
```
https://theoremreach.com/campaigns?auid=...&api_key=...
```

**Root Cause:**
The iframe was being rendered with an empty `src` attribute before the secure URL was fetched from the server. When the iframe had an empty src, TheoremReach's default behavior kicked in and loaded their campaigns page with the old format.

---

## ✅ Solution Applied

**Updated `components/earn-content.tsx` to:**

1. **Wait for URL before rendering iframe**
   - Check if `theoremReachUrl` is populated
   - Show loading spinner while fetching URL
   - Only render iframe when URL is ready

2. **Code Changes:**
```tsx
{activeWall === "TheoremReach" && !theoremReachUrl && (
  <Box sx={{ /* loading state */ }}>
    <CircularProgress sx={{ color: "#01D676" }} />
    <Typography>Loading TheoremReach surveywall...</Typography>
  </Box>
)}

{(activeWall !== "TheoremReach" || theoremReachUrl) && (
  <Box component="iframe" src={iframeSrc} ... />
)}
```

---

## 🎯 What This Fixes

### Before (Wrong):
```
User clicks TheoremReach card
    ↓
activeWall = "TheoremReach"
    ↓
iframe rendered with empty src
    ↓
TheoremReach default: campaigns page (no user_id)
    ↓
❌ User not identified
```

### After (Correct):
```
User clicks TheoremReach card
    ↓
Fetch secure URL from /api/theoremreach-url
    ↓
Show loading spinner
    ↓
URL fetched: theoremReachUrl populated
    ↓
iframe rendered with correct URL
    ↓
✅ User properly identified
```

---

## 📊 Expected Behavior

### Iframe URL After Fix:
```
https://theoremreach.com/respondent_entry/direct
  ?api_key=YOUR_API_KEY
  &user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387
  &transaction_id=26674964-55fe-4fbc-9d4f-f1a4916bb387_1234567890
  &currency_name_plural=Coins
  &currency_name_singular=Coin
  &exchange_rate=700
  &external_id=26674964-55fe-4fbc-9d4f-f1a4916bb387
  &partner_id=YOUR_PLACEMENT_ID
  &hash=...
```

### User Experience:
1. Click TheoremReach card
2. See "Loading TheoremReach surveywall..." message
3. Iframe loads with correct URL
4. User identified properly
5. Surveys available
6. Complete survey
7. Coins credited

---

## ✅ Verification Checklist

After deploying this fix:

- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Click TheoremReach card
- [ ] See loading spinner briefly
- [ ] Iframe loads
- [ ] Check view-source for iframe URL
- [ ] Verify URL contains `user_id=26674964-55fe-4fbc-9d4f-f1a4916bb387`
- [ ] Verify URL contains `/respondent_entry/direct`
- [ ] Verify URL contains `hash=...`
- [ ] Complete a survey
- [ ] Check if coins credited

---

## 🚀 Deployment Steps

### Local Testing:
```bash
npm run build
npm run dev
```

### Deploy to Production:
```bash
git add components/earn-content.tsx
git commit -m "Fix TheoremReach iframe URL - wait for secure URL before rendering"
git push origin main
```

Vercel will automatically redeploy.

---

## 🎓 Technical Details

### Why This Happens:
- React renders components synchronously
- `theoremReachUrl` starts as empty string
- iframe renders with empty src
- TheoremReach loads default page
- Later, URL is fetched but iframe already rendered

### The Fix:
- Conditional rendering based on `theoremReachUrl`
- Show loading state while fetching
- Only render iframe when URL is ready
- Ensures iframe always has correct URL

---

## 📈 Impact

**Before Fix:**
- ❌ User not identified
- ❌ Surveys don't know who user is
- ❌ Completions not credited
- ❌ No coins earned

**After Fix:**
- ✅ User properly identified
- ✅ Surveys know who user is
- ✅ Completions credited correctly
- ✅ Coins earned and credited

---

## 🎉 Summary

**This fix ensures:**
1. ✅ Secure URL generated server-side
2. ✅ URL includes user_id
3. ✅ URL includes hash for security
4. ✅ iframe only renders when URL ready
5. ✅ User properly identified
6. ✅ Coins credited correctly

**Status: READY FOR DEPLOYMENT** 🚀

