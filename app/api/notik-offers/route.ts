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

    // Get IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    let ip = cfConnectingIp || forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';
    
    // If IP is localhost, use a default IP (Notik might reject localhost IPs)
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      ip = '8.8.8.8'; // Use a public IP as fallback for testing
      console.log('[notik-offers] Localhost detected, using fallback IP:', ip);
    }

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    // Parse device info from user agent
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    
    // Map to Notik's accepted device_name values: iphone, ipad, other
    let device_name = 'other';
    if (/iPhone/.test(userAgent)) {
      device_name = 'iphone';
    } else if (/iPad/.test(userAgent)) {
      device_name = 'ipad';
    }

    // Build the filtered API URL with ONLY required parameters (no optional ones that might cause issues)
    const urlParams = [
      `api_key=${encodeURIComponent(NOTIK_API_KEY)}`,
      `pub_id=${encodeURIComponent(NOTIK_PUBLISHER_ID)}`,
      `app_id=${encodeURIComponent(NOTIK_APP_ID)}`,
      `user_id=${encodeURIComponent(user_id)}`,
      `device_name=${encodeURIComponent(device_name)}`,
      `device_type=${encodeURIComponent(device_type)}`,
      `device_os=${encodeURIComponent(device_os)}`,
      `country_code=${encodeURIComponent(countryCode)}`,
      `user_agent=${encodeURIComponent(userAgent)}`,
      `ip=${encodeURIComponent(ip)}`
    ];
    
    const apiUrl = `https://notik.me/api/v1/get-offers/filtered?${urlParams.join('&')}`;
    
    console.log('[notik-offers] Fetching from Notik filtered API');
    console.log('[notik-offers] Parameters - country:', countryCode, 'device_name:', device_name, 'device_type:', device_type, 'device_os:', device_os, 'ip:', ip);

    const response = await fetch(apiUrl, {
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
      console.log('[notik-offers] Response:', responseText.substring(0, 300));
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
    
    console.log('[notik-offers] Notik API response status:', data.status);
    if (data.status === 'failed') {
      console.log('[notik-offers] Notik error:', data.code, data.data);
    }
    
    let allOffers: any[] = [];
    
    // Parse the response structure
    if (data.status === 'success' && Array.isArray(data.offers)) {
      allOffers = data.offers;
    } else if (Array.isArray(data.offers)) {
      allOffers = data.offers;
    } else if (Array.isArray(data)) {
      allOffers = data;
    }
    
    console.log('[notik-offers] Parsed offers count:', allOffers.length);
    
    // Replace user ID macro in click URLs and normalize offer structure
    const processedOffers = allOffers.map((offer: any) => {
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
