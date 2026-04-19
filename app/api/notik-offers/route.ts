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

    // Get country code from request headers or IP geolocation
    let countryCode = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country');
    
    // If no country from headers, try to detect from IP
    if (!countryCode) {
      try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const cfConnectingIp = request.headers.get('cf-connecting-ip');
        const clientIp = cfConnectingIp || forwardedFor?.split(',')[0]?.trim() || realIp;
        
        if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
          const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`, {
            redirect: 'follow'
          });
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.countryCode) {
              countryCode = geoData.countryCode;
            }
          }
        }
      } catch (geoError) {
        console.log('[notik-offers] Geo detection failed, using default');
      }
    }
    
    countryCode = countryCode || 'US';

    console.log('[notik-offers] Detected country:', countryCode);

    // Use v2 all-offers endpoint (same as iframe uses) instead of filtered endpoint
    // The filtered endpoint seems to have stricter filtering or different access
    const v2Url = `https://notik.me/api/v2/get-offers/all?api_key=${encodeURIComponent(NOTIK_API_KEY)}&pub_id=${encodeURIComponent(NOTIK_PUBLISHER_ID)}&app_id=${encodeURIComponent(NOTIK_APP_ID)}`;
    
    console.log('[notik-offers] Fetching from Notik v2 all-offers endpoint');

    const response = await fetch(v2Url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      console.error('[notik-offers] API error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch offers from Notik' },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    
    if (!responseText) {
      console.log('[notik-offers] Empty response from Notik API');
      return NextResponse.json(
        { success: true, offers: [], total: 0, country: countryCode }
      );
    }

    // Check if response is HTML (error page) instead of JSON
    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
      console.log('[notik-offers] Received HTML response instead of JSON');
      return NextResponse.json(
        { success: true, offers: [], total: 0, country: countryCode }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[notik-offers] JSON parse error:', parseError);
      console.log('[notik-offers] Response text:', responseText.substring(0, 200));
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response' },
        { status: 500 }
      );
    }
    
    console.log('[notik-offers] Notik API response received');
    
    let allOffers: any[] = [];
    
    // Parse the response structure from v2 all-offers endpoint
    if (data.offers && typeof data.offers === 'object') {
      if (Array.isArray(data.offers)) {
        allOffers = data.offers;
      } else if (data.offers.data && Array.isArray(data.offers.data)) {
        allOffers = data.offers.data;
      } else if (data.offers.all && Array.isArray(data.offers.all)) {
        allOffers = data.offers.all;
      } else if (data.offers.android || data.offers.ios) {
        // Handle platform-specific offers
        allOffers = (data.offers.android || []).concat(data.offers.ios || []);
      }
    } else if (Array.isArray(data.offers)) {
      allOffers = data.offers;
    } else if (Array.isArray(data)) {
      allOffers = data;
    }
    
    console.log('[notik-offers] Total offers from API:', allOffers.length);
    
    // Filter offers by country if country info is available in offers
    // The offers should have country_codes or similar field
    let filteredOffers = allOffers;
    
    // Check if offers have country filtering info
    const offersWithCountry = allOffers.filter((offer: any) => {
      if (!offer.country_codes && !offer.countries) {
        // If no country restriction, include it
        return true;
      }
      
      const countryCodes = offer.country_codes || offer.countries || [];
      const countryArray = Array.isArray(countryCodes) ? countryCodes : 
                          typeof countryCodes === 'string' ? countryCodes.split(',') : [];
      
      // Include offer if it's available in user's country
      return countryArray.length === 0 || countryArray.includes(countryCode);
    });
    
    console.log('[notik-offers] Offers available for country', countryCode + ':', offersWithCountry.length);
    
    // Use filtered offers if we found country info, otherwise use all offers
    if (offersWithCountry.length > 0) {
      filteredOffers = offersWithCountry;
    }
    
    // Limit to first 50 offers for performance
    filteredOffers = filteredOffers.slice(0, 50);
    
    // Replace user ID macro in click URLs and normalize offer structure
    const processedOffers = filteredOffers.map((offer: any) => {
      // Normalize the offer structure to match frontend expectations
      const normalizedOffer = {
        offer_id: offer.offer_id || offer.id,
        id: offer.id || offer.offer_id,
        name: offer.name,
        description1: offer.description || offer.description1,
        description2: offer.description2,
        description3: offer.description3,
        image_url: offer.image_url || offer.image,
        payout: offer.payout,
        click_url: offer.click_url,
        categories: offer.categories || [],
        events: offer.events,
      };

      // Replace user ID macros in click URL
      if (normalizedOffer.click_url) {
        normalizedOffer.click_url = normalizedOffer.click_url
          .replace(/\[user_id\]/g, user_id)
          .replace(/{user_id}/g, user_id);
      }

      return normalizedOffer;
    });
    
    console.log('[notik-offers] Total offers after processing:', processedOffers.length);

    return NextResponse.json({
      success: true,
      offers: processedOffers,
      total: processedOffers.length,
      country: countryCode
    });

  } catch (error) {
    console.error('[notik-offers] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
