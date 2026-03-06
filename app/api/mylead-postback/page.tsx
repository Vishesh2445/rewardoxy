import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('x-signature') || new URL(request.url).searchParams.get('sig') || '';
  if (sig !== process.env.POSTBACK_SECRET) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const url = new URL(request.url);
  const player_id = url.searchParams.get('player_id') || url.searchParams.get('ml_sub1');
  const offer_id = url.searchParams.get('offer_id') || url.searchParams.get('program_id');
  const payout = parseFloat(url.searchParams.get('payout') || '0');

  if (!player_id || !offer_id || payout <= 0) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Check duplicate
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('player_id', player_id)
    .eq('offer_id', offer_id)
    .maybeSingle();

  // Always log to queue
  const queueStatus = existing ? 'duplicate' : 'processed';
  await supabase.from('postback_queue').insert({
    player_id,
    offer_id,
    payout,
    status: queueStatus
  });

  if (existing) {
    return NextResponse.json({ status: 'duplicate' }, { status: 200 });
  }

  // Credit instantly
  const coins = Math.floor(payout * 80);
  await supabase.from('completions').insert({ player_id, offer_id, payout, coins_awarded: coins });
  await supabase.rpc('increment_coins', { p_user_id: player_id, p_amount: coins });

  return NextResponse.json({ status: 'credited', coins }, { status: 200 });
}
