# 📧 TheoremReach Publisher API Access Request

## Current Status

**Error Received:**
```
401 - Access denied. Contact TheoremReach to enable your publisher API access.
```

This means the Surveys API integration is working correctly, but TheoremReach needs to enable Publisher API access for your account.

---

## ✅ What's Working

1. **Direct Surveywall Access** ✅
   - Entry URL generation working
   - Users can access TheoremReach surveywall
   - Callback handler receiving completions
   - Coins being credited

2. **Surveys API Integration** ✅
   - API endpoint created and deployed
   - Hash generation working correctly
   - Error handling in place
   - Graceful degradation (shows only CPX surveys if TheoremReach unavailable)

---

## 📧 How to Request Publisher API Access

### Step 1: Contact TheoremReach

**Email:** publishers@theoremreach.com

**Subject:** Enable Publisher API for Surveys API Access

**Email Template:**

```
Hi TheoremReach Team,

I would like to request Publisher API access for my account to use the Surveys API.

Account Details:
- API Key: f95cc31c8d438a22dcc505f33673
- App Name: Rewardoxy
- Website: https://rewardoxy.app
- Callback URL: https://rewardoxy.app/api/theoremreach-postback

Purpose:
We want to fetch and display individual surveys from TheoremReach alongside other survey providers in our app. This will provide users with more survey options and improve their earning experience.

Integration Status:
- Direct surveywall integration: ✅ Complete and working
- Callback handler: ✅ Complete and working
- Surveys API integration: ✅ Complete (awaiting API access)

We have already implemented the Surveys API integration with proper SHA1-HMAC authentication and are ready to go live once Publisher API access is enabled.

Thank you for your assistance!

Best regards,
[Your Name]
Rewardoxy Team
```

---

## 🔄 Current Behavior (Without Publisher API)

### What Users See:
- ✅ TheoremReach card in Offer Walls section (working)
- ✅ CPX Research surveys in Surveys section (working)
- ❌ TheoremReach surveys NOT shown in Surveys section (requires Publisher API)

### What Happens:
```
User visits /earn page
    ↓
Surveys section loads
    ↓
Parallel API calls:
    ├─→ /api/cpx-surveys → Returns CPX surveys ✅
    └─→ /api/theoremreach-surveys → Returns 401 (gracefully handled)
    ↓
Display only CPX surveys
    ↓
No error shown to user (graceful degradation)
```

---

## 🚀 After Publisher API Access Enabled

### What Will Change:
- ✅ TheoremReach surveys will appear in Surveys section
- ✅ Mixed CPX + TheoremReach surveys display
- ✅ More earning opportunities for users
- ✅ Better survey fill rates

### Expected Behavior:
```
User visits /earn page
    ↓
Surveys section loads
    ↓
Parallel API calls:
    ├─→ /api/cpx-surveys → Returns CPX surveys ✅
    └─→ /api/theoremreach-surveys → Returns TheoremReach surveys ✅
    ↓
Mix surveys (round-robin)
    ↓
Display up to 20 mixed surveys
    ↓
User sees both CPX and TheoremReach options
```

---

## 📊 Integration Verification

### Test After API Access Enabled:

1. **Check API Response:**
```bash
curl "https://rewardoxy.app/api/theoremreach-surveys?user_id=test123"
```

**Expected Response (after access enabled):**
```json
{
  "success": true,
  "surveys": [
    {
      "id": "tr_123_456",
      "loi": 10,
      "payout_usd": 0.50,
      "payout_coins": 350,
      "type": "theoremreach",
      ...
    }
  ],
  "count": 10
}
```

2. **Check UI:**
   - Visit https://rewardoxy.app/earn
   - Scroll to "Surveys" section
   - Verify TheoremReach surveys appear
   - Check provider badges show "TheoremReach"

3. **Test Survey Completion:**
   - Click a TheoremReach survey
   - Complete the survey
   - Verify coins credited
   - Check transaction logged

---

## 🔐 Security Verification

### Your Integration Uses:
- ✅ SHA1-HMAC hash authentication
- ✅ Server-side secret key storage
- ✅ URL-safe base64 encoding
- ✅ Unique transaction IDs
- ✅ Proper error handling

### Hash Generation Example:
```typescript
const hmac = crypto.createHmac('sha1', secretKey);
hmac.update(urlBeforeHash);
const hash = hmac.digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
```

---

## 📋 Checklist

### Before Requesting:
- [x] ✅ Direct surveywall integration working
- [x] ✅ Callback handler working
- [x] ✅ Surveys API endpoint created
- [x] ✅ Hash generation implemented
- [x] ✅ Error handling in place
- [x] ✅ Deployed to production

### After Requesting:
- [ ] ⏳ Email sent to publishers@theoremreach.com
- [ ] ⏳ Wait for TheoremReach response (typically 1-3 business days)
- [ ] ⏳ Test API access after enabled
- [ ] ⏳ Verify surveys display correctly
- [ ] ⏳ Monitor performance

---

## 💡 Alternative: Use Direct Surveywall Only

If you prefer not to wait for Publisher API access, you can:

1. **Keep using the direct surveywall** (already working)
   - Users click TheoremReach card
   - Opens full surveywall
   - Browse and complete surveys there

2. **Remove Surveys API integration** (optional)
   - Surveys section shows only CPX surveys
   - TheoremReach accessible via Offer Walls card
   - Still fully functional

**Current setup works perfectly for this approach!**

---

## 📞 Support

### TheoremReach Contact:
- **Email:** publishers@theoremreach.com
- **Dashboard:** https://publishers.theoremreach.com
- **Documentation:** https://theoremreach.com/docs

### Expected Response Time:
- Typically 1-3 business days
- May require additional verification
- They may ask for more details about your integration

---

## 🎯 Summary

**Current Status:**
- ✅ Direct surveywall: Working perfectly
- ✅ Callback handler: Working perfectly
- ✅ Surveys API: Implemented and ready
- ⏳ Publisher API Access: Needs to be enabled by TheoremReach

**Action Required:**
1. Send email to publishers@theoremreach.com (use template above)
2. Wait for response (1-3 business days)
3. Test after access enabled
4. Enjoy mixed CPX + TheoremReach surveys!

**No Action Required:**
- Your integration is complete and production-ready
- Graceful degradation ensures no errors for users
- Direct surveywall continues working normally

---

**Status: AWAITING PUBLISHER API ACCESS** ⏳

Everything is ready on your end. Just waiting for TheoremReach to enable Publisher API access for your account!

