import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id parameter" },
        { status: 400 }
      );
    }

    const appId = "32037";
    const secureHash = process.env.CPX_SECURE_HASH || "";
    
    if (!secureHash) {
      console.error("CPX_SECURE_HASH not configured");
      return NextResponse.json(
        { success: false, error: "CPX configuration missing" },
        { status: 500 }
      );
    }

    // Get user's IP from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const userIp = forwardedFor?.split(",")[0] || realIp || "0.0.0.0";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "Mozilla/5.0";

    // Build CPX API URL
    const cpxUrl = new URL("https://live-api.cpx-research.com/api/get-surveys.php");
    cpxUrl.searchParams.set("app_id", appId);
    cpxUrl.searchParams.set("ext_user_id", userId);
    cpxUrl.searchParams.set("email", "");
    cpxUrl.searchParams.set("subid_1", "");
    cpxUrl.searchParams.set("subid_2", "");
    cpxUrl.searchParams.set("output_method", "api");
    cpxUrl.searchParams.set("ip_user", userIp);
    cpxUrl.searchParams.set("user_agent", encodeURIComponent(userAgent));
    cpxUrl.searchParams.set("limit", "12");
    cpxUrl.searchParams.set("secure_hash", secureHash);

    console.log("Fetching CPX surveys:", cpxUrl.toString());

    const response = await fetch(cpxUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      console.error("CPX API error:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch surveys from CPX" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log("CPX API response:", JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      surveys: data.surveys || [],
      count: data.count_surveys || 0,
    });
  } catch (error) {
    console.error("Error fetching CPX surveys:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
