import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const os = searchParams.get('os') || 'android';

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id is required' }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_TASKWALL_APP_ID;
    if (!appId) {
      return NextResponse.json({ success: false, error: 'Taskwall API key not configured' }, { status: 500 });
    }

    // Detect country from headers
    const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || '';

    const apiUrl = new URL('https://wall.taskwall.io/api/');
    apiUrl.searchParams.append('app_id', appId);
    apiUrl.searchParams.append('userid', user_id);
    apiUrl.searchParams.append('os', os);
    if (country) apiUrl.searchParams.append('country', country);

    const response = await fetch(apiUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Taskwall API returned ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    if ((!data.success && data.status !== 'success') || !Array.isArray(data.offers)) {
      return NextResponse.json({ success: true, offers: [], total: 0 });
    }

    const offers = data.offers.map((offer: any) => ({
      offer_id: offer.offer_id,
      name: offer.title,
      description1: offer.description || offer.conversion,
      image_url: offer.icon,
      payout: parseFloat(offer.payout) || 0,
      coins: Math.round((offer.user_amount || 0)),
      click_url: offer.link,
      categories: [],
      provider: 'Taskwall',
      device: offer.devices || [],
      events: offer.multi_event && Array.isArray(offer.events) && offer.events.length > 0
        ? offer.events.map((e: any) => ({
            id: String(e.event_id),
            name: e.event_instructions || `Step ${e.event_id}`,
            payout: parseFloat(e.event_payout) || 0,
          }))
        : undefined,
    }));

    return NextResponse.json({ success: true, offers, total: offers.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
