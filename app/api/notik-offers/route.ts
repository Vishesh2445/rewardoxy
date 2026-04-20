import { NextRequest, NextResponse } from 'next/server';

// Convert coins to dollars (1000 coins = 1 dollar)
function convertToUSD(amount: number | string | undefined): number {
  if (!amount) return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  // Round to 2 decimal places
  return Math.round((num / 1000) * 100) / 100;
}

// Parse user agent to extract browser and OS details
function parseUserAgent(userAgent: string) {
  let browserName = 'unknown';
  let browserVersion = 'unknown';
  let osVersion = 'unknown';

  // Browser detection
  if (/Chrome/.test(userAgent)) {
    browserName = 'chrome';
    const match = userAgent.match(/Chrome\/(\d+(?:\.\d+)*)/);
    if (match) browserVersion = match[1];
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browserName = 'safari';
    const match = userAgent.match(/Version\/(\d+(?:\.\d+)*)/);
    if (match) browserVersion = match[1];
  } else if (/Firefox/.test(userAgent)) {
    browserName = 'firefox';
    const match = userAgent.match(/Firefox\/(\d+(?:\.\d+)*)/);
    if (match) browserVersion = match[1];
  } else if (/Edge/.test(userAgent)) {
    browserName = 'edge';
    const match = userAgent.match(/Edge\/(\d+(?:\.\d+)*)/);
    if (match) browserVersion = match[1];
  }

  // OS version detection
  if (/Windows NT/.test(userAgent)) {
    const match = userAgent.match(/Windows NT ([\d.]+)/);
    if (match) osVersion = match[1];
  } else if (/Mac OS X/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android ([\d.]+)/);
    if (match) osVersion = match[1];
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  }

  return { browserName, browserVersion, osVersion };
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
  // This is needed because Notik API requires valid IP format
  return '1.1.1.1';
}

// Detect country code from IP using geolocation service
async function getCountryCodeFromIp(clientIp: string): Promise<string | null> {
  // Don't try to geolocate localhost or invalid IPs
  if (clientIp === '1.1.1.1' || clientIp === '127.0.0.1' || clientIp === '::1' || !clientIp) {
    return null;
  }

  try {
    // Use multiple geolocation services for better accuracy
    const service1Promise = fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    const service2Promise = fetch(`https://ipapi.co/${clientIp}/json/`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(3000)
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    // Race both services, return first successful result
    const result1 = await service1Promise;
    if (result1?.countryCode) {
      return result1.countryCode;
    }

    const result2 = await service2Promise;
    if (result2?.country_code) {
      return result2.country_code;
    }

    if (result2?.country) {
      return result2.country;
    }
  } catch (geoError) {
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const s1 = searchParams.get('s1');
    const device_type = searchParams.get('device_type') || 'mobile';
    const device_os = searchParams.get('device_os') || 'android';
    const override_country = searchParams.get('country_code'); // Allow override for testing


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
      return NextResponse.json(
        { success: false, error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    // Get country code - try multiple methods
    let countryCode = override_country;

    // Method 1: Check Cloudflare or Vercel headers
    if (!countryCode) {
      countryCode = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || null;
    }

    // Method 2: Geolocate from IP
    if (!countryCode) {
      const clientIp = getClientIp(request);
      countryCode = await getCountryCodeFromIp(clientIp);
    }

    // Default fallback
    countryCode = countryCode || 'US';


    // Get user agent and parse device details
    const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0 (Unknown)';
    const { browserName, browserVersion, osVersion } = parseUserAgent(userAgent);
    const clientIp = getClientIp(request);

    // Determine device_name based on device_os
    let deviceName = 'other';
    if (device_os === 'ios') {
      // Check if iPad or iPhone from user agent
      if (/iPad/.test(userAgent)) {
        deviceName = 'ipad';
      } else if (/iPhone|iPod/.test(userAgent)) {
        deviceName = 'iphone';
      }
    }
    // For Android and Windows, use 'other' as per Notik docs

    // Build Notik v1 Filtered Offers API URL with all parameters
    // This endpoint filters offers based on user device and location
    const apiUrl = new URL('https://notik.me/api/v1/get-offers/filtered');

    // Required parameters
    apiUrl.searchParams.append('api_key', NOTIK_API_KEY);
    apiUrl.searchParams.append('pub_id', NOTIK_PUBLISHER_ID);
    apiUrl.searchParams.append('app_id', NOTIK_APP_ID);
    apiUrl.searchParams.append('user_id', user_id);
    apiUrl.searchParams.append('device_name', deviceName);
    apiUrl.searchParams.append('device_type', device_type);
    apiUrl.searchParams.append('device_os', device_os);
    apiUrl.searchParams.append('country_code', countryCode);
    apiUrl.searchParams.append('user_agent', userAgent);
    apiUrl.searchParams.append('ip', clientIp);

    // Optional parameters
    if (s1) apiUrl.searchParams.append('s1', s1);
    if (osVersion && osVersion !== 'unknown') apiUrl.searchParams.append('os_version', osVersion);
    if (browserName && browserName !== 'unknown') apiUrl.searchParams.append('browser_name', browserName);
    if (browserVersion && browserVersion !== 'unknown') apiUrl.searchParams.append('browser_version', browserVersion);


    let response;
    let usedEndpoint = 'v1/filtered';

    // Try v1 filtered endpoint first
    try {
      response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });
    } catch (fetchError) {
      // If v1 fails, return error instead of silently falling back
      return NextResponse.json(
        { success: false, error: 'Failed to connect to Notik API' },
        { status: 500 }
      );
    }

    if (!response.ok) {

      // Log response body for debugging
      const errorText = await response.text();

      return NextResponse.json(
        { success: false, error: `Failed to fetch offers from Notik: ${response.status}` },
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
      return NextResponse.json(
        { success: true, offers: [], total: 0, country: countryCode }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response from Notik' },
        { status: 500 }
      );
    }


    let allOffers: any[] = [];

    // Parse the response structure - support multiple formats from Notik
    if (data.data && Array.isArray(data.data)) {
      allOffers = data.data;
    } else if (data.offers && Array.isArray(data.offers)) {
      allOffers = data.offers;
    } else if (data.offers && typeof data.offers === 'object') {
      if (data.offers.data && Array.isArray(data.offers.data)) {
        allOffers = data.offers.data;
      } else if (data.offers.all && Array.isArray(data.offers.all)) {
        allOffers = data.offers.all;
      } else {
        // Try to extract arrays from object values
        const offers = Object.values(data.offers).filter(Array.isArray);
        if (offers.length > 0) {
          allOffers = offers[0] as any[];
        }
      }
    } else if (Array.isArray(data)) {
      allOffers = data;
    }


    // The Notik v1 filtered API should already return country-filtered offers
    // But we'll normalize the structure and ensure validity

    // Replace user ID macros in click URLs and normalize offer structure
    const processedOffers = allOffers
      .filter((offer: any) => offer && offer.offer_id && offer.name) // Only valid offers
      .map((offer: any) => {
        // Normalize the offer structure to match frontend expectations
        const normalizedOffer = {
          offer_id: offer.offer_id || offer.id,
          id: offer.id || offer.offer_id,
          name: offer.name,
          description1: offer.description || offer.description1,
          description2: offer.description2,
          description3: offer.description3,
          image_url: offer.image_url || offer.image,
          payout: convertToUSD(offer.payout),
          click_url: offer.click_url,
          categories: offer.categories || [],
          events: offer.events?.map((event: any) => ({
            id: event.id,
            name: event.name,
            payout: convertToUSD(event.payout),
          })),
        };

        // Replace user ID macros in click URL - support multiple formats
        if (normalizedOffer.click_url) {
          normalizedOffer.click_url = normalizedOffer.click_url
            .replace(/\[user_id\]/g, user_id)
            .replace(/{user_id}/g, user_id)
            .replace(/\[s1\]/g, s1 || '')
            .replace(/{s1}/g, s1 || '');
        }

        return normalizedOffer;
      });


    return NextResponse.json({
      success: true,
      offers: processedOffers,
      total: processedOffers.length,
      country: countryCode,
      device_os: device_os,
      device_type: device_type,
      endpoint_used: usedEndpoint
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
