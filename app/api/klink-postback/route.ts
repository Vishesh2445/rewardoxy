import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const KLINK_IPS = [
  '34.118.33.53',
  '138.68.125.171',
  '64.226.93.56',
];

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

function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

async function handleKlinkPostback(request: NextRequest) {
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log('[klink-postback]', msg); };

  try {
    const clientIp = getRealIP(request);
    log(`Method: ${request.method}, IP: ${clientIp}`);
    log(`URL: ${request.url}`);

    // ── 1. IP Whitelisting ───────────────────────────────────────────────
    if (!KLINK_IPS.includes(clientIp)) {
      log(`IP not whitelisted: ${clientIp}`);
      return ok('Unauthorized');
    }

    // ── 2. Parse payload (GET query params or POST JSON body) ────────────
    let payload: Record<string, string> = {};

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        payload = body;
      } catch {
        log('Failed to parse POST body as JSON');
        return ok('Unauthorized');
      }
    } else {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        payload[key] = value;
      });
    }

    log(`Payload: ${JSON.stringify(payload)}`);

    // ── 3. Extract Klink parameters ─────────────────────────────────────
    const conversionId = payload.conversionId || '';
    const userId = payload.userId || '';
    const offerId = payload.offerId || '';
    const offerName = payload.offerName || '';
    const eventId = payload.eventId || '';
    const eventName = payload.eventName || '';
    const taskId = payload.taskId || '';
    const eventType = payload.eventType || '';
    const payoutStr = payload.payout || '0';
    const status = payload.status || '';
    const reversedConversionId = payload.reversedConversionId || null;
    const k1 = payload.k1 || null;
    const k2 = payload.k2 || null;
    const k3 = payload.k3 || null;
    const k4 = payload.k4 || null;
    const k5 = payload.k5 || null;

    log(`Parsed: conversionId=${conversionId}, userId=${userId}, eventType=${eventType}, payout=${payoutStr}, status=${status}`);

    // ── 4. Validate required parameters ──────────────────────────────────
    if (!conversionId || !userId || !eventType) {
      log(`Missing required params: conversionId=${conversionId}, userId=${userId}, eventType=${eventType}`);
      return ok('Unauthorized');
    }

    if (eventType !== 'conversion' && eventType !== 'chargeback') {
      log(`Unknown eventType: ${eventType}`);
      return ok('Unauthorized');
    }

    // ── 5. Parse payout ─────────────────────────────────────────────────
    const payoutRaw = parseFloat(payoutStr || '0');
    const payoutAbs = Math.abs(payoutRaw);
    const coinsToCredit = Math.round(payoutAbs);
    const isConversion = eventType === 'conversion';

    log(`Payout: $${payoutRaw}, Coins: ${coinsToCredit}, Type: ${eventType}`);

    // ── 6. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 7. Check for duplicate conversion ─────────────────────────────────
    const { data: existing, error: checkError } = await supabase
      .from('klink_transactions')
      .select('id, event_type')
      .eq('conversion_id', conversionId)
      .eq('event_type', eventType)
      .limit(1);

    if (checkError) {
      log(`Duplicate check error: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      log(`DUPLICATE IGNORED: conversionId=${conversionId} already processed as ${eventType}`);
      return ok('Approved');
    }

    // ── 8. Handle conversion vs chargeback ────────────────────────────────
    if (isConversion) {
      // ═══════════════════════════════════════════════════════════════════
      // CONVERSION HANDLER
      // ═══════════════════════════════════════════════════════════════════
      if (coinsToCredit > 0) {
        // Look up user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, coins_balance, total_earned')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          log(`User not found: ${userId}`);
          return ok('Approved');
        }

        log(`User balance BEFORE credit: coins=${userData.coins_balance}, total_earned=${userData.total_earned}`);
        log(`Crediting user: ${userId}, coins=${coinsToCredit}`);

        const { data: creditResult, error: creditError } = await supabase.rpc('credit_postback', {
          p_user_id: userId,
          p_amount: coinsToCredit
        });

        if (creditError) {
          log(`Credit RPC failed: ${creditError.message}`);
          return ok('Approved');
        }

        const newBalance = creditResult?.[0]?.new_balance ?? creditResult?.new_balance ?? '?';
        const newTotal = creditResult?.[0]?.new_total ?? creditResult?.new_total ?? '?';
        log(`SUCCESS: Credited ${coinsToCredit} to user ${userId}. New balance: ${newBalance}, New total: ${newTotal}`);

        // Update offer interaction if exists (by offerId or conversionId)
        if (offerId) {
          const { data: interaction } = await supabase
            .from('user_offer_interactions')
            .select('id')
            .eq('user_id', userId)
            .eq('offer_id', offerId)
            .eq('provider', 'klink')
            .single();

          if (interaction) {
            log(`Updating Klink offer status to completed: offer_id=${offerId}`);
            const { error: updateError } = await supabase
              .from('user_offer_interactions')
              .update({ status: 'completed' })
              .eq('id', interaction.id);

            if (updateError) {
              log(`Offer status update failed: ${updateError.message}`);
            } else {
              log(`Offer status updated to completed`);
            }
          }
        }

        // Enqueue referral commissions
        try {
          await supabase.rpc('enqueue_commissions', { p_earner_id: userId, p_amount: coinsToCredit, p_source: 'klink' });
          log('Referral commissions enqueued');
        } catch (e: unknown) {
          log(`Enqueue commissions error: ${e instanceof Error ? e.message : 'Unknown'}`);
        }
      } else {
        log(`Coins to credit is 0, skipping credit`);
      }

    } else {
      // ═══════════════════════════════════════════════════════════════════
      // CHARGEBACK HANDLER
      // ═══════════════════════════════════════════════════════════════════
      log(`Processing chargeback: conversionId=${conversionId}, payout=${payoutRaw}`);

      if (coinsToCredit > 0) {
        const { data: userData, error: userLookupError } = await supabase
          .from('users')
          .select('id, coins_balance, total_earned')
          .eq('id', userId)
          .single();

        if (userLookupError || !userData) {
          log(`User not found for chargeback: ${userId}`);
          return ok('Approved');
        }

        log(`User balance BEFORE deduction: ${userData.coins_balance}`);
        log(`Deducting ${coinsToCredit} coins from user ${userId}`);

        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_points', {
          p_userid: userId,
          p_amount: coinsToCredit
        });

        if (deductError) {
          log(`Deduct RPC failed: ${deductError.message}`);
          return ok('Approved');
        }

        const newBalance = deductResult?.[0]?.new_balance ?? deductResult?.new_balance ?? '?';
        log(`SUCCESS: Deducted ${coinsToCredit} from user ${userId}. New balance: ${newBalance}`);
      } else {
        log(`NOT deducting: amount is 0`);
      }
    }

    // ── 9. Log transaction ──────────────────────────────────────────────
    const { error: insertError } = await supabase.from('klink_transactions').insert({
      conversion_id: conversionId,
      user_id: userId,
      offer_id: offerId || null,
      offer_name: offerName || null,
      event_id: eventId || null,
      event_name: eventName || null,
      task_id: taskId || null,
      event_type: eventType,
      payout: payoutRaw,
      status: status || (isConversion ? 'completed' : 'cancelled'),
      reversed_conversion_id: reversedConversionId,
      k1, k2, k3, k4, k5,
      coins_awarded: isConversion ? coinsToCredit : -coinsToCredit,
      source_ip: clientIp,
      raw_payload: payload,
    });

    if (insertError) {
      log(`Transaction insert failed: ${insertError.message}`);
    } else {
      log(`Transaction logged: conversionId=${conversionId}`);
    }

    return ok('Approved');

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`UNEXPECTED ERROR: ${message}`);
    return ok('Approved');
  }
}

export async function GET(request: NextRequest) {
  return handleKlinkPostback(request);
}

export async function POST(request: NextRequest) {
  return handleKlinkPostback(request);
}
