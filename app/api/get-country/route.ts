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
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || forwardedFor?.split(",")[0]?.trim() || realIp || "";
  
  // Get country from Cloudflare or Vercel headers first (most reliable)
  const cfCountry = request.headers.get("cf-ipcountry");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  
  // If no IP found (e.g., localhost), return a default
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return NextResponse.json({ 
      country: cfCountry || vercelCountry || "US", 
      countryCode: cfCountry || vercelCountry || "US",
      ip: "0.0.0.0",
      isLocalhost: true 
    });
  }

  // If we have country from headers, use it (faster and more reliable)
  if (cfCountry || vercelCountry) {
    return NextResponse.json({ 
      country: cfCountry || vercelCountry, 
      countryCode: cfCountry || vercelCountry,
      ip: ip
    });
  }

  // Fallback to IP geolocation API
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
        country: "US", 
        countryCode: "US",
        ip: ip,
        error: data.message 
      });
    }

    return NextResponse.json({ 
      country: data.countryCode, 
      countryCode: data.countryCode,
      countryName: data.country,
      ip: ip
    });
  } catch (error) {
    console.error("IP geolocation error:", error);
    return NextResponse.json({ 
      country: "US", 
      countryCode: "US",
      ip: ip,
      error: "Failed to detect country" 
    });
  }
}
