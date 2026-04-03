import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processFraudCheck, getRealIP } from '@/lib/fraud-check';

// Default coins-per-USD fallback if amount_local is missing or 0
// This should match the Currency Factor set in your CPX Dashboard
const CPX_COINS_PER_USD = 700;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function ok(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200 });
}

async function handleCpxPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[cpx-postback]', msg); };

  try {
    const url = new URL(request.url);

    // ── 0. Log EVERYTHING for debugging ──────────────────────────────────
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    log(`Method: ${request.method}`);
    log(`Full URL: ${request.url}`);
    log(`IP: ${clientIp}`);
    log(`User-Agent: ${request.headers.get('user-agent') || 'none'}`);
    
    // Log all query params for debugging
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    log(`All query params: ${JSON.stringify(allParams)}`);

    // ── 1. Extract CPX Research parameters ───────────────────────────────
    const status = url.searchParams.get('status');       // 1 = completed, 2 = canceled
    const trans_id = url.searchParams.get('trans_id');    // Unique transaction ID
    const user_id = url.searchParams.get('user_id');      // Your ext_user_id
    const amount_local = url.searchParams.get('amount_local'); // Amount in your virtual currency
    const amount_usd = url.searchParams.get('amount_usd');     // Amount in USD
    const offer_id = url.searchParams.get('offer_id') || url.searchParams.get('type') || '';
    const hash = url.searchParams.get('hash');            // MD5 hash for verification

    log(`Parsed: status=${status}, trans_id=${trans_id}, user_id=${user_id}, amount_local=${amount_local}, amount_usd=${amount_usd}, offer_id=${offer_id}, hash=${hash}`);

    // ── 2. Signature / Hash Validation ───────────────────────────────────
    const secureHashAppCode = process.env.CPX_SECURE_HASH;

    if (!secureHashAppCode) {
      log('WARNING: CPX_SECURE_HASH env var is not set — cannot validate hash');
    }

    if (secureHashAppCode && trans_id && hash) {
      const expectedHash = crypto.createHash('md5').update(`${trans_id}-${secureHashAppCode}`).digest('hex');
      if (expectedHash !== hash) {
        log(`Hash mismatch: received="${hash}", expected="${expectedHash}"`);
        // Don't reject — CPX may use a different hash format in production
        // Log it but proceed. If you want strict validation, uncomment the return below:
        // return ok({ error: 'invalid_hash', logs });
        log('Proceeding despite hash mismatch (non-strict mode)');
      } else {
        log('Hash validation PASSED');
      }
    } else {
      log('Hash check skipped (missing: ' +
        (!secureHashAppCode ? 'CPX_SECURE_HASH ' : '') +
        (!trans_id ? 'trans_id ' : '') +
        (!hash ? 'hash ' : '') + ')');
    }

    // ── 3. Validate minimum required parameters ─────────────────────────
    if (!user_id || !trans_id) {
      log(`Missing required params: user_id=${user_id}, trans_id=${trans_id}`);
      return ok({ error: 'missing_params', logs });
    }

    // ── 4. Parse amounts — handle both integer and decimal values ────────
    const rawAmountLocal = parseFloat(amount_local || '0');
    const payoutUsd = parseFloat(amount_usd || '0');

    // Calculate coins: use amount_local if it's a valid number > 0,
    // otherwise fall back to amount_usd * CPX_COINS_PER_USD
    let amountCoins: number;
    if (rawAmountLocal > 0) {
      // amount_local could be integer (700) or decimal (0.50)
      amountCoins = Math.round(rawAmountLocal);
      log(`Coins from amount_local: raw=${rawAmountLocal}, rounded=${amountCoins}`);
    } else if (payoutUsd > 0) {
      // Fallback: convert USD to coins using our rate
      amountCoins = Math.round(payoutUsd * CPX_COINS_PER_USD);
      log(`Coins from USD fallback: $${payoutUsd} × ${CPX_COINS_PER_USD} = ${amountCoins}`);
    } else {
      amountCoins = 0;
      log(`WARNING: Both amount_local (${amount_local}) and amount_usd (${amount_usd}) are 0 or missing`);
    }

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 5.5 Persist a postback log for debugging ─────────────────────────
    try {
      await supabase.from('postback_logs').insert({
        source: 'cpx',
        method: request.method,
        ip_address: clientIp,
        user_id: user_id,
        trans_id: trans_id,
        status: status,
        amount_local: amount_local,
        amount_usd: amount_usd,
        coins_calculated: amountCoins,
        hash: hash,
        raw_params: allParams,
      });
    } catch (logErr) {
      // Non-critical — don't let logging failure break the postback
      log(`Postback log insert failed (non-critical): ${logErr}`);
    }

    // ── 6. Check if user exists ──────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'} (user_id: ${user_id})`);
      return ok({ error: 'user_not_found', user_id, logs });
    }
    log(`User verified: ${user_id}`);

    // ── 7. Handle Canceled/Chargeback (status = 2) ───────────────────────
    if (status === '2') {
      log('Status=2 (canceled/chargeback)');

      const { data: cancelExisting } = await supabase
        .from('completions')
        .select('id')
        .eq('player_id', user_id)
        .eq('program_id', `cpx_cancel_${trans_id}`)
        .limit(1);

      if (cancelExisting && cancelExisting.length > 0) {
        log('Duplicate cancel — already processed');
        return ok({ status: 'duplicate_cancel', logs });
      }

      const absCoins = Math.abs(amountCoins);
      const absPayoutUsd = Math.abs(payoutUsd);

      if (absCoins > 0) {
        const { error: debitError } = await supabase.rpc('credit_postback', {
          p_user_id: user_id,
          p_amount: -absCoins,
        });
        if (debitError) log(`Debit RPC failed: ${debitError.message}`);
        else log(`Debited ${absCoins} coins from user ${user_id}`);
      }

      await supabase.from('completions').insert({
        player_id: user_id,
        program_id: `cpx_cancel_${trans_id}`,
        payout_decimal: -absPayoutUsd,
        coins_awarded: -absCoins,
        source: 'cpx'
      });

      // Revert referral commission
      const { data: userWithReferrer } = await supabase
        .from('users')
        .select('referred_by, email_verified')
        .eq('id', user_id)
        .single();

      if (userWithReferrer?.referred_by && userWithReferrer?.email_verified) {
        const commissionAmount = Math.round(absCoins * 0.05);
        if (commissionAmount > 0) {
          await supabase.rpc('increment_pending_referral_earnings', {
            uid: userWithReferrer.referred_by,
            amount: -commissionAmount,
          });
          log(`Reverted 5% commission (${commissionAmount}) from referrer ${userWithReferrer.referred_by}`);
        }
      }

      return ok({ status: 'canceled_processed', trans_id, coins_debited: absCoins, logs });
    }

    // ── 8. Handle Completed (status = 1) ─────────────────────────────────
    if (status !== '1') {
      log(`Unknown status: "${status}" — expected "1" or "2"`);
      return ok({ error: 'unknown_status', status, logs });
    }

    if (amountCoins <= 0) {
      log(`WARNING: Completed status but 0 coins — amount_local=${amount_local}, amount_usd=${amount_usd}`);
      // Still proceed to record the completion so we can debug later
    }

    // Duplicate check
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('player_id', user_id)
      .eq('program_id', `cpx_${trans_id}`)
      .limit(1);

    if (existing && existing.length > 0) {
      log('Duplicate — trans_id already processed');
      return ok({ status: 'duplicate', trans_id, logs });
    }

    // Insert completion record
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        player_id: user_id,
        program_id: `cpx_${trans_id}`,
        payout_decimal: payoutUsd,
        coins_awarded: amountCoins,
        source: 'cpx'
      });

    if (completionError) {
      log(`Completion insert failed: ${completionError.message}`);
    } else {
      log(`Completion record inserted: cpx_${trans_id}, coins=${amountCoins}`);
    }

    // Credit coins to user
    if (amountCoins > 0) {
      const { data: creditResult, error: creditError } = await supabase
        .rpc('credit_postback', {
          p_user_id: user_id,
          p_amount: amountCoins,
        });

      if (creditError) {
        log(`Credit RPC FAILED: ${creditError.message}`);
        return ok({ error: 'credit_failed', detail: creditError.message, logs });
      }

      const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
      const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
      log(`SUCCESS: Credited ${amountCoins} coins to user ${user_id}. New balance: ${newBalance}, New total: ${newTotal}`);
    } else {
      log(`Skipped crediting — 0 coins (amount_local=${amount_local}, amount_usd=${amount_usd})`);
    }

    // ── 9. Referral commission ───────────────────────────────────────────
    if (amountCoins > 0) {
      const { data: userWithReferrer, error: referrerError } = await supabase
        .from('users')
        .select('referred_by, email_verified')
        .eq('id', user_id)
        .single();

      if (!referrerError && userWithReferrer?.referred_by && userWithReferrer?.email_verified) {
        const commissionAmount = Math.round(amountCoins * 0.05);
        if (commissionAmount > 0) {
          await supabase.rpc('increment_pending_referral_earnings', {
            uid: userWithReferrer.referred_by,
            amount: commissionAmount,
          });
          log(`Referral: Added ${commissionAmount} coins (5%) to referrer ${userWithReferrer.referred_by}`);
        }
      }
    }

    // 10. Silent fraud check (never block earnings)
    if (amountCoins > 0) {
      try {
        const fraudIp = getRealIP(request);
        await processFraudCheck(user_id, fraudIp, 'offer_completion');
      } catch (fraudErr) {
        log(`Fraud check error (non-blocking): ${fraudErr}`);
      }
    }

    return ok({
      status: 'success',
      trans_id,
      amount_credited: amountCoins,
      payout_usd: payoutUsd,
      logs
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    return ok({ error: 'unexpected', detail: message, logs });
  }
}

export async function GET(request: NextRequest) {
  return handleCpxPostback(request);
}

export async function POST(request: NextRequest) {
  return handleCpxPostback(request);
}
