import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRealIP } from '@/lib/fraud-check';

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

async function handleTimewallPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[timewall-postback]', msg); };

  try {
    const url = new URL(request.url);

    const clientIp = getRealIP(request);
    log(`Method: ${request.method}, IP: ${clientIp}`);

    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    log(`Params: ${JSON.stringify(allParams)}`);

    const userID = url.searchParams.get('userID');
    const transactionID = url.searchParams.get('transactionID');
    const revenue = url.searchParams.get('revenue');
    const currencyAmount = url.searchParams.get('currencyAmount');
    const hash = url.searchParams.get('hash');
    const ip = url.searchParams.get('ip');
    const type = url.searchParams.get('type');
    const withdrawid = url.searchParams.get('withdrawid');
    const reason = url.searchParams.get('reason');
    const offername = url.searchParams.get('offername');
    const offerdetail = url.searchParams.get('offerdetail');

    log(`Parsed: userID=${userID}, transactionID=${transactionID}, revenue=${revenue}, currencyAmount=${currencyAmount}, type=${type}`);

    if (!userID || !transactionID || revenue === null || currencyAmount === null) {
      log(`Missing required params: userID=${userID}, transactionID=${transactionID}, revenue=${revenue}, currencyAmount=${currencyAmount}`);
      return ok('missing_params');
    }

    const eventType = (type || 'credit').toLowerCase();

    const supabase = getSupabase();

    const revenueNum = parseFloat(revenue || '0');
    const currencyNum = parseFloat(currencyAmount || '0');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', userID)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('user_not_found');
    }
    log(`User found: ${userID}`);

    const TIMEWALL_IPS = ['51.81.120.73', '142.111.248.18'];
    const secretKey = process.env.TIMEWALL_SECRET_KEY || '96027c2be6efabbd7475266352964a8b';

    if (hash) {
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${userID}${revenue}${secretKey}`)
        .digest('hex')
        .toLowerCase();
      const receivedHash = hash.toLowerCase();

      if (expectedHash !== receivedHash) {
        log(`Hash mismatch: expected=${expectedHash}, received=${receivedHash}`);
        return ok('hash_mismatch');
      }
      log('Hash verified successfully');
    } else if (!TIMEWALL_IPS.includes(clientIp)) {
      log(`No hash and IP not whitelisted: ${clientIp}`);
      return ok('unauthorized');
    }

    const currencyInt = Math.round(Math.abs(currencyNum));

    if (eventType === 'credit') {
      const { data: existing, error: checkError } = await supabase
        .from('completions')
        .select('id, coins_awarded')
        .eq('player_id', userID)
        .eq('program_id', transactionID)
        .eq('source', 'timewall')
        .gt('coins_awarded', 0)
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: transactionID=${transactionID}`);
        return ok('duplicate');
      }

      if (currencyInt > 0) {
        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: userID=${userID}, currencyAmount=${currencyInt}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: userID,
          p_amount: currencyInt
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('credit_failed');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${currencyInt} to user ${userID}. New balance: ${newBalance}, New total: ${newTotal}`);
      } else {
        log(`currencyAmount is 0, skipping credit`);
      }

      const { error: insertError } = await supabase.from('completions').insert({
        player_id: userID,
        program_id: transactionID,
        payout_decimal: revenueNum,
        coins_awarded: currencyInt,
        source: 'timewall'
      });

      if (insertError) {
        log(`Completion insert failed: ${insertError.message}`);
      } else {
        log(`Completion logged: transactionID=${transactionID}, revenue=${revenueNum}, currency=${currencyInt}`);
      }

      try {
        await supabase.rpc('enqueue_commissions', { p_earner_id: userID, p_amount: currencyInt, p_source: 'timewall' });
        log('Referral commissions enqueued');
      } catch (e: any) {
        log(`Enqueue commissions error: ${e.message}`);
      }

      return ok('approved');

    } else if (eventType === 'chargeback') {
      log(`Processing chargeback: transactionID=${transactionID}, revenue=${revenueNum}`);

      log(`User balance BEFORE reversal: ${userData.coins_balance}`);

      const deductAmount = currencyInt;

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${userID}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: userID,
          p_amount: deductAmount
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('deduct_failed');
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${deductAmount} from user ${userID}. New balance: ${newBalance}`);

        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', userID)
          .single();

        log(`User balance AFTER reversal: ${updatedUser?.coins_balance || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      const { error: insertError } = await supabase.from('completions').insert({
        player_id: userID,
        program_id: transactionID,
        payout_decimal: -Math.abs(revenueNum),
        coins_awarded: -deductAmount,
        source: 'timewall'
      });

      if (insertError) {
        log(`Reversal insert failed: ${insertError.message}`);
      } else {
        log(`Reversal logged: transactionID=${transactionID}`);
      }

      return ok('approved');

    } else if (eventType === 'hold') {
      log(`Hold notification: transactionID=${transactionID}, reason=${reason || 'none'}`);

      const { error: insertError } = await supabase.from('completions').insert({
        player_id: userID,
        program_id: transactionID,
        payout_decimal: revenueNum,
        coins_awarded: 0,
        source: 'timewall'
      });

      if (insertError) {
        log(`Hold insert failed: ${insertError.message}`);
      } else {
        log(`Hold logged: transactionID=${transactionID}`);
      }

      return ok('approved');

    } else if (eventType === 'hold_cancelled') {
      log(`Hold cancelled: transactionID=${transactionID}`);

      const { data: existing } = await supabase
        .from('completions')
        .select('id')
        .eq('player_id', userID)
        .eq('program_id', transactionID)
        .eq('source', 'timewall')
        .limit(1);

      if (existing && existing.length > 0) {
        const { error: deleteError } = await supabase
          .from('completions')
          .delete()
          .eq('id', existing[0].id);

        if (deleteError) {
          log(`Hold deletion failed: ${deleteError.message}`);
        } else {
          log(`Hold record deleted: transactionID=${transactionID}`);
        }
      } else {
        log(`No hold record found for transactionID=${transactionID}`);
      }

      return ok('approved');

    } else {
      log(`Unknown event type: "${type}"`);
      return ok('unknown_type');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleTimewallPostback(request);
}

export async function POST(request: NextRequest) {
  return handleTimewallPostback(request);
}
