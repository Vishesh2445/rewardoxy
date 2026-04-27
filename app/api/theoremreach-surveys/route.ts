/**
 * TheoremReach Surveys API
 * 
 * Fetches available surveys for a user from TheoremReach Surveys API.
 * Requires Publisher API to be enabled by TheoremReach Account Manager.
 * 
 * Documentation: https://theoremreach.com/docs/surveys-api
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userIp = searchParams.get('ip') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get credentials from environment
    const apiKey = process.env.THEOREMREACH_API_KEY;
    const secretKey = process.env.THEOREMREACH_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.error('[theoremreach-surveys] Missing TheoremReach credentials');
      return NextResponse.json(
        { error: 'TheoremReach not configured' },
        { status: 500 }
      );
    }

    // Build the API URL
    const baseUrl = 'https://api.theoremreach.com/api/publishers/v1/surveys';
    const params = new URLSearchParams({
      api_key: apiKey,
      user_id: userId,
      ip: userIp,
      max_result_count: '50', // Get up to 50 surveys
      allow_additional_questions: 'true',
      include_question_info: 'false',
    });

    const urlBeforeHash = `${baseUrl}?${params.toString()}`;

    // Generate HMAC SHA-1 hash (URL + empty body for GET request)
    const hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(urlBeforeHash);
    const hash = hmac.digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Add hash to URL
    const secureUrl = `${urlBeforeHash}&hash=${hash}`;

    console.log('[theoremreach-surveys] Fetching surveys for user:', userId);

    // Fetch surveys from TheoremReach
    const response = await fetch(secureUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[theoremreach-surveys] API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch surveys from TheoremReach', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[theoremreach-surveys] Received surveys:', data.surveys?.length || 0);

    // Transform surveys to match our format
    const surveys = (data.surveys || []).map((survey: any) => {
      // Calculate payout in USD (cpi is in cents)
      const payoutUsd = (survey.cpi || 0) / 100;
      
      // Calculate payout in coins (700 coins = $1)
      const payoutCoins = Math.round(payoutUsd * 700);

      return {
        id: `tr_${survey.campaign_id}_${survey.quota_id}`,
        campaign_id: survey.campaign_id,
        quota_id: survey.quota_id,
        loi: survey.loi || 0, // Length of interview in minutes
        payout_usd: payoutUsd,
        payout_coins: payoutCoins,
        conversion_rate: survey.incidence || 0,
        rank: survey.rank || 0,
        rating_count: survey.rating_count || 0,
        rating_avg: survey.average_rating || 0,
        entry_link: survey.entry_link || '',
        partial_match: survey.partial_match || false,
        type: 'theoremreach',
      };
    });

    // Sort by rank (higher is better)
    surveys.sort((a: any, b: any) => b.rank - a.rank);

    return NextResponse.json({
      success: true,
      surveys: surveys,
      count: surveys.length,
    });

  } catch (error) {
    console.error('[theoremreach-surveys] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
