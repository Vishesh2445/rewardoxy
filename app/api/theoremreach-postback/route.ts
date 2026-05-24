/**
 * TheoremReach Surveywall Postback Handler (S2S)
 *
 * This endpoint receives postback notifications from TheoremReach when users complete surveys
 * or when transactions are reversed.
 *
 * IMPORTANT: Configure this URL in TheoremReach Publisher Dashboard → Integration Settings
 *
 * Reward Callback URL:
 * https://www.rewardoxy.app/api/theoremreach-postback?reward={reward}&currency={currency}&user_id={user_id}&tx_id={tx_id}&hash={hash}&reversal={reversal}&debug={debug}&screenout={screenout}&profiler={profiler}&offer={offer}&offer_name={offer_name}&ip={ip}&offer_id={offer_id}&placement_id={placement_id}
 *
 * Parameter Mapping (TheoremReach macros → query params):
 * - {reward} → reward (MANDATORY: amount in in-app currency that should be rewarded)
 * - {currency} → currency (amount in US currency being paid, floating point)
 * - {user_id} → user_id (MANDATORY: user ID - can be overridden with parameter=xyz)
 * - {tx_id} → tx_id (MANDATORY: unique TheoremReach transaction ID)
 * - {hash} → hash (MANDATORY: SHA-1 hash for verification)
 * - {reversal} → reversal (optional: "true" if callback is for a reversal - negative transaction)
 * - {debug} → debug (optional: "true" if testing - ignore this callback)
 * - {screenout} → screenout (optional: 1=true/2=false - user was screened out)
 * - {profiler} → profiler (optional: 1=true/2=false - user completed profiler)
 * - {offer} → offer (optional: "true" if reward is for offer rather than survey)
 * - {offer_name} → offer_name (optional: name of the offer)
 * - {ip} → ip (optional: user's IP address)
 * - {offer_id} → offer_id (optional: survey or offer ID)
 * - {placement_id} → placement_id (optional: placement ID)
 *
 * Event Types:
 * - Normal completion: reward > 0, reversal != true → credit reward
 * - Screenout: reward > 0, screenout = 1 → partial reward (user was screened out)
 * - Profiler: profiler = 1 → user completed profiler (bonus if configured)
 * - Reversal: reversal = true → deduct reward (negative transaction)
 * - Debug: debug = true → IGNORE this callback (testing only)
 *
 * Security:
 * - Hash verification: SHA-1 HMAC signature validation
 * - Duplicate prevention: Check tx_id before processing
 * - Debug mode: Ignore callbacks with debug=true
 *
 * CRITICAL: Always return HTTP 200, never 4xx or 5xx (prevents retry storms)
 * Respond with "Approved" for success, "Rejected" for failure
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

/**
 * Reconstructs the base URL from query parameters for hash verification
 * TheoremReach hash is created from the full URL without the hash parameter
 */
function reconstructBaseUrlForHash(params: Record<string, string>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rewardoxy.app';
  const callbackPath = '/api/theoremreach-postback';

  // Remove hash and debug params as they aren't part of the URL for hashing
  const paramsToInclude = { ...params };
  delete paramsToInclude.hash;

  const queryString = Object.entries(paramsToInclude)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${baseUrl}${callbackPath}?${queryString}`;
}

/**
 * Verifies HMAC SHA-1 signature
 * TheoremReach signature format:
 * 1. Create HMAC-SHA1 digest
 * 2. Base64 encode
 * 3. Replace + with -, / with _, remove =
 */
function verifyTheoremReachHash(baseUrl: string, providedHash: string): boolean {
  const secret = process.env.THEOREMREACH_SECRET_KEY;

  if (!secret) {
    console.error('[theoremreach-postback] ERROR: THEOREMREACH_SECRET_KEY env var is not set');
    return false;
  }

  try {
    // Create HMAC-SHA1
    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(baseUrl);
    const digest = hmac.digest('base64');

    // Replace characters as per TheoremReach spec
    const encoded = digest
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return encoded === providedHash;
  } catch (err) {
    console.error('[theoremreach-postback] Hash verification error:', err);
    return false;
  }
}

async function handleTheoremReachPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[theoremreach-postback]', msg); };

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

    // ── 1. Extract TheoremReach parameters ───────────────────────────────
    const reward = url.searchParams.get('reward');           // MANDATORY: reward amount
    const currency = url.searchParams.get('currency');       // USD currency amount
    const user_id = url.searchParams.get('user_id');         // MANDATORY: user ID
    const tx_id = url.searchParams.get('tx_id');             // MANDATORY: transaction ID
    const hash = url.searchParams.get('hash');               // MANDATORY: SHA-1 hash
    const reversal = url.searchParams.get('reversal');       // optional: true if reversal
    const debug = url.searchParams.get('debug');             // optional: true if debug
    const screenout = url.searchParams.get('screenout');     // optional: 1=true, 2=false
    const profiler = url.searchParams.get('profiler');       // optional: 1=true, 2=false
    const offer = url.searchParams.get('offer');             // optional: true if offer
    const offer_name = url.searchParams.get('offer_name');   // optional: offer name
    const ip = url.searchParams.get('ip');                   // optional: user IP
    const offer_id = url.searchParams.get('offer_id');       // optional: offer/survey ID
    const placement_id = url.searchParams.get('placement_id'); // optional: placement ID

    log(`Parsed: user_id=${user_id}, tx_id=${tx_id}, reward=${reward}, reversal=${reversal}, debug=${debug}`);

    // ── 2. Handle debug mode ─────────────────────────────────────────────
    if (debug === 'true') {
      log('DEBUG MODE: Ignoring this callback as per TheoremReach spec');
      return ok('Rejected');
    }

    // ── 3. Validate required parameters ──────────────────────────────────
    if (!reward || !user_id || !tx_id || !hash) {
      log(`Missing required params: reward=${reward}, user_id=${user_id}, tx_id=${tx_id}, hash=${hash}`);
      return ok('Rejected');
    }

    // ── 4. Hash Verification (Security — MUST verify) ────────────────────
    const baseUrlForHash = reconstructBaseUrlForHash(allParams);
    log(`Base URL for hash: ${baseUrlForHash}`);

    if (!verifyTheoremReachHash(baseUrlForHash, hash)) {
      log(`HASH VERIFICATION FAILED: received="${hash}"`);
      return ok('Rejected');
    }
    log('Hash verification PASSED');

    // ── 5. Parse amounts ─────────────────────────────────────────────────
    const rewardAmount = parseFloat(reward || '0');
    const currencyAmount = parseFloat(currency || '0');
    const isReversal = reversal === 'true';
    const isScreenout = screenout === '1';
    const isProfiler = profiler === '1';
    const isOffer = offer === 'true';

    log(`Parsed amounts: reward=${rewardAmount}, currency=${currencyAmount}, isReversal=${isReversal}, isScreenout=${isScreenout}, isProfiler=${isProfiler}`);

    // ── 6. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 7. Check if user exists ──────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userError?.message || 'no data'}`);
      return ok('Rejected');
    }
    log(`User found: ${user_id}`);

    // ── 8. Route to correct handler based on transaction type ────────────
    if (isReversal) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER (reversal=true)
      // ═══════════════════════════════════════════════════════════════════
      log(`Processing reversal: tx_id=${tx_id}, reward=${rewardAmount}`);

      // Check for duplicate reversal (same tx_id with reversal=true)
      const { data: existingReversal, error: checkError } = await supabase
        .from('theoremreach_transactions')
        .select('id')
        .eq('tx_id', tx_id)
        .eq('is_reversal', true)
        .limit(1);

      if (checkError) {
        log(`Duplicate reversal check error: ${checkError.message}`);
      }

      if (existingReversal && existingReversal.length > 0) {
        log(`DUPLICATE REVERSAL IGNORED: tx_id=${tx_id} already processed as reversal`);
        return ok('Approved');
      }

      log(`User balance BEFORE reversal: ${userData.coins_balance}`);

      // Use absolute value of reward (TheoremReach may send positive or negative)
      const deductAmount = Math.abs(rewardAmount);

      if (deductAmount > 0) {
        log(`Deducting ${deductAmount} coins from user ${user_id}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: user_id,
          p_amount: Math.floor(deductAmount)
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('Rejected');
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${deductAmount} from user ${user_id}. New balance: ${newBalance}`);

        // Verify the deduction
        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', user_id)
          .single();

        log(`User balance AFTER reversal: ${updatedUser?.coins_balance || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      // Log reversal record
      const { error: insertError } = await supabase.from('theoremreach_transactions').insert({
        tx_id: tx_id,
        user_id: user_id,
        reward: -deductAmount,
        currency_usd: -Math.abs(currencyAmount),
        is_reversal: true,
        is_screenout: isScreenout,
        is_profiler: isProfiler,
        is_offer: isOffer,
        offer_name: offer_name,
        offer_id: offer_id,
        ip_address: ip,
        placement_id: placement_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Reversal transaction insert failed: ${insertError.message}`);
      } else {
        log(`Reversal transaction logged: tx_id=${tx_id}`);
      }

      return ok('Approved');

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER (normal completion, screenout, or profiler)
      // ═══════════════════════════════════════════════════════════════════

      // Check for duplicate completion (same tx_id with positive reward)
      const { data: existing, error: checkError } = await supabase
        .from('theoremreach_transactions')
        .select('id, reward')
        .eq('tx_id', tx_id)
        .eq('is_reversal', false)
        .gt('reward', 0)
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: tx_id=${tx_id} already processed as completion`);
        return ok('Approved');
      }

      // Determine transaction type
      let txType = 'survey';
      if (isScreenout) txType = 'screenout';
      if (isProfiler) txType = 'profiler';
      if (isOffer) txType = 'offer';

      log(`Transaction type: ${txType}`);

      // Credit user if reward > 0
      if (rewardAmount > 0) {
        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: user_id=${user_id}, reward=${rewardAmount}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: user_id,
          p_amount: rewardAmount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('Rejected');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${rewardAmount} to user ${user_id}. New balance: ${newBalance}, New total: ${newTotal}`);
      } else {
        log(`Reward is 0, skipping credit`);
      }

      // Log completion record
      const { error: insertError } = await supabase.from('theoremreach_transactions').insert({
        tx_id: tx_id,
        user_id: user_id,
        reward: rewardAmount,
        currency_usd: currencyAmount,
        is_reversal: false,
        is_screenout: isScreenout,
        is_profiler: isProfiler,
        is_offer: isOffer,
        offer_name: offer_name,
        offer_id: offer_id,
        ip_address: ip,
        placement_id: placement_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Transaction insert failed: ${insertError.message}`);
      } else {
        log(`Transaction logged: tx_id=${tx_id}, type=${txType}`);
      }

      // Enqueue 10-level referral commissions (processed async)
      if (rewardAmount > 0) {
        try {
          await supabase.rpc('enqueue_commissions', { p_earner_id: user_id, p_amount: rewardAmount, p_source: 'theoremreach' });
          log('Referral commissions enqueued');
        } catch (e: any) {
          log(`Enqueue commissions error: ${e.message}`);
        }
      }

      return ok('Approved');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent TheoremReach retry storms
    return ok('Rejected');
  }
}

export async function GET(request: NextRequest) {
  return handleTheoremReachPostback(request);
}

export async function POST(request: NextRequest) {
  return handleTheoremReachPostback(request);
}
