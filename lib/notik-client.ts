// Client-side Notik API helper
// Fetches filtered offers directly from Notik API with proper user parameters

export interface NotikOffer {
  offer_id: string;
  name: string;
  description1?: string;
  description2?: string;
  description3?: string;
  image_url: string;
  payout: string | number;
  click_url: string;
  categories: string | string[];
  events?: {
    id: string;
    name: string;
    payout: number;
  }[];
}

export async function fetchNotikOffers(
  userId: string,
  deviceOS: string = 'android'
): Promise<NotikOffer[]> {
  try {
    // Get user's device information
    const userAgent = navigator.userAgent;
    
    // Detect device type and name
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
    const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
    
    let deviceName = 'other';
    if (/iPhone/i.test(userAgent)) deviceName = 'iphone';
    else if (/iPad/i.test(userAgent)) deviceName = 'ipad';
    
    // Get country code and IP from our API
    let countryCode = 'US';
    let userIp = '0.0.0.0';
    
    try {
      const geoResponse = await fetch('/api/get-country');
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        countryCode = geoData.country || 'US';
        userIp = geoData.ip || '0.0.0.0';
      }
    } catch (e) {
      console.log('[Notik Client] Could not fetch geo data, using defaults');
    }
    
    // Build Notik filtered API URL with all required parameters
    const NOTIK_API_KEY = process.env.NEXT_PUBLIC_NOTIK_API_KEY || 'PYMTzu6owFJ8roFouth5bEYxoJRmg7q9';
    const NOTIK_PUB_ID = process.env.NEXT_PUBLIC_NOTIK_PUBLISHER_ID || 'mIJkTN';
    const NOTIK_APP_ID = process.env.NEXT_PUBLIC_NOTIK_APP_ID || 'dOTR7kmvMw';
    
    const apiUrl = new URL('https://notik.me/api/v2/get-offers/filtered');
    apiUrl.searchParams.append('api_key', NOTIK_API_KEY);
    apiUrl.searchParams.append('pub_id', NOTIK_PUB_ID);
    apiUrl.searchParams.append('app_id', NOTIK_APP_ID);
    apiUrl.searchParams.append('user_id', userId);
    apiUrl.searchParams.append('device_name', deviceName);
    apiUrl.searchParams.append('device_type', deviceType);
    apiUrl.searchParams.append('device_os', deviceOS);
    apiUrl.searchParams.append('country_code', countryCode);
    apiUrl.searchParams.append('user_agent', userAgent);
    apiUrl.searchParams.append('ip', userIp);
    
    console.log('[Notik Client] Fetching filtered offers for:', countryCode, deviceOS, deviceType);
    
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      console.error('[Notik Client] Failed to fetch offers:', response.status);
      return [];
    }

    const text = await response.text();
    if (!text) {
      console.error('[Notik Client] Empty response');
      return [];
    }

    const data = JSON.parse(text);
    
    let offersArray: NotikOffer[] = [];
    
    // Parse response structure
    if (data.data && Array.isArray(data.data)) {
      offersArray = data.data;
    } else if (data.offers) {
      if (Array.isArray(data.offers)) {
        offersArray = data.offers;
      } else if (typeof data.offers === 'object') {
        offersArray = Object.values(data.offers);
      }
    }
    
    // Filter valid offers and deduplicate by offer_id
    const uniqueOffersMap = new Map();
    offersArray.forEach(offer => {
      if (offer && offer.offer_id && !uniqueOffersMap.has(offer.offer_id)) {
        uniqueOffersMap.set(offer.offer_id, offer);
      }
    });
    
    const validOffers = Array.from(uniqueOffersMap.values());
    
    console.log('[Notik Client] Total offers:', offersArray.length, 'Unique:', validOffers.length);
    
    return validOffers;
  } catch (error) {
    console.error('[Notik Client] Error fetching offers:', error);
    return [];
  }
}
