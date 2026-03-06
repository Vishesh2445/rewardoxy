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

async function handlePostback(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const sig = request.headers.get('x-signature') ||
               url.searchParams.get('sig') ||
               url.searchParams.get('mll') || '';

    const secret = process.env.POSTBACK_SECRET;
    if (!secret || sig !== secret) {
      return NextResponse.json(
        { error: 'invalid_signature', received: sig, secretSet: !!secret },
        { status: 200 }
      );
    }

    const player_id = url.searchParams.get('player_id');
    const payout = parseFloat(url.searchParams.get('payout') || '0');
    const program_id = url.searchParams.get('program_id') || 'unknown';

    if (!player_id || payout <= 0) {
      return NextResponse.json(
        { error: 'invalid_params', player_id, payout },
        { status: 200 }
      );
    }

    const coins = Math.floor(payout * 80);
    const supabase = getSupabase();

    // Duplicate check
    const { data: existing, error: checkError } = await supabase
      .from('completions')
      .select('id')
      .eq('player_id', player_id)
      .eq('program_id', program_id)
      .limit(1);

    if (checkError) {
      return NextResponse.json(
        { error: 'duplicate_check_failed', details: checkError.message },
        { status: 200 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ status: 'duplicate', player_id, program_id });
    }

    // Insert completion
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        player_id,
        program_id,
        payout,
        coins_earned: coins,
        offer_name: `Program ${program_id}`
      });

    if (completionError) {
      return NextResponse.json(
        { error: 'completion_insert_failed', details: completionError.message, code: completionError.code },
        { status: 200 }
      );
    }

    // Credit coins
    const { error: rpcError } = await supabase.rpc('increment_coins', {
      p_user_id: player_id,
      p_amount: coins
    });

    if (rpcError) {
      return NextResponse.json(
        { error: 'credit_failed', details: rpcError.message, code: rpcError.code },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: 'success',
      player_id,
      program_id,
      payout,
      coins_credited: coins
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'unexpected', details: message }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

export async function GET(request: NextRequest) {
  return handlePostback(request);
}
