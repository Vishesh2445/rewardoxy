import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id parameter", offers: [] },
        { status: 400 }
      );
    }

    const placementId = "69e46bc7a982f180b5cae8fa";
    const apiKey = "3701379f-cbb6-4f78-a565-dba3a08072d1";

    // Get country from query param or headers for filtering
    const userCountry = searchParams.get("country_code") || request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "";

    // Build Vortex API URL
    const vortexUrl = new URL("https://api.vortexwall.com/api/v1/offers/static");
    vortexUrl.searchParams.set("placementId", placementId);
    vortexUrl.searchParams.set("apiKey", apiKey);

    console.log("Fetching Vortex offers:", vortexUrl.toString());

    const response = await fetch(vortexUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Vortex API error:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch offers from Vortex", offers: [] },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log("Vortex API response success:", data.success);
    
    const offersArray = data.data || data.offers;
    console.log("Vortex offers count:", offersArray?.length || 0);

    if (!data.success || !Array.isArray(offersArray)) {
      return NextResponse.json(
        { success: false, error: "Invalid response from Vortex", offers: [] },
        { status: 200 }
      );
    }

    // Transform Vortex offers to match our format
    const offers = offersArray.map((offer: any) => {
      // Replace [USER_ID] in the URL with actual user ID
      const clickUrl = offer.url?.replace("[USER_ID]", userId) || "";
      
      // Get English description
      const description = offer.description?.en || "";
      
      // Calculate total payout from events
      const totalPayout = offer.payout || 0;
      
      // Transform events
      const events = Array.isArray(offer.events)
        ? offer.events
            .filter((event: any) => event.payout && event.payout > 0)
            .map((event: any) => ({
              id: event.eventId,
              name: event.action?.en || "Complete action",
              payout: event.payout,
            }))
        : [];

      return {
        offer_id: offer.id,
        name: offer.name,
        description1: description,
        description2: offer.multiEvent ? "This offer has multiple milestones to complete." : "",
        description3: "",
        image_url: offer.icon || "",
        payout: totalPayout.toFixed(2),
        click_url: clickUrl,
        categories: offer.category || "app",
        events: events,
        provider: "Vortex",
        device: offer.device || [],
        country: offer.country || [],
        trackingType: offer.trackingType || "",
      };
    });

    // Filter by user's country if detected
    const filteredOffers = userCountry
      ? offers.filter((o: any) => !o.country?.length || o.country.includes(userCountry) || o.country.includes('00'))
      : offers;

    return NextResponse.json({
      success: true,
      offers: filteredOffers,
      count: filteredOffers.length,
    });
  } catch (error) {
    console.error("Error fetching Vortex offers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", offers: [] },
      { status: 200 }
    );
  }
}
