/**
 * AdGem Offerwall Postback Handler (S2S - GET Request)
 *
 * This endpoint receives postback notifications from AdGem when users complete offers.
 *
 * IMPORTANT: Configure this URL in AdGem Dashboard → Properties & Apps → Postback URL
 *
 * Postback URL Format:
 * https://www.rewardoxy.app/api/adgem-postback?amount={amount}&campaign_id={campaign_id}&conversion_datetime={conversion_datetime}&country={country}&goal_id={goal_id}&goal_name={goal_name}&ip={ip}&offer_name={offer_name}&payout={payout}&platform={platform}&player_id={player_id}&tracking_type={tracking_type}&transaction_id={transaction_id}
 *
 * Security:
 * - Postback Hashing: HMAC-SHA256 verification using Postback Key
 * - Duplicate prevention: Check transaction_id before crediting
 * - IP Logging: Log IP address for fraud detection
 *
 * Expected Response:
 * - HTTP 200: Postback received successfully
 * - Any other status: AdGem may retry
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function ok(message: string) {
  return new NextResponse(message, { status: 200 });
}

// AdGem coin exchange rate: 1 USD = 700 coins (same as GemiAd)
const ADGEM_EXCHANGE_RATE = parseInt(process.env.ADGEM_EXCHANGE_RATE || '700', 10);

async function handleAdgemPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[adgem-postback]', msg); };

  try {
    const url = new URL(request.url);

    // ── 0. Log request details ───────────────────────────────────────────
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    log(`Method: ${request.method}`);
    log(`IP: ${clientIp}`);

    // Log all query params
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    log(`All query params: ${JSON.stringify(allParams)}`);

    // ── 1. Extract AdGem parameters ──────────────────────────────────────
    const player_id = url.searchParams.get('player_id');
    const transaction_id = url.searchParams.get('transaction_id');
    const amount = url.searchParams.get('amount');
    const payout = url.searchParams.get('payout');
    const campaign_id = url.searchParams.get('campaign_id');
    const offer_name = url.searchParams.get('offer_name');
    const goal_id = url.searchParams.get('goal_id');
    const goal_name = url.searchParams.get('goal_name');
    const country = url.searchParams.get('country');
    const ip = url.searchParams.get('ip');
    const platform = url.searchParams.get('platform');
    const tracking_type = url.searchParams.get('tracking_type');
    const conversion_datetime = url.searchParams.get('conversion_datetime');
    const all_goals_completed = url.searchParams.get('all_goals_completed');
    const verifier = url.searchParams.get('verifier');
    const request_id = url.searchParams.get('request_id');

    log(`Parsed: player_id=${player_id}, transaction_id=${transaction_id}, amount=${amount}, payout=${payout}, offer_name=${offer_name}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!player_id || !transaction_id) {
      log(`Missing required params: player_id=${player_id}, transaction_id=${transaction_id}`);
      return ok('missing_params');
    }

    // ── 3. Postback Hash Verification (Security) ─────────────────────────
    const ADGEM_POSTBACK_KEY = process.env.ADGEM_POSTBACK_KEY;

    if (verifier && ADGEM_POSTBACK_KEY) {
      // Remove the verifier parameter from the URL
      const urlObj = new URL(request.url);
      urlObj.searchParams.delete('verifier');
      const urlWithoutVerifier = urlObj.toString();

      const expectedHash = crypto
        .createHmac('sha256', ADGEM_POSTBACK_KEY)
        .update(urlWithoutVerifier)
        .digest('hex');

      if (verifier !== expectedHash) {
        log(`HASH MISMATCH: received="${verifier}", expected="${expectedHash}"`);
        return ok('hash_mismatch');
      }
      log('Hash validation PASSED');
    } else if (!ADGEM_POSTBACK_KEY) {
      log('WARNING: ADGEM_POSTBACK_KEY not set — skipping hash verification');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const payoutNum = parseFloat(payout || '0');
    const amountNum = parseFloat(amount || '0');

    // Calculate coins: use payout (USD) * exchange rate, or fall back to amount
    let coinsToCredit = 0;
    if (payoutNum > 0) {
      coinsToCredit = Math.round(payoutNum * ADGEM_EXCHANGE_RATE);
    } else if (amountNum > 0) {
      coinsToCredit = Math.round(amountNum);
    }

    log(`Payout: $${payoutNum}, Amount: ${amountNum}, Coins to credit: ${coinsToCredit}`);

    if (coinsToCredit <= 0) {
      log('No coins to credit (payout and amount are 0 or negative)');
      return ok('zero_amount');
    }

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check for duplicate transaction ───────────────────────────────
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('provider', 'adgem')
      .eq('transaction_id', transaction_id)
      .limit(1);

    if (existing && existing.length > 0) {
      log(`DUPLICATE TRANSACTION IGNORED: transaction_id=${transaction_id}`);
      return ok('duplicate_ignored');
    }

    // ── 7. Verify user exists ────────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned, this_month_earnings')
      .eq('id', player_id)
      .single();

    if (userError || !userData) {
      log(`User not found: player_id=${player_id}, error=${userError?.message}`);
      return ok('user_not_found');
    }

    log(`User found: balance=${userData.coins_balance}, total_earned=${userData.total_earned}`);

    // ── 8. Credit user ───────────────────────────────────────────────────
    const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
      p_user_id: player_id,
      p_amount: coinsToCredit
    });

    if (creditError) {
      log(`Credit RPC failed: ${creditError.message}`);
      return ok('credit_failed');
    }

    const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
    const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
    log(`SUCCESS: Credited ${coinsToCredit} coins to user ${player_id}. New balance: ${newBalance}, New total: ${newTotal}`);

    // ── 9. Record completion ─────────────────────────────────────────────
    const { error: insertError } = await supabase
      .from('completions')
      .insert({
        user_id: player_id,
        provider: 'adgem',
        offer_id: campaign_id || 'unknown',
        offer_name: offer_name ? decodeURIComponent(offer_name) : 'AdGem Offer',
        coins_earned: coinsToCredit,
        payout_usd: payoutNum,
        transaction_id: transaction_id,
        status: 'completed',
        ip_address: ip || clientIp,
        metadata: {
          goal_id,
          goal_name,
          country,
          platform,
          tracking_type,
          conversion_datetime,
          all_goals_completed,
          request_id,
          amount: amountNum,
        }
      });

    if (insertError) {
      log(`Completion insert failed: ${insertError.message}`);
    } else {
      log('Completion recorded successfully');
    }

    // ── 10. Send notification to user ────────────────────────────────────
    const offerDisplayName = offer_name ? decodeURIComponent(offer_name) : 'an AdGem offer';
    await supabase.from('notifications').insert({
      user_id: player_id,
      title: 'Offer Completed!',
      message: `You earned ${coinsToCredit} coins for completing ${offerDisplayName}`,
      type: 'earning',
    });

    log('Notification sent');
    return ok('ok');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`Unexpected error: ${message}`);
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleAdgemPostback(request);
}
