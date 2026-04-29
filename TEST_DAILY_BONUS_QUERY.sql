-- Test query to verify daily bonus calculation
-- Run this in Supabase SQL Editor to see what the page SHOULD show

WITH today_start AS (
  SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date::timestamptz as start_time
)
SELECT 
  'Today Start' as label,
  (SELECT start_time FROM today_start)::text as value

UNION ALL

SELECT 
  'Completions Today' as label,
  COALESCE(SUM(coins_awarded), 0)::text as value
FROM completions, today_start
WHERE player_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387'
  AND created_at >= (SELECT start_time FROM today_start)

UNION ALL

SELECT 
  'CPX Today' as label,
  COALESCE(SUM(CASE WHEN status = 2 THEN -ROUND(amount_local::numeric) ELSE ROUND(amount_local::numeric) END), 0)::text as value
FROM cpx_transactions, today_start
WHERE userid = '26674964-55fe-4fbc-9d4f-f1a4916bb387'
  AND created_at >= (SELECT start_time FROM today_start)

UNION ALL

SELECT 
  'Notik Today' as label,
  COALESCE(SUM(ROUND(amount::numeric)), 0)::text as value
FROM notik_transactions, today_start
WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387'
  AND created_at >= (SELECT start_time FROM today_start)

UNION ALL

SELECT 
  'GemiAd Today' as label,
  COALESCE(SUM(ROUND(reward::numeric)), 0)::text as value
FROM gemiad_transactions, today_start
WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387'
  AND created_at >= (SELECT start_time FROM today_start)

UNION ALL

SELECT 
  'TheoremReach Today' as label,
  COALESCE(SUM(ROUND(reward::numeric)), 0)::text as value
FROM theoremreach_transactions, today_start
WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387'
  AND created_at >= (SELECT start_time FROM today_start)

UNION ALL

SELECT 
  'TOTAL TODAY' as label,
  (
    COALESCE((SELECT SUM(coins_awarded) FROM completions, today_start WHERE player_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387' AND created_at >= (SELECT start_time FROM today_start)), 0) +
    COALESCE((SELECT SUM(CASE WHEN status = 2 THEN -ROUND(amount_local::numeric) ELSE ROUND(amount_local::numeric) END) FROM cpx_transactions, today_start WHERE userid = '26674964-55fe-4fbc-9d4f-f1a4916bb387' AND created_at >= (SELECT start_time FROM today_start)), 0) +
    COALESCE((SELECT SUM(ROUND(amount::numeric)) FROM notik_transactions, today_start WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387' AND created_at >= (SELECT start_time FROM today_start)), 0) +
    COALESCE((SELECT SUM(ROUND(reward::numeric)) FROM gemiad_transactions, today_start WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387' AND created_at >= (SELECT start_time FROM today_start)), 0) +
    COALESCE((SELECT SUM(ROUND(reward::numeric)) FROM theoremreach_transactions, today_start WHERE user_id = '26674964-55fe-4fbc-9d4f-f1a4916bb387' AND created_at >= (SELECT start_time FROM today_start)), 0)
  )::text as value;
