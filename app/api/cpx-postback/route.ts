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
    // Parameter names match CPX Research dashboard placeholders exactly
    const user_id = url.searchParams.get('user_id');           // MANDATORY: {user_id}
    const amount_local = url.searchParams.get('amount_local'); // MANDATORY: {amount_local}
    const amount_usd = url.searchParams.get('amount_usd');     // MANDATORY: {amount_usd}
    const status = url.searchParams.get('status');             // recommended: {status} - 1 = completed, 2 = canceled
    const trans_id = url.searchParams.get('trans_id');         // recommended: {trans_id} - Unique transaction ID
    const hash = url.searchParams.get('hash');                 // recommended: {secure_hash} - MD5 hash for verification
    const type = url.searchParams.get('type');                 // optional: {type} - 'complete', 'out', 'bonus'
    const subid1 = url.searchParams.get('sub_id');             // optional: {subid_1} - Sub-identifier
    const subid2 = url.searchParams.get('sub_id_2');           // optional: {subid_2} - Sub-identifier
    const offer_id = url.searchParams.get('offer_id');         // optional: {offer_ID} - Survey/offer ID
    const ip_click = url.searchParams.get('ip_click');         // optional: {ip_click} - User's IP at click time

    log(`Parsed: user_id=${user_id}, trans_id=${trans_id}, amount_local=${amount_local}, amount_usd=${amount_usd}, status=${status}, type=${type}, hash=${hash}`);

    // ── 2. Validate minimum required parameters ─────────────────────────
    if (!user_id || !trans_id || amount_local === null || amount_usd === null) {
      log(`Missing required params: user_id=${user_id}, trans_id=${trans_id}, amount_local=${amount_local}, amount_usd=${amount_usd}`);
      // ALWAYS return 200 to prevent CPX retry storms
      return ok('missing_params');
    }

    // ── 3. Hash Verification (Security — MUST implement) ─────────────────
    const CPX_SECURE_HASH = process.env.CPX_SECURE_HASH;

    if (hash && hash.trim() !== '') {
      if (!CPX_SECURE_HASH) {
        log('WARNING: CPX_SECURE_HASH env var is not set — cannot validate hash');
      } else {
        const expectedHash = crypto.createHash('md5').update(`${trans_id}-${CPX_SECURE_HASH}`).digest('hex');
        if (hash !== expectedHash) {
          log(`HASH MISMATCH: trans_id=${trans_id}, received="${hash}", expected="${expectedHash}"`);
          // Do NOT credit user, but return 200 to prevent retry storms
          return ok('hash_mismatch');
        }
        log('Hash validation PASSED');
      }
    } else {
      log('Hash check skipped (hash param empty - feature may not be activated)');
    }

    // ── 4. Parse amounts ─────────────────────────────────────────────────
    const amount = parseFloat(amount_local || '0');
    const amountUsd = parseFloat(amount_usd || '0');
    const statusInt = parseInt(status || '1');

    log(`Parsed amounts: amount_local=${amount}, amount_usd=${amountUsd}, status=${statusInt}, type=${type}`);

    // ── 5. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 6. Handle COMPLETION (status=1) ──────────────────────────────────
    if (statusInt === 1) {
      // Check for duplicate (same trans_id AND status=1)
      const { data: existing, error: checkError } = await supabase
        .from('cpx_transactions')
        .select('id')
        .eq('transid', trans_id)
        .eq('status', 1)
        .limit(1);

      if (checkError) {
        log(`Duplicate check error: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        log(`DUPLICATE IGNORED: trans_id=${trans_id} already processed with status=1`);
        return ok('duplicate_ignored');
      }

      // Credit user if amount > 0
      if (amount > 0) {
        log(`Crediting user: user_id=${user_id}, amount=${amount}`);

        const { error: creditError } = await supabase.rpc('add_user_points', {
          p_userid: user_id,
          p_amount: amount
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          // Still log the transaction even if credit fails
        } else {
          log(`SUCCESS: Credited ${amount} to user ${user_id}`);
        }
      } else {
        log(`Amount is 0, skipping credit (type=${type})`);
      }

      // Log transaction
      const { error: insertError } = await supabase.from('cpx_transactions').insert({
        transid: trans_id,
        userid: user_id,
        amount_local: amount,
        amount_usd: amountUsd,
        status: 1,
        type,
        subid1,
        subid2,
        offerid: offer_id,
        ipclick: ip_click,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (insertError) {
        log(`Transaction log insert failed: ${insertError.message}`);
        return ok('insert_failed');
      }

      log(`Transaction logged: trans_id=${trans_id}, status=1`);
      return ok('OK');
    }

    // ── 7. Handle REVERSAL (status=2) ────────────────────────────────────
    if (statusInt === 2) {
      log(`REVERSAL: trans_id=${trans_id}, user_id=${user_id}, amount=${amount}`);

      // Find the original completed transaction
      const { data: original, error: findError } = await supabase
        .from('cpx_transactions')
        .select('*')
        .eq('transid', trans_id)
        .eq('status', 1)
        .limit(1);

      if (findError) {
        log(`Reversal lookup error: ${findError.message}`);
      }

      if (!original || original.length === 0) {
        log(`REVERSAL NO ORIGINAL: trans_id=${trans_id} not found with status=1`);
        return ok('reversal_no_original');
      }

      // Check user reversal rate (don't punish good users)
      const { data: userCompletions } = await supabase
        .from('cpx_transactions')
        .select('id')
        .eq('userid', user_id)
        .eq('status', 1);

      const { data: userReversals } = await supabase
        .from('cpx_transactions')
        .select('id')
        .eq('userid', user_id)
        .eq('status', 2);

      const completionCount = userCompletions?.length || 0;
      const reversalCount = userReversals?.length || 0;
      const reversalRate = completionCount > 0 ? reversalCount / completionCount : 0;

      log(`User reversal stats: completions=${completionCount}, reversals=${reversalCount}, rate=${(reversalRate * 100).toFixed(2)}%`);

      // Only deduct if reversal rate >= 5%
      if (reversalRate >= 0.05 && amount > 0) {
        log(`Deducting points: reversal rate ${(reversalRate * 100).toFixed(2)}% >= 5%`);

        const { error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: user_id,
          p_amount: amount
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
        } else {
          log(`SUCCESS: Deducted ${amount} from user ${user_id}`);
        }
      } else {
        if (reversalRate < 0.05) {
          log(`NOT deducting: reversal rate ${(reversalRate * 100).toFixed(2)}% < 5% (good user)`);
        } else {
          log(`NOT deducting: amount is 0`);
        }
      }

      // Update transaction status to 2 (reversed)
      const { error: updateError } = await supabase
        .from('cpx_transactions')
        .update({
          status: 2,
          updated_at: new Date().toISOString()
        })
        .eq('transid', trans_id)
        .eq('status', 1);

      if (updateError) {
        log(`Transaction update failed: ${updateError.message}`);
        return ok('update_failed');
      }

      log(`REVERSAL PROCESSED: trans_id=${trans_id} updated to status=2`);
      return ok('OK');
    }

    // ── 8. Unknown status ────────────────────────────────────────────────
    log(`Unknown status: ${statusInt}`);
    return ok('unknown_status');

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
