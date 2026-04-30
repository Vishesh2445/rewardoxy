/**
 * Notik Offerwall Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from Notik when users complete offers.
 * 
 * IMPORTANT: Configure this URL in Notik Dashboard → App Settings → Postback URL
 * 
 * Postback URL Format:
 * https://rewardoxy.app/api/notik-postback
 * 
 * Parameters sent by Notik:
 * - pub_id: Your Publisher ID
 * - app_id: Your App ID
 * - user_id: Your site's unique and constant User ID
 * - s1: Your site's changing user Click ID or Session ID (optional)
 * - amount: Virtual amount earned by user (in your chosen conversion rate)
 * - payout: Amount earned for conversion (in USD)
 * - offer_id: ID of completed offer
 * - offer_name: Name of completed offer
 * - currency_name: Virtual currency name defined in app settings
 * - timestamp: Offer completed timestamp
 * - hash: SHA1 HMAC hash for verification
 * - txn_id: Unique identifier of this transaction
 * - conversion_ip: Converting device's IP address
 * - rewarded_txn_id: For chargebacks, contains the previously sent reward postback transaction id
 * - event_id: ID of the offer event that was credited (empty for non-event conversions)
 * - event_name: Name of the offer event that was credited (empty for non-event conversions)
 * 
 * Security:
 * - Hash verification: SHA1 HMAC of the full URL (without hash parameter) using App Secret Key
 * - Duplicate prevention: Check txn_id before crediting
 * - Chargeback handling: Negative amounts indicate chargebacks
 * - IP Whitelist: All postbacks come from 192.53.121.112
 * 
 * Expected Response:
 * - HTTP 200: Postback received successfully
 * - Any other status: Notik will retry up to 2 times
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

async function handleNotikPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[notik-postback]', msg); };

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

    // ── 1. Extract Notik parameters ──────────────────────────────────────
    const pub_id = url.searchParams.get('pub_id');
    const app_id = url.searchParams.get('app_id');
    const user_id = url.searchParams.get('user_id');
    const s1 = url.searchParams.get('s1');
    const amount = url.searchParams.get('amount');
    const payout = url.searchParams.get('payout');
    const offer_id = url.searchParams.get('offer_id');
    const offer_name = url.searchParams.get('offer_name');
    const currency_name = url.searchParams.get('currency_name');
    const timestamp = url.searchParams.get('timestamp');
    const hash = url.searchParams.get('hash');
    const txn_id = url.searchParams.get('txn_id');
    const conversion_ip = url.searchParams.get('conversion_ip');
    const rewarded_txn_id = url.searchParams.get('rewarded_txn_id');
    const event_id = url.searchParams.get('event_id');
    const event_name = url.searchParams.get('event_name');

    log(`Parsed: user_id=${user_id}, txn_id=${txn_id}, amount=${amount}, payout=${payout}, offer_name=${offer_name}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!user_id || !txn_id || amount === null) {
      log(`Missing required params: user_id=${user_id}, txn_id=${txn_id}, amount=${amount}`);
      return ok('missing_params');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    const NOTIK_SECRET_KEY = process.env.NOTIK_APP_SECRET;

    if (hash && hash.trim() !== '') {
      if (!NOTIK_SECRET_KEY) {
        log('WARNING: NOTIK_APP_SECRET env var is not set — cannot validate hash');
      } else {
        // Build the full callback URL without the "hash" query parameter
        const urlWithoutHash = url.toString().substring(0, url.toString().lastIndexOf('&hash='));
        
        // Generate a hash from the complete callback URL without the "hash" query parameter
        const expectedHash = crypto.createHmac('sha1', NOTIK_SECRET_KEY).update(urlWithoutHash).digest('hex');
        
        if (hash !== expectedHash) {
          log(`HASH MISMATCH: received="${hash}", expected="${expectedHash}"`);
          log(`URL without hash: ${urlWithoutHash}`);
          // Do NOT credit user, but return 200 to prevent retry storms
          return ok('hash_mismatch');
        }
        log('Hash validation PASSED');
      }
    } else {
      log('Hash check skipped (hash param empty)');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const amountNum = parseFloat(amount || '0');
    const payoutNum = parseFloat(payout || '0');
    const isChargeback = amountNum < 0;

    log(`Parsed amounts: amount=${amountNum}, payout=${payoutNum}, isChargeback=${isChargeback}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Check for duplicate transaction ───────────────────────────────
    const { data: existing, error: checkError } = await supabase
      .from('notik_transactions')
      .select('id, amount')
      .eq('txn_id', txn_id)
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      log(`DUPLICATE TRANSACTION IGNORED: txn_id=${txn_id} already processed`);
      return ok('duplicate_ignored');
    }

    // ── 7. Handle Chargeback or Credit ──────────────────────────────────
    if (isChargeback) {
      // ═══════════════════════════════════════════════════════════════════
      // CHARGEBACK HANDLER (negative amount)
      // ═══════════════════════════════════════════════════════════════════
      log(`CHARGEBACK: txn_id=${txn_id}, user_id=${user_id}, amount=${amountNum}`);

      // Get user's current balance BEFORE deduction for logging
      const { data: userData } = await supabase
        .from('users')
        .select('coins_balance, total_earned')
        .eq('id', user_id)
        .single();

      log(`User balance BEFORE chargeback: coins=${userData?.coins_balance || 0}, total_earned=${userData?.total_earned || 0}`);

      // Deduct the absolute value of the negative amount
      const deductAmount = Math.abs(amountNum);
      log(`Deducting ${deductAmount} coins from user ${user_id}`);

      const { error: deductError } = await supabase.rpc('deduct_user_points', {
        p_userid: user_id,
        p_amount: deductAmount
      });

      if (deductError) {
        log(`Deduct RPC failed: ${deductError.message}`);
      } else {
        log(`SUCCESS: Deducted ${deductAmount} from user ${user_id}`);
      }

      // Verify the deduction worked
      const { data: updatedUser } = await supabase
        .from('users')
        .select('coins_balance, total_earned')
        .eq('id', user_id)
        .single();

      log(`User balance AFTER chargeback: coins=${updatedUser?.coins_balance || 0}, total_earned=${updatedUser?.total_earned || 0}`);
    } else if (amountNum > 0) {
      // ═══════════════════════════════════════════════════════════════════
      // CREDIT HANDLER (positive amount)
      // ═══════════════════════════════════════════════════════════════════
      log(`CREDIT: txn_id=${txn_id}, user_id=${user_id}, amount=${amountNum}`);

      // Get user's current balance BEFORE credit for logging
      const { data: userBefore } = await supabase
        .from('users')
        .select('coins_balance, total_earned')
        .eq('id', user_id)
        .single();

      log(`User balance BEFORE credit: coins=${userBefore?.coins_balance || 0}, total_earned=${userBefore?.total_earned || 0}`);

      const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
        p_user_id: user_id,
        p_amount: amountNum
      });

      if (creditError) {
        log(`Credit RPC failed: ${creditError.message}`);
      } else {
        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${amountNum} to user ${user_id}. New balance: ${newBalance}, New total: ${newTotal}`);
      }

      // Record milestone progress if event_id is present
      if (event_id && event_id.trim() !== '') {
        log(`Recording milestone progress: event_id=${event_id}, event_name=${event_name}`);
        
        const { error: milestoneError } = await supabase
          .from('milestone_progress')
          .insert({
            user_id: user_id,
            offer_id: offer_id,
            provider: 'notik',
            event_id: event_id,
            event_name: event_name || 'Unknown Event',
            payout: payoutNum,
            is_reversed: false
          });

        if (milestoneError) {
          log(`Milestone progress insert failed: ${milestoneError.message}`);
        } else {
          log(`Milestone progress recorded: event_id=${event_id}`);
        }

        // Update offer status to 'in_progress' or 'completed'
        // First, check if this offer exists in user_offer_interactions
        const { data: interaction } = await supabase
          .from('user_offer_interactions')
          .select('id, events_json')
          .eq('user_id', user_id)
          .eq('offer_id', offer_id)
          .eq('provider', 'notik')
          .single();

        if (interaction) {
          // Count completed milestones
          const { data: completedMilestones } = await supabase
            .from('milestone_progress')
            .select('event_id')
            .eq('user_id', user_id)
            .eq('offer_id', offer_id)
            .eq('provider', 'notik')
            .eq('is_reversed', false);

          const totalMilestones = interaction.events_json?.length || 0;
          const completedCount = completedMilestones?.length || 0;

          // Determine new status
          let newStatus = 'started';
          if (completedCount > 0 && completedCount < totalMilestones) {
            newStatus = 'in_progress';
          } else if (completedCount >= totalMilestones && totalMilestones > 0) {
            newStatus = 'completed';
          }

          log(`Updating offer status: ${newStatus} (${completedCount}/${totalMilestones} milestones)`);

          const { error: updateError } = await supabase
            .from('user_offer_interactions')
            .update({ status: newStatus })
            .eq('id', interaction.id);

          if (updateError) {
            log(`Offer status update failed: ${updateError.message}`);
          } else {
            log(`Offer status updated to: ${newStatus}`);
          }
        }
      }

      // Note: We do NOT insert into completions table here because the history page
      // queries notik_transactions directly. Inserting into both would cause duplicates.
    } else {
      log(`Amount is 0, skipping credit/debit`);
    }

    // ── 8. Log transaction ───────────────────────────────────────────────
    const { error: insertError } = await supabase.from('notik_transactions').insert({
      txn_id: txn_id,
      user_id: user_id,
      pub_id: pub_id,
      app_id: app_id,
      s1: s1,
      amount: amountNum,
      payout: payoutNum,
      offer_id: offer_id,
      offer_name: offer_name,
      currency_name: currency_name,
      timestamp: timestamp,
      conversion_ip: conversion_ip,
      rewarded_txn_id: rewarded_txn_id,
      event_id: event_id,
      event_name: event_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      log(`Transaction log insert failed: ${insertError.message}`);
      return ok('insert_failed');
    }

    log(`Transaction logged: txn_id=${txn_id}`);
    return ok('OK');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent Notik retry storms
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleNotikPostback(request);
}

export async function POST(request: NextRequest) {
  return handleNotikPostback(request);
}
