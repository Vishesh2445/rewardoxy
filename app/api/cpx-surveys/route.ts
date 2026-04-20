import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user_id parameter", surveys: [], count: 0 },
        { status: 400 }
      );
    }

    const appId = "32037";
    const secureHashKey = process.env.CPX_SECURE_HASH || "";
    
    if (!secureHashKey) {
      console.error("CPX_SECURE_HASH not configured");
      return NextResponse.json(
        { success: false, error: "CPX configuration missing", surveys: [], count: 0 },
        { status: 500 }
      );
    }

    // Generate MD5 hash as per CPX documentation: md5(ext_user_id + '-' + secure_hash)
    const secureHash = crypto
      .createHash("md5")
      .update(`${userId}-${secureHashKey}`)
      .digest("hex");

    // Get user's IP from request headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const userIp = forwardedFor?.split(",")[0] || realIp || "0.0.0.0";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "Mozilla/5.0";

    // Build CPX API URL according to documentation
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

    console.log("Fetching CPX surveys for user:", userId);
    console.log("CPX API URL:", cpxUrl.toString());

    const response = await fetch(cpxUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    });

    if (!response.ok) {
      console.error("CPX API error:", response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: "Failed to fetch surveys from CPX", surveys: [], count: 0 },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    console.log("CPX API response status:", data.status);
    console.log("CPX surveys count:", data.count_returned_surveys || 0);

    // Transform CPX response to our format
    const surveys = Array.isArray(data.surveys) 
      ? data.surveys.map((survey: any) => ({
          id: survey.id,
          loi: parseInt(survey.loi) || 0,
          payout_usd: parseFloat(survey.payout_publisher_usd) || 0,
          conversion_rate: parseFloat(survey.conversion_rate) || 0,
          link: survey.href || "",
          score: parseFloat(survey.score) || 0,
          type: survey.type || "",
        }))
      : [];

    return NextResponse.json({
      success: data.status === "success",
      surveys: surveys,
      count: data.count_returned_surveys || 0,
      total_available: data.count_available_surveys || 0,
    });
  } catch (error) {
    console.error("Error fetching CPX surveys:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", surveys: [], count: 0 },
      { status: 200 }
    );
  }
}
