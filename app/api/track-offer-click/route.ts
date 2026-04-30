/**
 * Track Offer Click API
 * 
 * Records when a user clicks on an offer to start tracking their progress.
 * This endpoint is called when users click "Play and Earn" button in OfferDetailsModal.
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      offer_id,
      offer_name,
      provider,
      click_url,
      image_url,
      payout,
      tracking_type,
      events
    } = body;

    // Validate required fields
    if (!user_id || !offer_id || !offer_name || !provider || !click_url || payout === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if offer click already exists (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('user_offer_interactions')
      .select('id, clicked_at')
      .eq('user_id', user_id)
      .eq('offer_id', offer_id)
      .eq('provider', provider)
      .gte('clicked_at', twentyFourHoursAgo)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Offer click already tracked',
        data: existing
      });
    }

    // Insert new offer interaction
    const { data, error } = await supabase
      .from('user_offer_interactions')
      .insert({
        user_id,
        offer_id,
        offer_name,
        provider: provider.toLowerCase(),
        click_url,
        image_url,
        payout: parseFloat(payout),
        tracking_type: tracking_type?.toUpperCase() || null,
        status: 'started',
        events_json: events || []
      })
      .select()
      .single();

    if (error) {
      console.error('[track-offer-click] Insert error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Offer click tracked successfully',
      data
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[track-offer-click] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
