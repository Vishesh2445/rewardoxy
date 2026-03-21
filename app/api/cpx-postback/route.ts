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

function ok(body: Record<string, unknown>) {
  return NextResponse.json(body, { status: 200 });
}

async function handleCpxPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[cpx-postback]', msg); };

  try {
    const url = new URL(request.url);

    // 1. IP Whitelisting Validation (Optional but recommended by CPX)
    // CPX IPs: 188.40.3.73, 2a01:4f8:d0a:30ff::2, 157.90.97.92
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const allowedIps = ['188.40.3.73', '2a01:4f8:d0a:30ff::2', '157.90.97.92'];
    log(`Incoming request from IP: ${clientIp}`);

    // You can enable IP blocking here if needed:
    // if (clientIp && !allowedIps.includes(clientIp)) {
    //   return ok({ error: 'invalid_ip', logs });
    // }

    // 2. Extract CPX Research parameters
    const status = url.searchParams.get('status'); // 1 = completed, 2 = canceled
    const trans_id = url.searchParams.get('trans_id'); // Unique transaction ID
    const user_id = url.searchParams.get('user_id'); // Your User ID
    const amount_local = url.searchParams.get('amount_local'); // Amount in your currency (Coins)
    const amount_usd = url.searchParams.get('amount_usd'); // Amount in USD
    const type = url.searchParams.get('type');
    const hash = url.searchParams.get('hash'); // MD5 hash: md5(trans_id - yourappsecurehash)

    log(`Params: status=${status}, trans_id=${trans_id}, user_id=${user_id}, amount=${amount_local}, hash=${hash}`);

    // 3. Signature / Hash Validation
    const secureHashAppCode = process.env.CPX_SECURE_HASH; // You will obtain this from CPX Dashboard Expert Settings
    
    if (!secureHashAppCode) {
      log('CPX_SECURE_HASH env var is not set');
      // Uncomment to enforce security once CPX_SECURE_HASH is added to .env
      // return ok({ error: 'config_missing', logs });
    }

    if (secureHashAppCode && trans_id && hash) {
      const expectedHash = crypto.createHash('md5').update(`${trans_id}-${secureHashAppCode}`).digest('hex');
      if (expectedHash !== hash) {
        log(`Hash mismatch: got "${hash}", expected "${expectedHash}"`);
        return ok({ error: 'invalid_hash', logs });
      }
      log('Hash check passed.');
    } else {
      log('Skipped hash check (missing hash or trans_id or env variable).');
    }

    // Checking necessary parameters
    if (!user_id || !trans_id || !amount_local) {
      log(`Invalid tracking params`);
      return ok({ error: 'missing_params', logs });
    }

    const amountCoins = parseInt(amount_local, 10);
    const payoutUsd = parseFloat(amount_usd || '0');

    // 4. Initialize Supabase
    const supabase = getSupabase();

    // 5. Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok({ error: 'user_not_found', user_id, logs });
    }

    // 6. Handle Canceled/Chargeback Status (status = 2)
    if (status === '2') {
      log('Status is 2 (canceled/chargeback). Need to deduct coins if previously credited.');
      
      // We can implement deduct logic here using a modified RPC or updating balance directly.
      // Often, networks send trans_id that we already marked completed, we should reverse it.
      // As a basic implementation, we just deduct the amount:
      
      // Check if it was already deducted / reversed (we can track via a table)
      const { data: cancelExisting } = await supabase
          .from('completions')
          .select('id')
          .eq('player_id', user_id)
          .eq('program_id', `cpx_cancel_${trans_id}`)
          .limit(1);
          
      if (cancelExisting && cancelExisting.length > 0) {
          log('Duplicate cancel received');
          return ok({ status: 'duplicate_cancel', logs });
      }

      await supabase.rpc('credit_postback', {
        p_user_id: user_id,
        p_amount: -amountCoins, // negative amount to deduct
      });
      
      await supabase.from('completions').insert({
        player_id: user_id,
        program_id: `cpx_cancel_${trans_id}`,
        payout_decimal: -payoutUsd,
        coins_awarded: -amountCoins
      });

      return ok({ status: 'canceled_processed', trans_id, logs });
    }

    // 7. Handle Completed Status (status = 1)
    if (status !== '1') {
      log(`Unknown status: ${status}`);
      return ok({ error: 'unknown_status', logs });
    }

    // Duplicate check for completed transaction
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('player_id', user_id)
      .eq('program_id', `cpx_${trans_id}`) // Prefix CPX to avoid collisions
      .limit(1);

    if (existing && existing.length > 0) {
      log('Duplicate - already completed trans_id');
      return ok({ status: 'duplicate', trans_id, logs });
    }

    // Insert completion
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        player_id: user_id,
        program_id: `cpx_${trans_id}`,
        payout_decimal: payoutUsd,
        coins_awarded: amountCoins
      });

    if (completionError) {
      log(`Completion insert failed: ${completionError.message}`);
    }

    // Credit coins to user using Atomic RPC
    const { data: creditResult, error: creditError } = await supabase
      .rpc('credit_postback', {
        p_user_id: user_id,
        p_amount: amountCoins,
      });

    if (creditError) {
      log(`Credit RPC failed: ${creditError.message}`);
      return ok({ error: 'credit_failed', detail: creditError.message, logs });
    }

    log(`Credited ${amountCoins} coins to User ${user_id}.`);

    // 8. Referral commission logic
    const { data: userWithReferrer, error: referrerError } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', user_id)
      .single();

    if (!referrerError && userWithReferrer?.referred_by) {
      const commissionAmount = Math.round(amountCoins * 0.05); // 5%
      if (commissionAmount > 0) {
        await supabase.rpc('increment_pending_referral_earnings', {
          uid: userWithReferrer.referred_by,
          amount: commissionAmount,
        });
        log(`Added 5% commission (${commissionAmount}) to referral ${userWithReferrer.referred_by}`);
      }
    }

    return ok({
      status: 'success',
      trans_id,
      amount_credited: amountCoins,
      logs
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`Unexpected error: ${message}`);
    return ok({ error: 'unexpected', detail: message, logs });
  }
}

export async function GET(request: NextRequest) {
  return handleCpxPostback(request);
}

export async function POST(request: NextRequest) {
  return handleCpxPostback(request);
}
