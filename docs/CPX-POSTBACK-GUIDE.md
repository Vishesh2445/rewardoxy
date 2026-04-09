# CPX Research Postback Integration Guide

## ✅ Postback URL for CPX Dashboard

Copy and paste this URL into your CPX Research dashboard:

```
https://www.rewardoxy.app/api/cpx-postback?status={status}&trans_id={trans_id}&user_id={user_id}&amount_local={amount_local}&amount_usd={amount_usd}&type={type}&hash={secure_hash}&ip_click={ip_click}
```

## 📋 Parameter Mapping

| CPX Placeholder | Query Param | Description |
|----------------|-------------|-------------|
| `{status}` | `status` | 1 = completed, 2 = canceled |
| `{trans_id}` | `trans_id` | Unique transaction ID |
| `{user_id}` | `user_id` | Your user's ID |
| `{amount_local}` | `amount_local` | Amount in your currency |
| `{amount_usd}` | `amount_usd` | Amount in USD |
| `{type}` | `type` | Event type: complete, out, bonus |
| `{secure_hash}` | `hash` | MD5 hash for verification |
| `{ip_click}` | `ip_click` | User's IP at click time |

## 🔧 Environment Variables

Add to your `.env.local`:

```env
CPX_SECURE_HASH=your_secure_hash_from_cpx_dashboard
```

## 🔐 Hash Verification

The hash is calculated as:
```
MD5(trans_id + "-" + CPX_SECURE_HASH)
```

Example in JavaScript:
```javascript
const expectedHash = crypto.createHash('md5')
  .update(`${trans_id}-${CPX_SECURE_HASH}`)
  .digest('hex');
```

## 📊 Database Schema

The integration creates a `cpx_transactions` table in Supabase:

```sql
CREATE TABLE cpx_transactions (
  id UUID PRIMARY KEY,
  transid TEXT NOT NULL,
  userid TEXT NOT NULL,
  amount_local DECIMAL(10, 4),
  amount_usd DECIMAL(10, 4),
  status INT,              -- 1 = completed, 2 = reversed
  type TEXT,               -- 'complete', 'out', 'bonus'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## 🧪 Testing Checklist

- [ ] `type=complete, status=1` → user gets credited
- [ ] Same `trans_id` sent twice → second one is ignored (duplicate prevention)
- [ ] `type=complete, status=2` → reversal processed (check 5% threshold)
- [ ] Invalid hash → returns 200 but user is NOT credited
- [ ] All responses return HTTP 200

## ⚠️ Important Notes

1. **ALWAYS returns HTTP 200** - prevents CPX retry storms
2. **Duplicate prevention** - same `trans_id` with `status=1` is rejected
3. **Reversal sharing** - reversals use the same `trans_id` as original completion
4. **5% reversal threshold** - good users (< 5% reversal rate) are not penalized
5. **Hash verification** - security check to prevent fake postbacks
