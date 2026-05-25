/**
 * Taskwall Offerwall Postback Handler (S2S)
 *
 * This endpoint receives postback notifications from Taskwall when users complete offers.
 *
 * IMPORTANT: Configure this URL in Taskwall Dashboard → App Settings → Postback URL
 *
 * Postback URL Format:
 * https://www.rewardoxy.app/api/taskwall-postback
 *
 * Parameters sent by Taskwall:
 * - app_name: Returns the app name
 * - userid: Unique identifier code of the user who completed action
 * - password: Postback password (if configured)
 * - user_amount: Amount of virtual currency to be credited to user
 * - offer_name: Name of completed offer
 * - offer_id: ID of completed offer
 * - payout: The offer payout in $ (USD)
 * - ip_address: Converting device's IP address if known, 0.0.0.0 otherwise
 * - currency_name: Virtual currency name defined in app settings
 * - date: The date on which the offer was completed
 *
 * Security:
 * - Password verification: Validate postback password from Taskwall
 * - Duplicate prevention: Check offer_id + userid before crediting
 * - IP Logging: Log IP address for fraud detection
 *
 * Expected Response:
 * - HTTP 200: Postback received successfully
 * - Any other status: Taskwall may retry
 *
 * CRITICAL: Always return HTTP 200, even for errors, to prevent retry storms
 */

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

function ok(message: string) {
  return new NextResponse(message, { status: 200 });
}

async function handleTaskwallPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[taskwall-postback]', msg); };

  try {
    // Parse request body or query params depending on how Taskwall sends it
    const url = new URL(request.url);
    let params: Record<string, string> = {};

    // First try query parameters
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // If no params in query string, try POST body
    if (Object.keys(params).length === 0 && request.method === 'POST') {
      const body = await request.text();
      if (body.includes('=')) {
        // URL-encoded form data
        const searchParams = new URLSearchParams(body);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
      } else {
        // Try JSON
        try {
          params = JSON.parse(body);
        } catch (e) {
          log('Could not parse POST body');
        }
      }
    }

    // ── 0. Log EVERYTHING for debugging ──────────────────────────────────
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    log(`Method: ${request.method}`);
    log(`Full URL: ${request.url}`);
    log(`IP: ${clientIp}`);
    log(`User-Agent: ${request.headers.get('user-agent') || 'none'}`);
    log(`All params: ${JSON.stringify(params)}`);

    // ── 1. Extract Taskwall parameters ──────────────────────────────────────
    const app_name = params.app_name || '';
    const userid = params.userid || '';
    const password = params.password || '';
    const user_amount = params.user_amount || '0';
    const offer_name = params.offer_name || '';
    const offer_id = params.offer_id || '';
    const payout = params.payout || '0';
    const ip_address = params.ip_address || '0.0.0.0';
    const currency_name = params.currency_name || '';
    const date = params.date || new Date().toISOString();

    log(`Parsed: app_name=${app_name}, userid=${userid}, offer_id=${offer_id}, user_amount=${user_amount}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!userid || !offer_id || user_amount === '0') {
      log(`Missing required params: userid=${userid}, offer_id=${offer_id}, user_amount=${user_amount}`);
      return ok('missing_params');
    }

    // ── 3. Password Verification (Security) ─────────────────────────────
    const TASKWALL_PASSWORD = process.env.TASKWALL_POSTBACK_PASSWORD;

    if (password && TASKWALL_PASSWORD) {
      if (password !== TASKWALL_PASSWORD) {
        log(`PASSWORD MISMATCH: received="${password}", expected="${TASKWALL_PASSWORD}"`);
        return ok('password_mismatch');
      }
      log('Password validation PASSED');
    } else if (TASKWALL_PASSWORD && !password) {
      log('WARNING: Password configured but not received in postback');
      // Optionally reject if password is required but missing
      // return ok('password_missing');
    } else if (!TASKWALL_PASSWORD) {
      log('WARNING: TASKWALL_POSTBACK_PASSWORD env var is not set — cannot validate password');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const amountNum = parseInt(user_amount) || 0;
    const payoutNum = parseFloat(payout) || 0;

    if (amountNum <= 0) {
      log(`Invalid amount: ${amountNum}`);
      return ok('invalid_amount');
    }

    log(`Parsed amounts: amount=${amountNum}, payout=${payoutNum}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check for duplicate transaction ───────────────────────────────
    // Create unique key from offer_id and userid
    const txn_key = `taskwall_${offer_id}_${userid}`;
    const { data: existing, error: checkError } = await supabase
      .from('taskwall_transactions')
      .select('id, amount')
      .eq('txn_key', txn_key)
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      log(`DUPLICATE TRANSACTION IGNORED: txn_key=${txn_key} already processed`);
      return ok('duplicate_ignored');
    }

    // ── 7. Verify user exists ────────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, coins_balance, total_earned')
      .eq('id', userid)
      .single();

    if (userError || !userData) {
      log(`User not found: ${userid}`);
      return ok('user_not_found');
    }

    log(`User found: ${userid}, current balance: ${userData.coins_balance}`);

    // ── 8. Credit user ──────────────────────────────────────────────────
    log(`Crediting user: userid=${userid}, amount=${amountNum}`);

    const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
      p_user_id: userid,
      p_amount: amountNum
    });

    if (creditError) {
      log(`Credit RPC failed: ${creditError.message}`);
      return ok('credit_failed');
    }

    const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
    const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
    log(`SUCCESS: Credited ${amountNum} to user ${userid}. New balance: ${newBalance}, New total: ${newTotal}`);

    // ── 9. Log transaction ───────────────────────────────────────────────
    // Parse completion_date safely - fallback to now if invalid
    let completionDate: string;
    try {
      const parsed = new Date(date);
      completionDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    } catch {
      completionDate = new Date().toISOString();
    }

    const { error: insertError } = await supabase.from('taskwall_transactions').insert({
      txn_key: txn_key,
      user_id: userid,
      app_name: app_name || null,
      offer_id: offer_id,
      offer_name: offer_name || null,
      amount: amountNum,
      payout: payoutNum,
      ip_address: ip_address || null,
      currency_name: currency_name || null,
      completion_date: completionDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      log(`Transaction log insert failed: ${insertError.message}`);
      // Don't fail, user was already credited
    } else {
      log(`Transaction logged: txn_key=${txn_key}`);
    }

    // ── 10. Enqueue 10-level referral commissions (processed async)
    try {
      await supabase.rpc('enqueue_commissions', { p_earner_id: userid, p_amount: amountNum, p_source: 'taskwall' });
      log('Referral commissions enqueued');
    } catch (e: any) {
      log(`Enqueue commissions error: ${e.message}`);
    }

    // ── 11. Update user_offer_interactions status
    try {
      const { data: interaction } = await supabase
        .from('user_offer_interactions')
        .select('id')
        .eq('user_id', userid)
        .eq('offer_id', offer_id)
        .eq('provider', 'taskwall')
        .single();

      if (interaction) {
        await supabase
          .from('user_offer_interactions')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', interaction.id);
        log('Offer interaction marked completed');
      }
    } catch (e: any) {
      log(`Offer interaction update error: ${e.message}`);
    }

    return ok('OK');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent Taskwall retry storms
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleTaskwallPostback(request);
}

export async function POST(request: NextRequest) {
  return handleTaskwallPostback(request);
}
