import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const device_type = searchParams.get('device_type') || 'mobile';
    const device_os = searchParams.get('device_os') || 'android';

    console.log('[notik-offers] Request received, user_id:', user_id);

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      );
    }

    const NOTIK_API_KEY = process.env.NOTIK_API_KEY;
    const NOTIK_PUBLISHER_ID = process.env.NOTIK_PUBLISHER_ID;
    const NOTIK_APP_ID = process.env.NOTIK_APP_ID;

    if (!NOTIK_API_KEY || !NOTIK_PUBLISHER_ID || !NOTIK_APP_ID) {
      console.error('[notik-offers] Missing API credentials');
      return NextResponse.json(
        { success: false, error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    const apiUrl = `https://notik.me/api/v2/get-offers/all?api_key=${NOTIK_API_KEY}&pub_id=${NOTIK_PUBLISHER_ID}&app_id=${NOTIK_APP_ID}`;
    
    console.log('[notik-offers] Fetching from Notik API...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[notik-offers] API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch offers from Notik' },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    
    if (!responseText) {
      return NextResponse.json(
        { success: false, error: 'Empty response from Notik API' },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response' },
        { status: 500 }
      );
    }
    
    let allOffers: any[] = [];
    
    // Parse the response structure
    if (data.offers && typeof data.offers === 'object') {
      if (Array.isArray(data.offers.data)) {
        allOffers = data.offers.data;
      } else if (data.offers.android || data.offers.ios || data.offers.all) {
        allOffers = data.offers.all || data.offers.android || data.offers.ios || [];
      } else {
        allOffers = Object.values(data.offers);
      }
    }
    
    // Replace user ID macro in click URLs
    const processedOffers = allOffers.map((offer: any) => {
      if (offer.click_url) {
        // Replace common user ID macros with actual user ID
        offer.click_url = offer.click_url
          .replace(/{user_id}/g, user_id)
          .replace(/\[user_id\]/g, user_id)
          .replace(/{uid}/g, user_id)
          .replace(/\[uid\]/g, user_id)
          .replace(/{USER_ID}/g, user_id)
          .replace(/\[USER_ID\]/g, user_id);
      }
      return offer;
    });
    
    console.log('[notik-offers] Total offers:', processedOffers.length);

    return NextResponse.json({
      success: true,
      offers: processedOffers,
      total: processedOffers.length
    });

  } catch (error) {
    console.error('[notik-offers] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
