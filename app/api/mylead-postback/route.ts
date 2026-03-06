import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function handlePostback(request: NextRequest) {
  const url = new URL(request.url);

  // Signature (sig, mll, x-signature)
  const sig = request.headers.get('x-signature') ||
             url.searchParams.get('sig') ||
             url.searchParams.get('mll') || '';

  if (sig !== process.env.POSTBACK_SECRET) {
    console.error('Invalid sig:', sig);
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  const player_id = url.searchParams.get('player_id');
  const payout = parseFloat(url.searchParams.get('payout') || '0');
  const program_id = url.searchParams.get('program_id') || 'unknown';

  if (!player_id || payout <= 0) {
    console.error('Invalid params:', { player_id, payout });
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  const coins = Math.floor(payout * 80); // $1 = 80 coins
  console.log('Postback:', { player_id, program_id, payout, coins });

  // 1. Insert into postback_queue as 'pending' first
  const { error: queueError } = await supabase.from('postback_queue').insert({
    player_id,
    program_id,
    payout,
    coins_awarded: coins,
    status: 'pending'
  });

  if (queueError) {
    console.error('Queue insert failed:', queueError);
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  // 2. Duplicate check against completions table (matches GH Actions logic)
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('player_id', player_id)
    .eq('program_id', program_id)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('Duplicate skipped:', player_id, program_id);
    await supabase.from('postback_queue')
      .update({ status: 'duplicate' })
      .eq('player_id', player_id)
      .eq('program_id', program_id)
      .eq('status', 'pending');
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  // 3. Insert completion record (so dashboard can display it)
  const { error: completionError } = await supabase
    .from('completions')
    .insert({ player_id, program_id, payout, coins });

  if (completionError) {
    console.error('Completion insert failed:', completionError);
    // Leave queue as 'pending' so GH Actions can retry
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  // 4. Credit coins to user
  const { error: rpcError } = await supabase.rpc('increment_coins', {
    p_user_id: player_id,
    p_amount: coins
  });

  if (rpcError) {
    console.error('Credit failed:', rpcError);
    // Leave queue as 'pending' so GH Actions can retry
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  // 5. Mark as processed only after everything succeeded
  await supabase.from('postback_queue')
    .update({ status: 'processed' })
    .eq('player_id', player_id)
    .eq('program_id', program_id)
    .eq('status', 'pending');

  console.log('Credited', coins, 'coins to', player_id);
  return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

export async function POST(request: NextRequest) {
  return handlePostback(request);
}

export async function GET(request: NextRequest) {
  return handlePostback(request);
}
