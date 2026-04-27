/**
 * TheoremReach Secure URL Generator
 * 
 * Generates a secure entry URL for TheoremReach surveywall with SHA1-HMAC hash.
 * This must be done server-side to keep the secret key secure.
 * 
 * Required by TheoremReach documentation:
 * - All entry URLs must include a hash parameter
 * - Hash is SHA1-HMAC of the full URL (including https://)
 * - Hash must be base64 encoded with URL-safe characters
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    console.log(`[theoremreach-url] Received request for user_id: ${userId}`);

    if (!userId) {
      console.error('[theoremreach-url] Missing user_id parameter');
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Get credentials from environment
    const apiKey = process.env.THEOREMREACH_API_KEY;
    const secretKey = process.env.THEOREMREACH_SECRET_KEY;
    const placementId = process.env.NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID;

    console.log(`[theoremreach-url] Credentials check - apiKey: ${apiKey ? 'present' : 'MISSING'}, secretKey: ${secretKey ? 'present' : 'MISSING'}, placementId: ${placementId}`);

    if (!apiKey || !secretKey || !placementId) {
      console.error('Missing TheoremReach credentials');
      return NextResponse.json(
        { error: 'TheoremReach not configured' },
        { status: 500 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `${userId}_${Date.now()}`;

    // Build the base URL with all required parameters
    const baseUrl = 'https://theoremreach.com/respondent_entry/direct';
    const params = new URLSearchParams({
      api_key: apiKey,
      user_id: userId,
      transaction_id: transactionId,
      currency_name_plural: 'Coins',
      currency_name_singular: 'Coin',
      exchange_rate: '700', // 700 coins = $1 USD
      external_id: userId,
      partner_id: placementId,
    });

    // Create the full URL without hash
    const urlBeforeHash = `${baseUrl}?${params.toString()}`;

    console.log(`[theoremreach-url] URL before hash: ${urlBeforeHash}`);

    // Generate SHA1-HMAC hash
    const hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(urlBeforeHash);
    const hash = hmac.digest('base64')
      .replace(/\+/g, '-')  // Replace + with -
      .replace(/\//g, '_')  // Replace / with _
      .replace(/=/g, '');   // Remove = padding

    // Add hash to URL
    const secureUrl = `${urlBeforeHash}&hash=${hash}`;

    console.log(`[theoremreach-url] Generated secure URL: ${secureUrl}`);

    return NextResponse.json({
      success: true,
      url: secureUrl,
      transaction_id: transactionId,
    });

  } catch (error) {
    console.error('Error generating TheoremReach URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate URL' },
      { status: 500 }
    );
  }
}
