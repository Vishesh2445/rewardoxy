/**
 * VortexWall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from VortexWall when users complete offers
 * or when transactions are reversed.
 * 
 * IMPORTANT: Configure this URL in VortexWall Dashboard → Placement → Callback Settings
 * 
 * Correct Postback URL Format:
 * https://rewardoxy.app/api/vortex-postback?identity_id={IDENTITY_ID}&campaign_id={CAMPAIGN_ID}&campaign_name={CAMPAIGN_NAME}&event_id={EVENT_ID}&event_name={EVENT_NAME}&payout={PAYOUT}&points={POINTS}&txid={TXID}&result={RESULT}&ipaddr={IPADDR}&sub1={SUB1}&sub2={SUB2}
 * 
 * Parameter Mapping:
 * - {IDENTITY_ID} → identity_id (MANDATORY: user ID)
 * - {CAMPAIGN_ID} → campaign_id (MANDATORY: campaign identifier)
 * - {CAMPAIGN_NAME} → campaign_name (campaign name)
 * - {EVENT_ID} → event_id (event identifier for multi-event campaigns)
 * - {EVENT_NAME} → event_name (event name for multi-event campaigns)
 * - {PAYOUT} → payout (USD payout amount)
 * - {POINTS} → points (reward points - THIS is what we credit to user)
 * - {TXID} → txid (MANDATORY: unique transaction ID)
 * - {RESULT} → result (MANDATORY: "completed" or "rejected")
 * - {IPADDR} → ipaddr (user's IP address)
 * - {SUB1} → sub1 (optional sub parameter 1)
 * - {SUB2} → sub2 (optional sub parameter 2)
 * 
 * Event Types:
 * - result=completed: User completed offer → credit points
 * - result=rejected: Offer reversed → deduct points (points will be negative)
 * 
 * Security:
 * - IP whitelisting: Only accepts requests from 157.230.103.196 (VortexWall server)
 * - Duplicate prevention: Check txid before processing
 * 
 * CRITICAL: Always return HTTP 200 with "Approved" or "Unauthorized", never "error" or "fail"
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
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

async function handleVortexPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[vortex-postback]', msg); };

  try {
    const url = new URL(request.url);

    // ── 0. Log EVERYTHING for debugging ──────────────────────────────────
    const clientIp = getRealIP(request);
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

    // ── 1. Extract VortexWall parameters ─────────────────────────────────
    const identity_id = url.searchParams.get('identity_id');     // MANDATORY: user ID
    const campaign_id = url.searchParams.get('campaign_id');     // MANDATORY: campaign ID
    const campaign_name = url.searchParams.get('campaign_name'); // campaign name
    const event_id = url.searchParams.get('event_id');           // event ID (multi-event)
    const event_name = url.searchParams.get('event_name');       // event name (multi-event)
    const payout = url.searchParams.get('payout');               // USD payout
    const points = url.searchParams.get('points');               // MANDATORY: reward points
    const txid = url.searchParams.get('txid');                   // MANDATORY: transaction ID
    const result = url.searchParams.get('result');               // MANDATORY: "completed" or "rejected"
    const ipaddr = url.searchParams.get('ipaddr');               // user IP
    const sub1 = url.searchParams.get('sub1');                   // optional sub param
    const sub2 = url.searchParams.get('sub2');                   // optional sub param

    log(`Parsed: identity_id=${identity_id}, campaign_id=${campaign_id}, txid=${txid}, points=${points}, result=${result}`);

    // ── 2. IP Whitelisting (Security — VortexWall IP only) ───────────────
    const VORTEX_IP = '157.230.103.196';
    
    if (clientIp !== VORTEX_IP) {
      log(`IP NOT WHITELISTED: received="${clientIp}", expected="${VORTEX_IP}"`);
      return ok('Unauthorized');
    }
    log('IP whitelisting PASSED');

    // ── 3. Validate minimum required parameters ─────────────────────────
    if (!identity_id || !campaign_id || !txid || !result || points === null) {
      log(`Missing required params: identity_id=${identity_id}, campaign_id=${campaign_id}, txid=${txid}, result=${result}, points=${points}`);
      return ok('Unauthorized');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const pointsAmount = parseFloat(points || '0');
    const payoutAmount = parseFloat(payout || '0');
    const isCompleted = result === 'completed';
    const isRejected = result === 'rejected';

    log(`Parsed: points=${pointsAmount}, payout=${payoutAmount}, result=${result}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check if user exists ──────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', identity_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('Unauthorized');
    }
    log(`User found: ${identity_id}`);

    // ── 7. Route to correct handler based on result ──────────────────────
    if (isCompleted) {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER (result=completed)
      // ═══════════════════════════════════════════════════════════════════
      
      // Check for duplicate completion (same txid with positive coins)
      // Note: We store txid in program_id field for duplicate checking
      const { data: existing, error: checkError } = await supabase
        .from('completions')
        .select('id, coins_awarded')
        .eq('player_id', identity_id)
        .eq('program_id', txid) // Use txid for duplicate check
        .eq('source', 'vortex')
        .gt('coins_awarded', 0) // Only check positive completions
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: txid=${txid} already processed as completion`);
        return ok('Approved');
      }

      // Credit user if points > 0
      if (pointsAmount > 0) {
        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: identity_id=${identity_id}, points=${pointsAmount}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: identity_id,
          p_amount: pointsAmount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('Unauthorized');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${pointsAmount} to user ${identity_id}. New balance: ${newBalance}, New total: ${newTotal}`);
      } else {
        log(`Points is 0, skipping credit`);
      }

      // Log completion record (store txid in program_id for duplicate checking)
      const { error: insertError } = await supabase.from('completions').insert({
        player_id: identity_id,
        program_id: txid, // Store txid here for duplicate checking
        payout_decimal: payoutAmount,
        coins_awarded: pointsAmount,
        source: 'vortex'
      });

      if (insertError) {
        log(`Completion insert failed: ${insertError.message}`);
      } else {
        log(`Completion logged: txid=${txid}, campaign=${campaign_id}`);
      }

      // Check for referrer and add 5% commission
      const { data: userWithReferrer, error: referrerError } = await supabase
        .from('users')
        .select('referred_by, email_verified')
        .eq('id', identity_id)
        .single();

      if (!referrerError && userWithReferrer?.referred_by && userWithReferrer?.email_verified) {
        const commissionAmount = Math.round(pointsAmount * 0.05);
        if (commissionAmount > 0) {
          const { error: commissionError } = await supabase.rpc('increment_pending_referral_earnings', {
            uid: userWithReferrer.referred_by,
            amount: commissionAmount,
          });
          if (commissionError) {
            log(`Referral commission failed: ${commissionError.message}`);
          } else {
            log(`Referral commission: ${commissionAmount} coins added to pending earnings for referrer ${userWithReferrer.referred_by}`);
          }
        }
      }

      // NOTE: NO fraud check for VortexWall postbacks
      // The IP (157.230.103.196) is VortexWall's server, not the user's real IP
      // Running fraud check would incorrectly flag users as VPN/country mismatch

      return ok('Approved');

    } else if (isRejected) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER (result=rejected)
      // ═══════════════════════════════════════════════════════════════════
      log(`REVERSAL: txid=${txid}, identity_id=${identity_id}, points=${pointsAmount}`);

      // Check if this exact reversal was already processed (same txid with negative coins)
      const { data: existingReversal } = await supabase
        .from('completions')
        .select('id, coins_awarded')
        .eq('player_id', identity_id)
        .eq('program_id', txid) // Check by txid
        .eq('source', 'vortex')
        .lt('coins_awarded', 0) // Only check negative reversals
        .limit(1);

      if (existingReversal && existingReversal.length > 0) {
        log(`REVERSAL ALREADY PROCESSED: txid=${txid} already exists as reversal`);
        return ok('Approved');
      }

      log(`User balance BEFORE reversal: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);

      // VortexWall sends negative points for reversals, so we use absolute value
      const deductAmount = Math.abs(pointsAmount);

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${identity_id}`);

        const { error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: identity_id,
          p_amount: deductAmount
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('Unauthorized');
        }

        log(`SUCCESS: Deducted ${deductAmount} from user ${identity_id}`);

        // Verify the deduction
        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', identity_id)
          .single();

        log(`User balance AFTER reversal: coins=${updatedUser?.coins_balance || 0}, total_earned=${updatedUser?.total_earned || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      // Log reversal record (with negative points, store txid in program_id)
      const { error: insertError } = await supabase.from('completions').insert({
        player_id: identity_id,
        program_id: txid, // Store txid here for duplicate checking
        payout_decimal: -Math.abs(payoutAmount),
        coins_awarded: -deductAmount,
        source: 'vortex'
      });

      if (insertError) {
        log(`Reversal insert failed: ${insertError.message}`);
      } else {
        log(`REVERSAL PROCESSED: txid=${txid}, campaign=${campaign_id} logged`);
      }

      return ok('Approved');

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // UNKNOWN RESULT HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Unknown result: ${result}`);
      return ok('Unauthorized');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent VortexWall retry storms
    return ok('Unauthorized');
  }
}

export async function GET(request: NextRequest) {
  return handleVortexPostback(request);
}

export async function POST(request: NextRequest) {
  return handleVortexPostback(request);
}
