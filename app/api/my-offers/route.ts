/**
 * My Offers API
 * 
 * Fetches all offers the user has clicked/started, grouped by status.
 * Returns offers with milestone progress data for CPE tracking type.
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Fetch all user offer interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_offer_interactions')
      .select('*')
      .eq('user_id', user_id)
      .order('clicked_at', { ascending: false });

    if (interactionsError) {
      console.error('[my-offers] Interactions error:', interactionsError);
      return NextResponse.json(
        { success: false, error: interactionsError.message },
        { status: 500 }
      );
    }

    // Fetch all milestone progress for this user
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestone_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_reversed', false);

    if (milestonesError) {
      console.error('[my-offers] Milestones error:', milestonesError);
      return NextResponse.json(
        { success: false, error: milestonesError.message },
        { status: 500 }
      );
    }

    // Group milestones by offer
    const milestonesByOffer = new Map<string, any[]>();
    milestones?.forEach((milestone) => {
      const key = `${milestone.offer_id}_${milestone.provider}`;
      if (!milestonesByOffer.has(key)) {
        milestonesByOffer.set(key, []);
      }
      milestonesByOffer.get(key)!.push(milestone);
    });

    // Enrich interactions with milestone progress
    const enrichedOffers = interactions?.map((interaction) => {
      const key = `${interaction.offer_id}_${interaction.provider}`;
      const completedMilestones = milestonesByOffer.get(key) || [];
      const events = interaction.events_json || [];
      const totalMilestones = events.length;
      const completedCount = completedMilestones.length;
      const completedMilestoneIds = completedMilestones.map((m) => m.event_id);

      return {
        ...interaction,
        milestone_progress: {
          completed_count: completedCount,
          total_count: totalMilestones,
          completed_milestone_ids: completedMilestoneIds,
          completed_milestones: completedMilestones
        }
      };
    }) || [];

    // Group by status
    const started = enrichedOffers.filter((o) => o.status === 'started');
    const inProgress = enrichedOffers.filter((o) => o.status === 'in_progress');
    const completed = enrichedOffers.filter((o) => o.status === 'completed');

    return NextResponse.json({
      success: true,
      data: {
        started,
        in_progress: inProgress,
        completed,
        total: enrichedOffers.length
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[my-offers] Error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
