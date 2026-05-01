import { NextRequest, NextResponse } from 'next/server';

// Convert coins to dollars (1000 coins = 1 dollar)
function convertToUSD(amount: number | string | undefined): number {
  if (!amount) return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  // Round to 2 decimal places
  return Math.round((num / 1000) * 100) / 100;
}

// Extracts client IP from various headers
function getClientIp(request: NextRequest): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  const clientIp = cfConnectingIp || forwardedFor?.split(',')[0]?.trim() || realIp || null;

  // Validate IP format (basic check) - must be valid IPv4
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' && /^[\d.]+$/.test(clientIp)) {
    return clientIp;
  }

  // Return a default valid IP if we can't detect one
  return '1.1.1.1';
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

    const REVTOO_API_KEY = process.env.REVTOO_API_KEY;

    if (!REVTOO_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Revtoo API key not configured' },
        { status: 500 }
      );
    }

    // Get country code from headers
    const cfCountry = request.headers.get('cf-ipcountry');
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const countryCode = cfCountry || vercelCountry || 'US';

    // Get client IP
    const clientIp = getClientIp(request);

    // Build Revtoo API URL with query parameters
    // Format: https://revtoo.com/api/offers/?api_key=KEY&user_id=USER_ID&countries=COUNTRY&limit=100
    const apiUrl = new URL('https://revtoo.com/api/offers/');
    apiUrl.searchParams.append('api_key', REVTOO_API_KEY);
    apiUrl.searchParams.append('user_id', user_id);
    apiUrl.searchParams.append('countries', countryCode);
    apiUrl.searchParams.append('limit', '100');
    apiUrl.searchParams.append('page', '1');

    console.log(`[Revtoo] Fetching offers for user ${user_id}, country: ${countryCode}, URL: ${apiUrl.toString()}`);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.error(`[Revtoo] API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `Failed to fetch offers from Revtoo: ${response.status}` },
        { status: 500 }
      );
    }

    const responseText = await response.text();

    if (!responseText) {
      return NextResponse.json(
        { success: true, offers: [], total: 0, country: countryCode }
      );
    }

    // Check if response is HTML (error page) instead of JSON
    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
      console.error('[Revtoo] Received HTML instead of JSON');
      return NextResponse.json(
        { success: true, offers: [], total: 0, country: countryCode }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Revtoo] JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response from Revtoo' },
        { status: 500 }
      );
    }

    console.log(`[Revtoo] Response structure:`, Object.keys(data));

    let allOffers: any[] = [];

    // Parse the response structure - support multiple formats
    if (data.offers && Array.isArray(data.offers)) {
      allOffers = data.offers;
    } else if (data.data && Array.isArray(data.data)) {
      allOffers = data.data;
    } else if (Array.isArray(data)) {
      allOffers = data;
    }

    console.log(`[Revtoo] Found ${allOffers.length} offers`);

    // Transform Revtoo offers to match our format
    const processedOffers = allOffers
      .filter((offer: any) => offer && (offer.offer_id || offer.id) && offer.name)
      .map((offer: any) => {
        // Normalize the offer structure
        const normalizedOffer = {
          offer_id: offer.offer_id || offer.id,
          id: offer.id || offer.offer_id,
          name: offer.name || offer.title,
          description1: offer.description || offer.description1 || '',
          description2: offer.description2 || '',
          description3: offer.description3 || '',
          image_url: offer.image_url || offer.image || offer.icon || '',
          payout: convertToUSD(offer.reward || offer.payout || 0),
          click_url: offer.click_url || offer.url || `https://revtoo.com/offerwall/${REVTOO_API_KEY}/${user_id}`,
          categories: offer.categories || offer.category || [],
          provider: 'Revtoo',
          device: offer.device || offer.devices || [],
          trackingType: offer.tracking_type || offer.trackingType || offer.type || '',
          events: offer.events?.map((event: any) => ({
            id: event.id || event.event_id,
            name: event.name || event.title,
            payout: convertToUSD(event.reward || event.payout),
          })) || [],
        };

        // Replace user ID macros in click URL
        if (normalizedOffer.click_url) {
          normalizedOffer.click_url = normalizedOffer.click_url
            .replace(/\{subId\}/g, user_id)
            .replace(/\[subId\]/g, user_id)
            .replace(/\{USER_ID\}/g, user_id)
            .replace(/\[USER_ID\]/g, user_id)
            .replace(/\{user_id\}/g, user_id)
            .replace(/\[user_id\]/g, user_id);
        }

        return normalizedOffer;
      });

    console.log(`[Revtoo] Processed ${processedOffers.length} offers`);

    return NextResponse.json({
      success: true,
      offers: processedOffers,
      total: processedOffers.length,
      country: countryCode,
    });

  } catch (error) {
    console.error('[Revtoo] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
