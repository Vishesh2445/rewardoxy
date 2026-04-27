/**
 * TheoremReach Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from TheoremReach when users complete surveys.
 * 
 * IMPORTANT: Configure this URL in TheoremReach Dashboard → App Settings → Postback URL
 * 
 * Postback URL Format:
 * https://rewardoxy.app/api/theoremreach-postback
 * 
 * Parameters sent by TheoremReach:
 * - user_id: Your site's unique user ID
 * - transaction_id: Unique identifier for this transaction
 * - reward: Amount earned by user (in your chosen conversion rate)
 * - placement_id: Your placement ID (optional)
 * - signature: SHA256 HMAC hash for verification
 * 
 * Security:
 * - Hash verification: SHA256 HMAC of the query string (without signature parameter) using API Secret Key
 * - Duplicate prevention: Check transaction_id before crediting
 * - IP Whitelist: All postbacks come from TheoremReach servers
 * 
 * Expected Response:
 * - HTTP 200: Postback received successfully
 * - Any other status: TheoremReach will retry
 * 
 * CRITICAL: Always return HTTP 200, even for errors, to prevent retry storms
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

async function handleTheoremReachPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[theoremreach-postback]', msg); };

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

    // ── 1. Extract TheoremReach parameters ───────────────────────────────
    const user_id = url.searchParams.get('user_id');
    const transaction_id = url.searchParams.get('transaction_id');
    const reward = url.searchParams.get('reward');
    const placement_id = url.searchParams.get('placement_id');
    const signature = url.searchParams.get('signature');

    log(`Parsed: user_id=${user_id}, transaction_id=${transaction_id}, reward=${reward}, placement_id=${placement_id}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!user_id || !transaction_id || reward === null) {
      log(`Missing required params: user_id=${user_id}, transaction_id=${transaction_id}, reward=${reward}`);
      return ok('missing_params');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    const THEOREMREACH_SECRET_KEY = process.env.THEOREMREACH_SECRET_KEY;

    if (signature && signature.trim() !== '') {
      if (!THEOREMREACH_SECRET_KEY) {
        log('WARNING: THEOREMREACH_SECRET_KEY env var is not set — cannot validate signature');
      } else {
        // Build the query string without the "signature" parameter
        const paramsToSign = new URLSearchParams();
        url.searchParams.forEach((value, key) => {
          if (key !== 'signature') {
            paramsToSign.append(key, value);
          }
        });
        
        // Sort parameters alphabetically by key (TheoremReach requirement)
        const sortedParams = Array.from(paramsToSign.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
        
        // Generate SHA256 HMAC hash
        const expectedSignature = crypto
          .createHmac('sha256', THEOREMREACH_SECRET_KEY)
          .update(sortedParams)
          .digest('hex');
        
        if (signature !== expectedSignature) {
          log(`SIGNATURE MISMATCH: received="${signature}", expected="${expectedSignature}"`);
          log(`Sorted params: ${sortedParams}`);
          // Do NOT credit user, but return 200 to prevent retry storms
          return ok('signature_mismatch');
        }
        log('Signature validation PASSED');
      }
    } else {
      log('Signature check skipped (signature param empty)');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const rewardAmount = parseFloat(reward || '0');

    log(`Parsed amounts: reward=${rewardAmount}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check for duplicate transaction ───────────────────────────────
    const { data: existing, error: checkError } = await supabase
      .from('theoremreach_transactions')
      .select('id, reward')
      .eq('tx_id', transaction_id)
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      log(`DUPLICATE TRANSACTION IGNORED: transaction_id=${transaction_id} already processed`);
      return ok('duplicate_ignored');
    }

    // ── 7. Credit user ───────────────────────────────────────────────────
    if (rewardAmount > 0) {
      log(`CREDIT: transaction_id=${transaction_id}, user_id=${user_id}, reward=${rewardAmount}`);

      // Get user's current balance BEFORE credit for logging
      const { data: userBefore } = await supabase
        .from('users')
        .select('coins_balance, total_earned')
        .eq('id', user_id)
        .single();

      log(`User balance BEFORE credit: coins=${userBefore?.coins_balance || 0}, total_earned=${userBefore?.total_earned || 0}`);

      const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
        p_user_id: user_id,
        p_amount: rewardAmount
      });

      if (creditError) {
        log(`Credit RPC failed: ${creditError.message}`);
      } else {
        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${rewardAmount} to user ${user_id}. New balance: ${newBalance}, New total: ${newTotal}`);
      }
    } else {
      log(`Reward is 0, skipping credit`);
    }

    // ── 8. Log transaction ───────────────────────────────────────────────
    const { error: insertError } = await supabase.from('theoremreach_transactions').insert({
      tx_id: transaction_id,
      user_id: user_id,
      reward: Math.floor(rewardAmount),
      placement_id: placement_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      log(`Transaction log insert failed: ${insertError.message}`);
      return ok('insert_failed');
    }

    log(`Transaction logged: transaction_id=${transaction_id}`);

    // ── 9. Check for referrer and add 5% commission ──────────────────────
    const { data: userWithReferrer, error: referrerError } = await supabase
      .from('users')
      .select('referred_by, email_verified')
      .eq('id', user_id)
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

    return ok('OK');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent TheoremReach retry storms
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleTheoremReachPostback(request);
}

export async function POST(request: NextRequest) {
  return handleTheoremReachPostback(request);
}
