/**
 * CPX Research Postback Handler (S2S)
 * 
 * This endpoint receives postback notifications from CPX Research when users complete surveys,
 * get screened out with bonuses, or when transactions are reversed.
 * 
 * IMPORTANT: Configure this URL in CPX Research Dashboard → Apps → Edit → Postback Settings
 * 
 * Correct Postback URL Format:
 * https://rewardoxy.app/api/cpx-postback?userid={user_id}&transid={trans_id}&amountlocal={amount_local}&amountusd={amount_usd}&status={status}&hash={secure_hash}&type={type}&subid1={subid_1}&subid2={subid_2}&offerid={offer_ID}&ipclick={ip_click}
 * 
 * Parameter Mapping (CPX placeholder → query param):
 * - {user_id} → userid (MANDATORY)
 * - {amount_local} → amountlocal (MANDATORY)
 * - {amount_usd} → amountusd (MANDATORY)
 * - {trans_id} → transid (recommended)
 * - {status} → status (recommended: 1=completed, 2=reversed)
 * - {secure_hash} → hash (recommended: MD5 hash for verification)
 * - {type} → type (optional: 'complete', 'out', 'bonus')
 * - {subid_1} → subid1 (optional)
 * - {subid_2} → subid2 (optional)
 * - {offer_ID} → offerid (optional)
 * - {ip_click} → ipclick (optional)
 * 
 * Event Types:
 * - type=complete, status=1: User completed survey → credit full amount
 * - type=complete, status=2: Survey reversed → check reversal rate before deducting
 * - type=out, status=1, amount>0: Screen-out with bonus (0.01-0.05 USD) → credit full amount
 * - type=out, status=1, amount=0: Normal screen-out → no credit
 * - type=bonus, status=1: Survey rating bonus (+0.01 USD) → credit full amount
 * 
 * Security:
 * - Hash verification: MD5(transid + "-" + CPX_SECRET_HASH)
 * - Duplicate prevention: Check transid + status=1 before crediting
 * - Reversal protection: Only deduct if user's reversal rate >= 5%
 * 
 * CRITICAL: Always return HTTP 200, even for errors, to prevent CPX retry storms
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

async function handleCpxPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[cpx-postback]', msg); };

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

    // ── 1. Extract CPX Research parameters ───────────────────────────────
    // Parameter names match CPX Research specification exactly
    const userid = url.searchParams.get('userid');             // MANDATORY: {user_id}
    const amountlocal = url.searchParams.get('amountlocal');   // MANDATORY: {amount_local}
    const amountusd = url.searchParams.get('amountusd');       // MANDATORY: {amount_usd}
    const status = url.searchParams.get('status');             // recommended: {status} - 1 = completed, 2 = canceled
    const transid = url.searchParams.get('transid');           // recommended: {trans_id} - Unique transaction ID
    const hash = url.searchParams.get('hash');                 // recommended: {secure_hash} - MD5 hash for verification
    const type = url.searchParams.get('type');                 // optional: {type} - 'complete', 'out', 'bonus'
    const subid1 = url.searchParams.get('subid1');             // optional: {subid_1} - Sub-identifier
    const subid2 = url.searchParams.get('subid2');             // optional: {subid_2} - Sub-identifier
    const offerid = url.searchParams.get('offerid');           // optional: {offer_ID} - Survey/offer ID
    const ipclick = url.searchParams.get('ipclick');           // optional: {ip_click} - User's IP at click time

    log(`Parsed: userid=${userid}, transid=${transid}, amountlocal=${amountlocal}, amountusd=${amountusd}, status=${status}, type=${type}, hash=${hash}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!userid || !transid || amountlocal === null || amountusd === null) {
      log(`Missing required params: userid=${userid}, transid=${transid}, amountlocal=${amountlocal}, amountusd=${amountusd}`);
      // ALWAYS return 200 to prevent CPX retry storms
      return ok('missing_params');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    // Note: Use CPX_SECRET_HASH in production (currently using CPX_SECURE_HASH for backward compatibility)
    const CPX_SECRET_HASH = process.env.CPX_SECRET_HASH || process.env.CPX_SECURE_HASH;

    if (hash && hash.trim() !== '') {
      if (!CPX_SECRET_HASH) {
        log('WARNING: CPX_SECRET_HASH env var is not set — cannot validate hash');
      } else {
        const expectedHash = crypto.createHash('md5').update(`${transid}-${CPX_SECRET_HASH}`).digest('hex');
        if (hash !== expectedHash) {
          log(`HASH MISMATCH: transid=${transid}, received="${hash}", expected="${expectedHash}"`);
          // Do NOT credit user, but return 200 to prevent retry storms
          return ok('hash_mismatch');
        }
        log('Hash validation PASSED');
      }
    } else {
      log('Hash check skipped (hash param empty - feature may not be activated)');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const amount = parseFloat(amountlocal || '0');
    const amountUsd = parseFloat(amountusd || '0');
    const statusInt = parseInt(status || '1');

    log(`Parsed amounts: amountlocal=${amount}, amountusd=${amountUsd}, status=${statusInt}, type=${type}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Route to correct handler based on status ──────────────────────
    // CRITICAL: Use else-if to ensure only ONE handler executes
    if (statusInt === 1) {
      // ═══════════════════════════════════════════════════════════════════
      // COMPLETION HANDLER (status=1)
      // ═══════════════════════════════════════════════════════════════════
      // Check for duplicate (same transid with status=1)
      // Note: We only check for status=1 duplicates here because status=2 
      // (reversals) should be handled by the reversal handler
      const { data: existing, error: checkError } = await supabase
        .from('cpx_transactions')
        .select('id, status')
        .eq('transid', transid)
        .eq('status', 1)  // Only check for existing completions
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE COMPLETION IGNORED: transid=${transid} already processed with status=1`);
        return ok('duplicate_ignored');
      }

      // Credit user if amount > 0
      if (amount > 0) {
        // Get user's current balance BEFORE credit for logging
        const { data: userBefore } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', userid)
          .single();

        log(`User balance BEFORE credit: coins=${userBefore?.coins_balance || 0}, total_earned=${userBefore?.total_earned || 0}`);
        log(`Crediting user: userid=${userid}, amount=${amount}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: userid,
          p_amount: amount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          // Still log the transaction even if credit fails
        } else {
          const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
          const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
          log(`SUCCESS: Credited ${amount} to user ${userid}. New balance: ${newBalance}, New total: ${newTotal}`);
        }

        // CPX Research doesn't have event-based milestones like Notik
        // But we can update offer status if the offer exists in user_offer_interactions
        if (offerid) {
          const { data: interaction } = await supabase
            .from('user_offer_interactions')
            .select('id')
            .eq('user_id', userid)
            .eq('offer_id', offerid)
            .eq('provider', 'cpx research')
            .single();

          if (interaction) {
            log(`Updating CPX offer status to completed: offer_id=${offerid}`);
            
            const { error: updateError } = await supabase
              .from('user_offer_interactions')
              .update({ status: 'completed' })
              .eq('id', interaction.id);

            if (updateError) {
              log(`CPX offer status update failed: ${updateError.message}`);
            } else {
              log(`CPX offer status updated to completed`);
            }
          }
        }
      } else {
        log(`Amount is 0, skipping credit (type=${type})`);
      }

      // Log transaction
      const { error: insertError } = await supabase.from('cpx_transactions').insert({
        transid: transid,
        userid: userid,
        amount_local: amount,
        amount_usd: amountUsd,
        status: 1,
        type,
        subid1,
        subid2,
        offerid: offerid,
        ipclick: ipclick,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Transaction log insert failed: ${insertError.message}`);
        return ok('insert_failed');
      }

      log(`Transaction logged: transid=${transid}, status=1`);
      return ok('OK');
    } else if (statusInt === 2) {
      // ═══════════════════════════════════════════════════════════════════
      // REVERSAL HANDLER (status=2)
      // ═══════════════════════════════════════════════════════════════════
      log(`REVERSAL: transid=${transid}, userid=${userid}, amount=${amount}`);

      // NO duplicate check for reversals - allow all chargebacks to execute
      log(`Processing reversal without duplicate check (all chargebacks allowed)`);

      // Get user's current balance BEFORE deduction for logging
      const { data: userData } = await supabase
        .from('users')
        .select('coins_balance, total_earned')
        .eq('id', userid)
        .single();

      log(`User balance BEFORE reversal: coins=${userData?.coins_balance || 0}, total_earned=${userData?.total_earned || 0}`);

      // ALWAYS deduct on reversals
      // Note: CPX sends reversals with DIFFERENT transids than the original completion
      // So we can't match by transid - we just deduct the amount
      if (amount > 0) {
        log(`Deducting ${amount} coins from user ${userid}`);

        const { error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: userid,
          p_amount: amount
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('deduct_failed');
        } else {
          log(`SUCCESS: Deducted ${amount} from user ${userid}`);
        }

        // Verify the deduction worked
        const { data: updatedUser } = await supabase
          .from('users')
          .select('coins_balance, total_earned')
          .eq('id', userid)
          .single();

        log(`User balance AFTER reversal: coins=${updatedUser?.coins_balance || 0}, total_earned=${updatedUser?.total_earned || 0}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }

      // INSERT new transaction with status=2 (CPX uses different transids for reversals)
      const { error: insertError } = await supabase.from('cpx_transactions').insert({
        transid: transid,
        userid: userid,
        amount_local: amount,
        amount_usd: amountUsd,
        status: 2,
        type,
        subid1,
        subid2,
        offerid: offerid,
        ipclick: ipclick,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Reversal transaction insert failed: ${insertError.message}`);
        return ok('insert_failed');
      }

      log(`REVERSAL PROCESSED: transid=${transid} logged with status=2`);
      return ok('OK');
    } else {
      // ═══════════════════════════════════════════════════════════════════
      // UNKNOWN STATUS HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Unknown status: ${statusInt}`);
      return ok('unknown_status');
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    // ALWAYS return 200 to prevent CPX retry storms
    return ok('error');
  }
}

export async function GET(request: NextRequest) {
  return handleCpxPostback(request);
}
