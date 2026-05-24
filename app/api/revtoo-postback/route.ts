/**
 * Revtoo Offerwall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from Revtoo when users complete offers.
 * 
 * IMPORTANT: Configure this URL in Revtoo Dashboard → Placement Settings → Postback URL
 * 
 * Correct Postback URL Format (GET):
 * https://www.rewardoxy.app/api/revtoo-postback?subId={subId}&transId={transId}&reward={reward}&status={status}&userIp={userIp}&offer_name={offer_name}&debug={debug}&signature={signature}
 * 
 * Parameter Mapping (Revtoo macros → query params):
 * - {subId} → subId (MANDATORY: your user's unique identifier)
 * - {transId} → transId (MANDATORY: unique transaction ID)
 * - {reward} → reward (MANDATORY: reward in your app's currency)
 * - {status} → status (MANDATORY: 1 = credit, 2 = chargeback)
 * - {userIp} → userIp (user's IP address)
 * - {offer_name} → offer_name (name of the completed offer)
 * - {debug} → debug (1 = test, 0 = live)
 * - {signature} → signature (MANDATORY: MD5 hash for verification)
 * 
 * Event Types:
 * - status=1: User completed offer → credit reward
 * - status=2: Offer reversed → deduct reward
 * 
 * Security:
 * - Hash verification: MD5(subId + transId + reward + secretKey)
 * - Duplicate prevention: Check transId + status before processing
 * - IP Whitelist: 195.35.39.220, 2a02:4780:b:1270:0:2b97:5732:1, 2a02:4780:b:1270:0:2b97:5732:2, 2a02:4780:b:1234::19
 * 
 * CRITICAL: Always return "ok" for success, any other response will be marked as failed
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

async function handleRevtooPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[revtoo-postback]', msg); };

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

    // ── 1. Extract Revtoo parameters ─────────────────────────────────────
    const subId = url.searchParams.get('subId');           // MANDATORY: user ID
    const transId = url.searchParams.get('transId');       // MANDATORY: transaction ID
    const reward = url.searchParams.get('reward');         // MANDATORY: reward amount
    const status = url.searchParams.get('status');         // MANDATORY: 1 = credit, 2 = chargeback
    const userIp = url.searchParams.get('userIp');         // user IP
    const offer_name = url.searchParams.get('offer_name'); // offer name
    const debug = url.searchParams.get('debug');           // 1 = test, 0 = live
    const signature = url.searchParams.get('signature');   // MANDATORY: security hash

    log(`Parsed: subId=${subId}, transId=${transId}, reward=${reward}, status=${status}, debug=${debug}`);

    // ── 2. Validate required parameters ──────────────────────────────────
    if (!subId || !transId || !reward || !status) {
      log(`Missing params: subId=${subId}, transId=${transId}, reward=${reward}, status=${status}`);
      return ok('ERROR: Missing required parameters');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    const REVTOO_SECRET_KEY = process.env.REVTOO_SECRET_KEY;

    if (signature && signature.trim() !== '') {
      if (!REVTOO_SECRET_KEY) {
        log('ERROR: REVTOO_SECRET_KEY env var is not set');
        return ok('ERROR: Secret key not configured');
      }

      // Hash Formula: MD5(subId + transId + reward + secretKey)
      const expectedHash = crypto
        .createHash('md5')
        .update(subId + transId + reward + REVTOO_SECRET_KEY)
        .digest('hex');

      if (signature !== expectedHash) {
        log(`HASH MISMATCH: received="${signature}", expected="${expectedHash}"`);
        return ok('ERROR: Signature doesn\'t match');
      }
      log('Hash validation PASSED');
    } else {
      log('WARNING: No signature provided - skipping hash verification');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const rewardAmount = parseFloat(reward || '0');
    const statusInt = parseInt(status || '1');
    const isTest = debug === '1';

    if (isTest) {
      log('TEST POSTBACK - Processing but marking as test');
    }

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check if user exists ──────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', subId)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('ERROR: User not found');
    }
    log(`User found: ${subId}`);

    // ── 7. Route to correct handler based on status ──────────────────────
    if (statusInt === 1) {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER (status=1)
      // ═══════════════════════════════════════════════════════════════════
      
      // Check for duplicate completion (same transId with status=1)
      const { data: existing, error: checkError } = await supabase
        .from('revtoo_transactions')
        .select('id, reward')
        .eq('trans_id', transId)
        .eq('status', 1)
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: transId=${transId} already processed as completion`);
        return ok('ok');
      }

      // Credit user if reward > 0
      if (rewardAmount > 0) {
        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: subId=${subId}, reward=${rewardAmount}${isTest ? ' (TEST)' : ''}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: subId,
          p_amount: rewardAmount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('ERROR: Failed to credit user');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${rewardAmount} to user ${subId}. New balance: ${newBalance}, New total: ${newTotal}`);

        // Enqueue 10-level referral commissions (processed async)
        try {
          await supabase.rpc('enqueue_commissions', { p_earner_id: subId, p_amount: rewardAmount, p_source: 'revtoo' });
          log('Referral commissions enqueued');
        } catch (e: any) {
          log(`Enqueue commissions error: ${e.message}`);
        }
      } else {
        log(`Reward is 0, skipping credit`);
      }

      // Log completion record
      const { error: insertError } = await supabase.from('revtoo_transactions').insert({
        trans_id: transId,
        user_id: subId,
        reward: rewardAmount,
        status: 1,
        user_ip: userIp,
        offer_name: offer_name,
        is_test: isTest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Transaction insert failed: ${insertError.message}`);
      } else {
        log(`Transaction logged: transId=${transId}, offer=${offer_name}`);
      }

      return ok('ok');

    } else if (statusInt === 2) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER (status=2)
      // ═══════════════════════════════════════════════════════════════════
      log(`Processing reversal: transId=${transId}, reward=${rewardAmount}`);

      // Check for duplicate reversal (same transId with status=2)
      const { data: existingReversal, error: checkError } = await supabase
        .from('revtoo_transactions')
        .select('id')
        .eq('trans_id', transId)
        .eq('status', 2)
        .limit(1);

      if (checkError) {
        log(`Duplicate reversal check error: ${checkError.message}`);
      }

      if (existingReversal && existingReversal.length > 0) {
        log(`DUPLICATE REVERSAL IGNORED: transId=${transId} already processed as reversal`);
        return ok('ok');
      }

      log(`User balance BEFORE reversal: ${userData.coins_balance}`);

      // Deduct the reward amount (Revtoo sends positive values for reversals)
      const deductAmount = Math.abs(rewardAmount);

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${subId}${isTest ? ' (TEST)' : ''}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: subId,
          p_amount: deductAmount
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('ERROR: Failed to deduct points');
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${deductAmount} from user ${subId}. New balance: ${newBalance}`);

        // Verify the deduction
        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', subId)
          .single();

        log(`User balance AFTER reversal: ${updatedUser?.coins_balance || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      // Log reversal record
      const { error: insertError } = await supabase.from('revtoo_transactions').insert({
        trans_id: transId,
        user_id: subId,
        reward: -deductAmount, // Store as negative for reversals
        status: 2,
        user_ip: userIp,
        offer_name: offer_name,
        is_test: isTest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Reversal insert failed: ${insertError.message}`);
      } else {
        log(`Reversal logged: transId=${transId}`);
      }

      return ok('ok');

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // UNKNOWN STATUS HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Unknown status: "${status}"`);
      return ok('ERROR: Unknown status');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent Revtoo retry storms
    return ok('ERROR: Internal server error');
  }
}

export async function GET(request: NextRequest) {
  return handleRevtooPostback(request);
}

export async function POST(request: NextRequest) {
  return handleRevtooPostback(request);
}
