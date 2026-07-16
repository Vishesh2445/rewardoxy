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

async function handlePostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[adswedmedia-postback]', msg); };

  try {
    const url = new URL(request.url);
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => { allParams[key] = value; });
    log(`Params: ${JSON.stringify(allParams)}`);

    const subId = url.searchParams.get('subId');
    const transId = url.searchParams.get('transId');
    const reward = url.searchParams.get('reward');
    const payout = url.searchParams.get('payout');
    const signature = url.searchParams.get('signature');
    const status = url.searchParams.get('status');
    const offerId = url.searchParams.get('offer_id');
    const offerName = url.searchParams.get('offer_name');

    log(`Parsed: subId=${subId}, transId=${transId}, reward=${reward}, status=${status}`);

    if (!subId || !transId || reward === null || !signature || !status) {
      log(`Missing required params`);
      return ok('ERROR');
    }

    const ADSWSECRET = process.env.ADSWEDMEDIA_SECRET_KEY || 'Hj0Fy0Ay5En2Gq7';
    const expectedSig = crypto.createHash('md5').update(subId + transId + reward + ADSWSECRET).digest('hex');

    if (signature !== expectedSig) {
      log(`Signature mismatch: received=${signature}, expected=${expectedSig}`);
      return ok('ERROR');
    }
    log('Signature valid');

    const rewardNum = parseFloat(reward || '0');
    const payoutNum = parseFloat(payout || '0');
    const isCredit = status === '1';
    const isDeduct = status === '2';

    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('tx_id', transId)
      .eq('source', 'adswedmedia')
      .limit(1);

    if (existing && existing.length > 0) {
      log(`Duplicate: transId=${transId} already processed`);
      return ok('DUP');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', subId)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('ERROR');
    }

    log(`User balance BEFORE: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);

    if (isCredit && rewardNum > 0) {
      const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
        p_user_id: subId,
        p_amount: rewardNum
      });

      if (creditError) {
        log(`Credit failed: ${creditError.message}`);
        return ok('ERROR');
      }

      const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
      const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
      log(`SUCCESS: Credited ${rewardNum} to user ${subId}. New balance: ${newBalance}, New total: ${newTotal}`);

      try {
        await supabase.rpc('enqueue_commissions', { p_earner_id: subId, p_amount: rewardNum, p_source: 'adswedmedia' });
      } catch (_) {}

      const displayName = offerName ? decodeURIComponent(offerName) : 'an AdsWEDMedia offer';
      await supabase.from('notifications').insert({
        user_id: subId,
        title: 'Offer Completed!',
        message: `You earned ${rewardNum} coins for completing ${displayName}`,
        type: 'earning',
      }).then(null, () => {});
    } else if (isDeduct && rewardNum > 0) {
      log(`Deducting ${rewardNum} from user ${subId}`);
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
        p_userid: subId,
        p_amount: Math.floor(rewardNum)
      });

      if (deductError) {
        log(`Deduct failed: ${deductError.message}`);
        return ok('ERROR');
      }

      const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
      log(`SUCCESS: Deducted ${rewardNum} from user ${subId}. New balance: ${newBalance}`);
    }

    const { error: insertError } = await supabase.from('completions').insert({
      player_id: subId,
      program_id: offerName || 'AdsWEDMedia Offer',
      offer_name: offerName || null,
      payout_decimal: payoutNum,
      coins_awarded: isDeduct ? -rewardNum : rewardNum,
      source: 'adswedmedia',
      status: isCredit ? 'completed' : 'reversed',
      tx_id: transId,
    });

    if (insertError) {
      log(`Completion insert failed: ${insertError.message}`);
    } else {
      log('Completion recorded');
    }

    return ok('OK');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`ERROR: ${message}`);
    return ok('ERROR');
  }
}

export async function GET(request: NextRequest) {
  return handlePostback(request);
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}
