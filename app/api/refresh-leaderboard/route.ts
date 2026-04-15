/**
 * Leaderboard Refresh API Endpoint
 * 
 * This endpoint refreshes the leaderboard cache with top 10 users
 * based on their monthly earnings (this_month_earnings).
 * 
 * Called by GitHub Actions every 6 hours.
 * 
 * Security: Protected by API key in Authorization header
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

function ok(data: any) {
  return NextResponse.json(data, { status: 200 });
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

async function handleRefreshLeaderboard(request: NextRequest) {
  const log = (msg: string) => console.log('[refresh-leaderboard]', msg);

  try {
    // ── 1. Security: Check API key ───────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.LEADERBOARD_REFRESH_KEY;
    
    if (!expectedKey) {
      log('LEADERBOARD_REFRESH_KEY not configured');
      return unauthorized('Service not configured');
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      log('Invalid or missing authorization header');
      return unauthorized('Unauthorized');
    }
    
    log('Authorization verified');

    // ── 2. Initialize Supabase ───────────────────────────────────────────
    const supabase = getSupabase();

    // ── 3. Refresh leaderboard cache ─────────────────────────────────────
    log('Refreshing leaderboard cache...');
    
    const { error: refreshError } = await supabase.rpc('refresh_leaderboard_cache');
    
    if (refreshError) {
      log(`Refresh failed: ${refreshError.message}`);
      return NextResponse.json({ 
        error: 'Refresh failed', 
        details: refreshError.message 
      }, { status: 500 });
    }

    // ── 4. Get updated leaderboard for verification ──────────────────────
    const { data: leaderboard, error: fetchError } = await supabase
      .from('leaderboard_cache')
      .select('rank, display_name, monthly_earnings, updated_at')
      .order('rank', { ascending: true });

    if (fetchError) {
      log(`Fetch failed: ${fetchError.message}`);
      return NextResponse.json({ 
        error: 'Fetch failed', 
        details: fetchError.message 
      }, { status: 500 });
    }

    log(`Leaderboard refreshed successfully with ${leaderboard?.length || 0} users`);

    return ok({
      success: true,
      message: 'Leaderboard refreshed successfully',
      count: leaderboard?.length || 0,
      leaderboard: leaderboard || [],
      refreshed_at: new Date().toISOString()
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    log(`Unexpected error: ${message}`);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleRefreshLeaderboard(request);
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  return handleRefreshLeaderboard(request);
}