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

    const placementId = process.env.NEXT_PUBLIC_GEMIAD_API_PLACEMENT_ID;
    const apiKey = process.env.GEMIAD_API_KEY;

    if (!placementId || !apiKey) {
      console.error("Missing Gemiad configuration");
      return NextResponse.json(
        { success: false, error: "Gemiad configuration not found", offers: [] },
        { status: 200 }
      );
    }

    // Get user's country from headers
    const cfCountry = request.headers.get("cf-ipcountry");
    const vercelCountry = request.headers.get("x-vercel-ip-country");
    const userCountry = cfCountry || vercelCountry || "US";
    
    console.log("User country detected:", userCountry);

    // Build Gemiad API URL
    const gemiadUrl = new URL("https://api.gemiwall.com/api/offers/static");
    gemiadUrl.searchParams.set("placementId", placementId);
    gemiadUrl.searchParams.set("apiKey", apiKey);

    console.log("Fetching Gemiad offers:", gemiadUrl.toString());

    const response = await fetch(gemiadUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Gemiad API error:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch offers from Gemiad", offers: [] },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log("Gemiad API response success:", data.success);
    console.log("Gemiad total offers count:", data.offers?.length || 0);

    if (!data.success || !Array.isArray(data.offers)) {
      return NextResponse.json(
        { success: false, error: "Invalid response from Gemiad", offers: [] },
        { status: 200 }
      );
    }

    // Filter offers by user's country
    const filteredOffers = data.offers.filter((offer: any) => {
      // If offer has no country restrictions, include it
      if (!offer.country || !Array.isArray(offer.country) || offer.country.length === 0) {
        return true;
      }
      // Check if user's country is in the offer's country list
      return offer.country.includes(userCountry);
    });

    console.log(`Filtered offers for ${userCountry}: ${filteredOffers.length} out of ${data.offers.length}`);

    // Transform Gemiad offers to match our format
    const offers = filteredOffers.map((offer: any) => {
      // Replace [USER_ID] in the URL with actual user ID
      const clickUrl = offer.url?.replace("[USER_ID]", userId) || "";
      
      // Get English description
      const description = offer.description?.en || "";
      
      // Calculate total payout from events
      const totalPayout = offer.payout || 0;
      
      // Transform events - only include events with payout
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
        provider: "Gemiad",
        device: offer.device || [],
        country: offer.country || [],
        trackingType: offer.trackingType || "",
      };
    });

    return NextResponse.json({
      success: true,
      offers: offers,
      count: offers.length,
      userCountry: userCountry,
      totalOffersBeforeFilter: data.offers.length,
    });
  } catch (error) {
    console.error("Error fetching Gemiad offers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", offers: [] },
      { status: 200 }
    );
  }
}
