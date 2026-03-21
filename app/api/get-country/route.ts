import { NextRequest, NextResponse } from "next/server";

// Free IP geolocation API
const IP_API_URL = "http://ip-api.com/json";

interface IpApiResponse {
  status: string;
  countryCode: string;
  country: string;
  message?: string;
}

export async function GET(request: NextRequest) {
  // Get client IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  let ip = forwardedFor?.split(",")[0]?.trim() || realIp || "";
  
  // If no IP found (e.g., localhost), return a default
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return NextResponse.json({ 
      country: "US", 
      countryCode: "US",
      isLocalhost: true 
    });
  }

  try {
    const response = await fetch(`${IP_API_URL}/${ip}?fields=status,countryCode,country`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch IP info");
    }

    const data: IpApiResponse = await response.json();

    if (data.status === "fail") {
      return NextResponse.json({ 
        country: null, 
        countryCode: null,
        error: data.message 
      });
    }

    return NextResponse.json({ 
      country: data.countryCode, 
      countryCode: data.countryCode,
      countryName: data.country 
    });
  } catch (error) {
    console.error("IP geolocation error:", error);
    return NextResponse.json({ 
      country: null, 
      countryCode: null,
      error: "Failed to detect country" 
    });
  }
}
