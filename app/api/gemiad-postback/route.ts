/**
 * GemiAd Offerwall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from GemiAd when users complete offers
 * or when transactions are reversed.
 * 
 * IMPORTANT: Configure this URL in GemiAd Dashboard → Placement Settings → Postback URL
 * 
 * Correct Postback URL Format:
 * https://rewardoxy.app/api/gemiad-postback?userId={USER_ID}&offerId={OFFER_ID}&offerName={OFFER_NAME}&eventId={EVENT_ID}&eventName={EVENT_NAME}&payout={PAYOUT}&reward={REWARD}&txid={TXID}&status={STATUS}&ip={IPADDR}&sub1={SUB1}&sub2={SUB2}&hash={HASH}
 * 
 * Parameter Mapping (GemiAd macros → query params):
 * - {USER_ID} → userId (MANDATORY: your user's unique identifier)
 * - {OFFER_ID} → offerId (MANDATORY: offer identifier)
 * - {OFFER_NAME} → offerName (offer name)
 * - {EVENT_ID} → eventId (event ID for multi-event offers)
 * - {EVENT_NAME} → eventName (event name for multi-event offers)
 * - {PAYOUT} → payout (MANDATORY: total payout in USD, negative for reversals)
 * - {REWARD} → reward (MANDATORY: reward in your app's currency based on exchange rate, negative for reversals)
 * - {TXID} → txid (MANDATORY: unique transaction ID, same for original + reversal)
 * - {STATUS} → status (MANDATORY: "completed" or "rejected")
 * - {IPADDR} → ip (user's IP address)
 * - {SUB1} → sub1 (optional: source ID from tracking URL)
 * - {SUB2} → sub2 (optional: subsource ID from tracking URL)
 * - {HASH} → hash (MANDATORY: SHA-256 security hash for verification)
 * 
 * Event Types:
 * - status=completed: User completed offer → credit reward (in app currency)
 * - status=rejected: Offer reversed → deduct reward (reward will be negative)
 * 
 * Security:
 * - Hash verification: SHA256(userId + offerId + txid + secretKey)
 * - Duplicate prevention: Check txid + status before processing
 * - Server IP: All postbacks come from 64.226.92.208
 * 
 * CRITICAL: Always return HTTP 200 with "Approved" or "Unauthorized"
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

async function handleGemiadPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[gemiad-postback]', msg); };

  try {
    const url = new URL(request.url);

    // ── 0. Log basic request info ────────────────────────────────────────
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    log(`Method: ${request.method}, IP: ${clientIp}`);

    // Log all query params
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    log(`Params: ${JSON.stringify(allParams)}`);

    // ── 1. Extract GemiAd parameters ─────────────────────────────────────
    const userId = url.searchParams.get('userId');           // MANDATORY: user ID
    const offerId = url.searchParams.get('offerId');         // MANDATORY: offer ID
    const offerName = url.searchParams.get('offerName');     // offer name
    const eventId = url.searchParams.get('eventId');         // event ID (multi-event)
    const eventName = url.searchParams.get('eventName');     // event name (multi-event)
    const payout = url.searchParams.get('payout');           // MANDATORY: USD payout
    const reward = url.searchParams.get('reward');           // MANDATORY: app currency reward
    const txid = url.searchParams.get('txid');               // MANDATORY: transaction ID
    const status = url.searchParams.get('status');           // MANDATORY: "completed" or "rejected"
    const ip = url.searchParams.get('ip');                   // user IP
    const sub1 = url.searchParams.get('sub1');               // optional sub param
    const sub2 = url.searchParams.get('sub2');               // optional sub param
    const hash = url.searchParams.get('hash');               // MANDATORY: security hash

    log(`Parsed: userId=${userId}, txid=${txid}, reward=${reward}, status=${status}`);

    // ── 2. Validate required parameters ──────────────────────────────────
    if (!userId || !offerId || !txid || !status || !hash) {
      log(`Missing params: userId=${userId}, offerId=${offerId}, txid=${txid}, status=${status}, hash=${hash}`);
      return ok('Unauthorized');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    const GEMIAD_SECRET_KEY = process.env.GEMIAD_SECRET_KEY;

    if (!GEMIAD_SECRET_KEY) {
      log('ERROR: GEMIAD_SECRET_KEY env var is not set');
      return ok('Unauthorized');
    }

    // Hash Formula: SHA256(userId + offerId + txid + secretKey)
    const expectedHash = crypto
      .createHash('sha256')
      .update(userId + offerId + txid + GEMIAD_SECRET_KEY)
      .digest('hex');

    if (hash !== expectedHash) {
      log(`HASH MISMATCH: received="${hash}", expected="${expectedHash}"`);
      return ok('Unauthorized');
    }
    log('Hash validation PASSED');

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const rewardAmount = parseFloat(reward || '0');
    const payoutAmount = parseFloat(payout || '0');
    const statusLower = status?.toLowerCase() || '';
    const isCompleted = statusLower === 'completed';
    const isRejected = statusLower === 'rejected';

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check if user exists ──────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('Unauthorized');
    }
    log(`User found: ${userId}`);

    // ── 7. Route to correct handler based on status ──────────────────────
    if (isCompleted) {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER (status=completed)
      // ═══════════════════════════════════════════════════════════════════
      
      // Check for duplicate completion (same txid with status=completed)
      const { data: existing, error: checkError } = await supabase
        .from('gemiad_transactions')
        .select('id, reward')
        .eq('txid', txid)
        .eq('status', 'completed')
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: txid=${txid} already processed as completion`);
        return ok('Approved');
      }

      // Credit user if reward > 0
      if (rewardAmount > 0) {
        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: userId=${userId}, reward=${rewardAmount}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: userId,
          p_amount: rewardAmount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('Unauthorized');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${rewardAmount} to user ${userId}. New balance: ${newBalance}, New total: ${newTotal}`);
      } else {
        log(`Reward is 0, skipping credit`);
      }

      // Log completion record
      const { error: insertError } = await supabase.from('gemiad_transactions').insert({
        txid: txid,
        user_id: userId,
        offer_id: offerId,
        offer_name: offerName,
        event_id: eventId,
        event_name: eventName,
        payout: payoutAmount,
        reward: rewardAmount,
        status: 'completed',
        ip_address: ip,
        sub1: sub1,
        sub2: sub2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Transaction insert failed: ${insertError.message}`);
      } else {
        log(`Transaction logged: txid=${txid}, offer=${offerName}`);
      }

      // Check for referrer and add 5% commission
      const { data: userWithReferrer, error: referrerError } = await supabase
        .from('users')
        .select('referred_by, email_verified')
        .eq('id', userId)
        .single();

      if (!referrerError && userWithReferrer?.referred_by && userWithReferrer?.email_verified) {
        const commissionAmount = Math.round(rewardAmount * 0.05);
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

      return ok('Approved');

    } else if (isRejected) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER (status=rejected)
      // ═══════════════════════════════════════════════════════════════════
      log(`Processing reversal: txid=${txid}, reward=${rewardAmount}`);

      // Check for duplicate reversal (same txid with status=rejected)
      const { data: existingReversal, error: checkError } = await supabase
        .from('gemiad_transactions')
        .select('id')
        .eq('txid', txid)
        .eq('status', 'rejected')
        .limit(1);

      if (checkError) {
        log(`Duplicate reversal check error: ${checkError.message}`);
      }

      if (existingReversal && existingReversal.length > 0) {
        log(`DUPLICATE REVERSAL IGNORED: txid=${txid} already processed as reversal`);
        return ok('Approved');
      }

      log(`User balance BEFORE reversal: ${userData.coins_balance}`);

      // GemiAd sends negative reward for reversals, so we use absolute value
      const deductAmount = Math.abs(rewardAmount);

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${userId}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: userId,
          p_amount: Math.floor(deductAmount)
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('Unauthorized');
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${deductAmount} from user ${userId}. New balance: ${newBalance}`);

        // Verify the deduction
        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', userId)
          .single();

        log(`User balance AFTER reversal: ${updatedUser?.coins_balance || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      // Log reversal record (with negative reward)
      const { error: insertError } = await supabase.from('gemiad_transactions').insert({
        txid: txid,
        user_id: userId,
        offer_id: offerId,
        offer_name: offerName,
        event_id: eventId,
        event_name: eventName,
        payout: -Math.abs(payoutAmount),
        reward: -deductAmount,
        status: 'rejected',
        ip_address: ip,
        sub1: sub1,
        sub2: sub2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Reversal insert failed: ${insertError.message}`);
      } else {
        log(`Reversal logged: txid=${txid}`);
      }

      return ok('Approved');

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // UNKNOWN STATUS HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Unknown status: "${status}"`);
      return ok('Unauthorized');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent GemiAd retry storms
    return ok('Unauthorized');
  }
}

export async function GET(request: NextRequest) {
  return handleGemiadPostback(request);
}

export async function POST(request: NextRequest) {
  return handleGemiadPostback(request);
}
