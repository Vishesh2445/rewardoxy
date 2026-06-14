import { NextRequest, NextResponse } from 'next/server';

const KLINK_PUB_ID = 'd317e5b6-8977-4e79-9df3-66ff86e77645';
const KLINK_API_KEY = '86fb70a41761b1ba2835da8f7ac9b481345363d8e8e123da0679ec63dadf9339';

function formatDisplayPayout(value: number): number {
  if (value <= 0) return 0;
  if (value >= 0.01) return parseFloat(value.toFixed(2));
  const str = value.toFixed(10);
  const dec = str.split('.')[1] || '';
  let firstNonZero = -1;
  for (let i = 0; i < dec.length; i++) {
    if (dec[i] !== '0') { firstNonZero = i + 1; break; }
  }
  return firstNonZero > 0 ? parseFloat(value.toFixed(firstNonZero)) : 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id is required' }, { status: 400 });
    }

    const country = searchParams.get('country_code') || request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || '';
    const platform = searchParams.get('platform') || 'web';
    const deviceName = searchParams.get('device_name') || 'desktop';
    const categoryFilter = searchParams.get('category');

    const categories = categoryFilter ? [categoryFilter] : ['GAMING', 'TASKS', 'CRYPTO'];

    const fetchCategory = async (category: string) => {
      const apiUrl = new URL('https://klink-quest.klink.finance/api/v1/publisher/offers');
      if (country) apiUrl.searchParams.append('country', country);
      apiUrl.searchParams.append('platform', platform);
      apiUrl.searchParams.append('device_name', deviceName);
      apiUrl.searchParams.append('sort_by', 'epc');
      apiUrl.searchParams.append('category', category);
      apiUrl.searchParams.append('page', '1');
      apiUrl.searchParams.append('limit', '100');

      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${KLINK_PUB_ID}:${KLINK_API_KEY}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.error(`[klink-offers] ${category} API returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    };

    const results = await Promise.all(categories.map(fetchCategory));

    const seen = new Set<string>();
    const offers: any[] = [];

    for (const items of results) {
      for (const offer of items) {
        if (offer.isActive === false) continue;
        if (seen.has(offer.offerId)) continue;
        seen.add(offer.offerId);

        offers.push({
          offer_id: offer.offerId,
          name: offer.name?.en || offer.offerId,
          description1: offer.description?.en || '',
          image_url: offer.images?.logo || '',
          payout: formatDisplayPayout((parseFloat(offer.totalPayout) || 0) * 0.70),
          categories: Array.isArray(offer.categories) ? offer.categories : [],
          provider: 'Klink',
          device: offer.deviceName ? [offer.deviceName] : [deviceName],
          trackingType: offer.activities?.length > 1 ? 'CPE' : 'CPA',
          events: Array.isArray(offer.activities) && offer.activities.length > 0
            ? offer.activities.map((a: any) => ({
                id: a.eventId,
                name: a.name,
                payout: formatDisplayPayout((parseFloat(a.payout) || 0) * 0.70),
              }))
            : undefined,
          click_url: `https://offerwall.klinkfinance.com/wall?pub_id=${KLINK_PUB_ID}&user_id=${user_id}`,
        });
      }
    }

    return NextResponse.json({ success: true, offers, total: offers.length });
  } catch (error) {
    console.error('[klink-offers] Error:', error);
    return NextResponse.json({ success: true, offers: [], total: 0 });
  }
}
