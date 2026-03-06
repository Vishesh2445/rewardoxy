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

    // 2. Parse params
    const player_id = url.searchParams.get('player_id');
    const payout = parseFloat(url.searchParams.get('payout') || '0');
    const program_id = url.searchParams.get('program_id') || 'unknown';

    if (!player_id || payout <= 0) {
      log(`Invalid params: player_id=${player_id}, payout=${payout}`);
      return ok({ error: 'invalid_params', player_id, payout, logs });
    }

    const coins = Math.floor(payout * 80);
    log(`Params: player_id=${player_id}, program_id=${program_id}, payout=${payout}, coins=${coins}`);

    // 3. Init Supabase
    const supabase = getSupabase();
    log('Supabase client created');

    // 4. Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance')
      .eq('id', player_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok({ error: 'user_not_found', player_id, detail: userError?.message, logs });
    }
    log(`User found: coins_balance=${userData.coins_balance}`);

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
        payout,
        coins_earned: coins,
        offer_name: `Program ${program_id}`
      });

    if (completionError) {
      log(`Completion insert failed: ${completionError.message} (code: ${completionError.code})`);
      // Don't return - still try to credit coins
    } else {
      completionInserted = true;
      log('Completion inserted');
    }

    // 7. Credit coins - try RPC first, fall back to direct update
    let credited = false;

    const { error: rpcError } = await supabase.rpc('increment_coins', {
      p_user_id: player_id,
      p_amount: coins
    });

    if (rpcError) {
      log(`RPC increment_coins failed: ${rpcError.message} (code: ${rpcError.code})`);

      // Fallback: direct SQL update
      log('Trying direct update fallback...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ coins_balance: userData.coins_balance + coins })
        .eq('id', player_id);

      if (updateError) {
        log(`Direct update also failed: ${updateError.message}`);
        return ok({ error: 'credit_failed_all_methods', logs });
      }
      credited = true;
      log(`Direct update succeeded: ${userData.coins_balance} + ${coins} = ${userData.coins_balance + coins}`);
    } else {
      credited = true;
      log('RPC increment_coins succeeded');
    }

    // 8. Verify the credit actually worked
    const { data: verifyData } = await supabase
      .from('users')
      .select('coins_balance')
      .eq('id', player_id)
      .single();

    log(`Verification: coins_balance is now ${verifyData?.coins_balance}`);

    return ok({
      status: 'success',
      player_id,
      program_id,
      payout,
      coins_credited: coins,
      completion_inserted: completionInserted,
      coins_credited_via: credited ? (rpcError ? 'direct_update' : 'rpc') : 'none',
      new_balance: verifyData?.coins_balance,
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
