import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

async function handlePostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[postback]', msg); };

  try {
    const url = new URL(request.url);

    // 1. Signature check
    const sig = request.headers.get('x-signature') ||
               url.searchParams.get('sig') ||
               url.searchParams.get('mll') || '';

    const secret = process.env.POSTBACK_SECRET;
    if (!secret) {
      log('POSTBACK_SECRET env var is not set');
      return ok({ error: 'config_missing', detail: 'POSTBACK_SECRET not set', logs });
    }
    if (sig !== secret) {
      log(`Signature mismatch: got "${sig}", expected "${secret.slice(0, 3)}..."`);
      return ok({ error: 'invalid_signature', logs });
    }
    log('Signature OK');

    // 2. Parse params — MyLead sends uid, but also accept player_id for manual testing
    const player_id = url.searchParams.get('uid') || url.searchParams.get('player_id');
    const payout = parseFloat(url.searchParams.get('payout') || '0');
    const program_id = url.searchParams.get('program_id') || 'unknown';

    if (!player_id || payout <= 0) {
      log(`Invalid params: player_id=${player_id}, payout=${payout}`);
      return ok({ error: 'invalid_params', player_id, payout, logs });
    }

    const amount = Math.round(payout);
    log(`Params: player_id=${player_id}, program_id=${program_id}, payout=${payout}, amount=${amount}`);

    // 3. Init Supabase
    const supabase = getSupabase();
    log('Supabase client created');

    // 4. Check if user exists (only select id to avoid missing column errors)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', player_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok({ error: 'user_not_found', player_id, detail: userError?.message, logs });
    }
    log('User found');

    // 5. Duplicate check against completions
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('player_id', player_id)
      .eq('program_id', program_id)
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message} (code: ${checkError.code})`);
      // Table might not exist - continue anyway and try direct credit
    } else if (existing && existing.length > 0) {
      log('Duplicate - already completed');
      return ok({ status: 'duplicate', player_id, program_id, logs });
    } else {
      log('No duplicate found');
    }

    // 6. Try inserting completion record
    let completionInserted = false;
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        player_id,
        program_id,
        payout_decimal: payout,
        coins_awarded: amount
      });

    if (completionError) {
      log(`Completion insert failed: ${completionError.message} (code: ${completionError.code})`);
      // Don't return - still try to credit coins
    } else {
      completionInserted = true;
      log('Completion inserted');
    }

    // 7. Credit coins — atomic SQL: coins_balance = coins_balance + amount
    let credited = false;
    let creditMethod = 'none';

    const { data: creditResult, error: creditError } = await supabase
      .rpc('credit_postback', {
        p_user_id: player_id,
        p_amount: amount,
      });

    if (creditError) {
      log(`credit_postback RPC failed: ${creditError.message} (code: ${creditError.code})`);
      return ok({ error: 'credit_failed', detail: creditError.message, logs });
    }

    credited = true;
    creditMethod = 'atomic_rpc';
    const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
    const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
    log(`Credited ${amount} coins. New balance: ${newBalance}, New total: ${newTotal}`);

    // 8. Check for referrer and award 5% commission if referrer exists and referred user has verified email
    const { data: userWithReferrer, error: referrerError } = await supabase
      .from('users')
      .select('referred_by, email_verified')
      .eq('id', player_id)
      .single();

    if (!referrerError && userWithReferrer?.referred_by && userWithReferrer?.email_verified === true) {
      // Award 5% commission to referrer
      const commissionAmount = Math.round(amount * 0.05);
      if (commissionAmount > 0) {
        const { error: commissionError } = await supabase.rpc('increment_coins', {
          uid: userWithReferrer.referred_by,
          amount: commissionAmount,
        });
        if (commissionError) {
          log(`Referral commission failed: ${commissionError.message}`);
        } else {
          log(`Referral commission: ${commissionAmount} coins awarded to referrer ${userWithReferrer.referred_by}`);
        }
      }
    } else if (userWithReferrer?.referred_by && userWithReferrer?.email_verified !== true) {
      log(`Referral commission skipped: referred user email not verified`);
    }

    // 9. Verify
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', player_id)
      .single();

    if (verifyError) {
      log(`Verification query failed: ${verifyError.message}`);
    } else {
      log(`Verification: user row = ${JSON.stringify(verifyData)}`);
    }

    return ok({
      status: 'success',
      player_id,
      program_id,
      payout,
      amount_credited: amount,
      completion_inserted: completionInserted,
      credit_method: creditMethod,
      user_row: verifyData,
      logs
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`Unexpected error: ${message}`);
    return ok({ error: 'unexpected', detail: message, logs });
  }
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

export async function GET(request: NextRequest) {
  return handlePostback(request);
}
