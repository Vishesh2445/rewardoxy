/**
 * TheoremReach Test Endpoint
 * 
 * This endpoint helps debug the TheoremReach integration.
 * It returns diagnostic information about the configuration.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'test-user-123';

    // Check environment variables
    const apiKey = process.env.THEOREMREACH_API_KEY;
    const secretKey = process.env.THEOREMREACH_SECRET_KEY;
    const publicApiKey = process.env.NEXT_PUBLIC_THEOREMREACH_API_KEY;
    const placementId = process.env.NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      userId: userId,
      environment: {
        THEOREMREACH_API_KEY: apiKey ? '✅ SET' : '❌ MISSING',
        THEOREMREACH_SECRET_KEY: secretKey ? '✅ SET' : '❌ MISSING',
        NEXT_PUBLIC_THEOREMREACH_API_KEY: publicApiKey ? '✅ SET' : '❌ MISSING',
        NEXT_PUBLIC_THEOREMREACH_PLACEMENT_ID: placementId ? '✅ SET' : '❌ MISSING',
      },
      values: {
        api_key: apiKey || 'NOT SET',
        placement_id: placementId || 'NOT SET',
      },
      testUrl: {
        endpoint: '/api/theoremreach-url',
        params: `?user_id=${userId}`,
        fullUrl: `/api/theoremreach-url?user_id=${userId}`,
      },
      instructions: [
        '1. Copy the fullUrl above',
        '2. Paste it in your browser address bar',
        '3. Check the response for the correct URL format',
        '4. Verify it contains: respondent_entry/direct',
        '5. Verify it contains your user_id',
        '6. Verify it contains the hash parameter',
      ],
    };

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
