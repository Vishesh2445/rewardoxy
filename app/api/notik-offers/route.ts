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
          const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`);
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

    // Get IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const ip = cfConnectingIp || forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';

    // Parse device info from user agent (basic parsing)
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const deviceName = isIOS ? 'iPhone' : isAndroid ? 'Android' : 'Desktop';
    
    // Extract browser info
    let browserName = 'Chrome';
    let browserVersion = '1.0';
    
    if (/Firefox/.test(userAgent)) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) browserVersion = match[1];
    } else if (/Chrome/.test(userAgent)) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) browserVersion = match[1];
    }

    // Get OS version (basic parsing)
    let osVersion = '1.0';
    if (isAndroid) {
      const match = userAgent.match(/Android\s([\d.]+)/);
      if (match) osVersion = match[1];
    } else if (isIOS) {
      const match = userAgent.match(/OS\s([\d_]+)/);
      if (match) osVersion = match[1].replace(/_/g, '.');
    }

    // Build the filtered API URL with all parameters
    const apiUrl = new URL('https://notik.me/api/v1/get-offers/filtered');
    apiUrl.searchParams.append('api_key', NOTIK_API_KEY);
    apiUrl.searchParams.append('pub_id', NOTIK_PUBLISHER_ID);
    apiUrl.searchParams.append('app_id', NOTIK_APP_ID);
    apiUrl.searchParams.append('user_id', user_id);
    apiUrl.searchParams.append('s1', user_id); // s1 is typically user_id
    apiUrl.searchParams.append('device_name', deviceName);
    apiUrl.searchParams.append('device_type', device_type);
    apiUrl.searchParams.append('device_os', device_os);
    apiUrl.searchParams.append('os_version', osVersion);
    apiUrl.searchParams.append('browser_name', browserName);
    apiUrl.searchParams.append('browser_version', browserVersion);
    apiUrl.searchParams.append('country_code', countryCode);
    apiUrl.searchParams.append('user_agent', userAgent);
    apiUrl.searchParams.append('ip', ip);
    
    console.log('[notik-offers] Fetching from Notik filtered API for country:', countryCode, 'IP:', ip);

    const response = await fetch(apiUrl.toString(), {
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
      } else if (Array.isArray(data.offers)) {
        allOffers = data.offers;
      } else if (data.offers.android || data.offers.ios || data.offers.all) {
        allOffers = data.offers.all || data.offers.android || data.offers.ios || [];
      } else {
        allOffers = Object.values(data.offers).filter(Array.isArray).flat();
      }
    } else if (Array.isArray(data)) {
      allOffers = data;
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
