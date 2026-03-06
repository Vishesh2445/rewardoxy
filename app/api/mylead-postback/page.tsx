import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('x-signature') || 
             new URL(request.url).searchParams.get('sig') || 
             new URL(request.url).searchParams.get('mll') || '';
  
  if (sig !== process.env.POSTBACK_SECRET) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const url = new URL(request.url);
  const player_id = url.searchParams.get('player_id') || url.searchParams.get('ml_sub1');
  const program_id = url.searchParams.get('program_id');  // MyLead standard
  const payout = parseFloat(url.searchParams.get('payout') || '0');

  if (!player_id || !program_id || payout <= 0) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check duplicate using program_id
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('player_id', player_id)
    .eq('program_id', program_id)  // Updated to program_id
    .maybeSingle();

  // Log to queue
  const queueStatus = existing ? 'duplicate' : 'processed';
  await supabase.from('postback_queue').insert({
    player_id,
    program_id,  // Updated
    payout,
    status: queueStatus
  });

  if (existing) {
    return new Response('OK', { status: 200 });  // MyLead expects plain text
  }

  // Credit instantly
  const coins = Math.floor(payout * 80);
  await supabase.from('completions').insert({ 
    player_id, 
    program_id,  // Updated
    payout, 
    coins_awarded: coins 
  });
  await supabase.rpc('increment_coins', { p_user_id: player_id, p_amount: coins });

  return new Response('OK', { status: 200 });  // Plain text for MyLead
}

export async function GET(request: NextRequest) {
  return POST(request);  // Handle MyLead test
}
