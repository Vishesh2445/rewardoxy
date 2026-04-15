# Leaderboard Automation Setup

## Overview

The leaderboard is automatically updated every 6 hours using GitHub Actions. It ranks users by their **monthly earnings** (`this_month_earnings` column) and shows the top 10 users.

## Components

### 1. Database Structure

**Leaderboard Cache Table:**
```sql
leaderboard_cache (
  rank INTEGER,
  user_id UUID,
  display_name TEXT,
  monthly_earnings INTEGER,  -- Updated from weekly_coins
  updated_at TIMESTAMP
)
```

**Users Table (Monthly Earnings):**
```sql
users (
  ...
  this_month_earnings INTEGER,     -- Tracks monthly earnings (positive only)
  month_reset_date TIMESTAMP,      -- When to reset monthly earnings
  ...
)
```

### 2. Database Function

**`refresh_leaderboard_cache()`:**
- Clears existing leaderboard cache
- Selects top 10 users by `this_month_earnings`
- Only includes verified users with earnings > 0
- Orders by monthly earnings (descending)
- Updates the cache with current timestamp

### 3. API Endpoint

**`/api/refresh-leaderboard`:**
- **Method:** POST (GET also supported for testing)
- **Security:** Bearer token authentication
- **Function:** Calls `refresh_leaderboard_cache()` RPC
- **Response:** Success status + leaderboard data

**Environment Variable:**
```env
LEADERBOARD_REFRESH_KEY=lb_refresh_2024_secure_key_xyz789
```

### 4. GitHub Actions Workflow

**File:** `.github/workflows/refresh-leaderboard.yml`

**Schedule:** Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)

**Process:**
1. Calls `/api/refresh-leaderboard` with Bearer token
2. Logs response and user count
3. Fails if HTTP status != 200

**Required Secrets:**
- `LEADERBOARD_REFRESH_KEY` - API authentication key
- `NEXT_PUBLIC_APP_URL` - Your app URL (https://rewardoxy.app)

### 5. Frontend Integration

**Leaderboard Page (`/leaderboard`):**
- Reads from `leaderboard_cache` table
- Shows top 3 users in podium format
- Displays remaining users in table/list
- Highlights current user's rank
- Shows "Updated every 6 hours" indicator

## Monthly Earnings System

### How It Works:

1. **Earning Points:** When users complete offers, `this_month_earnings` increments
2. **Chargebacks:** When offers are reversed, `this_month_earnings` stays unchanged (only `coins_balance` decreases)
3. **Monthly Reset:** Each user's monthly earnings reset based on their signup date anniversary

### Key Functions:

- **`credit_postback()`** - Increments both `coins_balance` and `this_month_earnings`
- **`deduct_user_points()`** - Only decreases `coins_balance` (monthly earnings unchanged)
- **Auto-reset logic** - Built into credit functions based on `month_reset_date`

## Setup Instructions

### 1. GitHub Secrets

Add these secrets to your GitHub repository:

```
LEADERBOARD_REFRESH_KEY=lb_refresh_2024_secure_key_xyz789
NEXT_PUBLIC_APP_URL=https://rewardoxy.app
```

**How to add:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add both secrets

### 2. Environment Variables

Add to your deployment environment (Vercel):

```env
LEADERBOARD_REFRESH_KEY=lb_refresh_2024_secure_key_xyz789
```

### 3. Test the Setup

**Manual Test:**
```bash
curl -X POST \
  -H "Authorization: Bearer lb_refresh_2024_secure_key_xyz789" \
  -H "Content-Type: application/json" \
  "https://rewardoxy.app/api/refresh-leaderboard"
```

**GitHub Actions Test:**
1. Go to GitHub repo → Actions tab
2. Find "Refresh Leaderboard" workflow
3. Click "Run workflow" → "Run workflow"

## Monitoring

### Check Workflow Status:
- GitHub repo → Actions tab → "Refresh Leaderboard"
- View logs for each run
- Check for failures or errors

### Verify Leaderboard Updates:
- Visit `/leaderboard` page
- Check "Updated every 6 hours" timestamp
- Verify user rankings are current

### Database Verification:
```sql
-- Check leaderboard cache
SELECT * FROM leaderboard_cache ORDER BY rank;

-- Check monthly earnings
SELECT display_name, this_month_earnings, month_reset_date 
FROM users 
WHERE this_month_earnings > 0 
ORDER BY this_month_earnings DESC;
```

## Troubleshooting

### Common Issues:

1. **Workflow fails with 401 Unauthorized:**
   - Check `LEADERBOARD_REFRESH_KEY` secret matches environment variable

2. **Empty leaderboard:**
   - Users need to complete offers to have `this_month_earnings > 0`
   - Check if monthly earnings are being incremented properly

3. **Workflow doesn't run:**
   - GitHub Actions may be disabled
   - Check workflow file syntax
   - Verify cron schedule format

4. **API endpoint errors:**
   - Check Vercel deployment logs
   - Verify Supabase connection
   - Test RPC function manually

### Manual Refresh:

If needed, you can manually refresh the leaderboard:

```sql
SELECT refresh_leaderboard_cache();
```

Or call the API endpoint directly with proper authentication.

## Security Notes

- API endpoint is protected by Bearer token authentication
- Only accepts requests with valid `LEADERBOARD_REFRESH_KEY`
- GitHub secrets are encrypted and only accessible to workflows
- No sensitive data is logged in workflow outputs

## Performance

- Leaderboard cache reduces database load on frontend
- Only top 10 users are cached (efficient storage)
- Updates every 6 hours (balanced freshness vs. resource usage)
- RPC function is optimized for fast execution