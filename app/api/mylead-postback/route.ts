import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function handlePostback(request: NextRequest) {
  // Signature (sig, mll, x-signature)
  const sig = request.headers.get('x-signature') ||
             new URL(request.url).searchParams.get('sig') ||
             new URL(request.url).searchParams.get('mll') || '';

  if (sig !== process.env.POSTBACK_SECRET) {
    console.error('Invalid sig:', sig);
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  const url = new URL(request.url);
  const player_id = url.searchParams.get('player_id');
  const payout = parseFloat(url.searchParams.get('payout') || '0');
  const program_id = url.searchParams.get('program_id') || 'unknown';

  if (!player_id || payout <= 0) {
    console.error('Invalid params:', { player_id, payout });
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  const coins = Math.floor(payout * 80); // $1 = 80 coins
  console.log('Postback:', { player_id, program_id, payout, coins });

  // Duplicate check (24h window)
  const { data: existing } = await supabase
    .from('postback_queue')
    .select('id')
    .eq('player_id', player_id)
    .eq('program_id', program_id)  // Now program_id only
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single();

  const status = existing ? 'duplicate' : 'processed';

  await supabase.from('postback_queue').insert({
    player_id,
    program_id,  // No offer_id
    payout,
    coins_awarded: coins,
    status
  });

  if (!existing) {
    // Instant credit
    const { error } = await supabase.rpc('increment_coins', {
      p_user_id: player_id,
      p_amount: coins
    });
    if (error) console.error('Credit failed:', error);
    else console.log('✅ Credited', coins, 'to', player_id);
  } else {
    console.log('⏭️ Duplicate skipped:', player_id, program_id);
  }

  return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

export async function GET(request: NextRequest) {
  return handlePostback(request);  // MyLead test
}
