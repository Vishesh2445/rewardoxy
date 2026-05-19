import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Force non-www to www (canonical domain)
      {
        source: "/:path*",
        has: [{ type: "host", value: "rewardoxy.app" }],
        destination: "https://www.rewardoxy.app/:path*",
        permanent: true,
      },
      // Force http to https (handled by Vercel, but explicit for clarity)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rewardoxy.app" }],
        missing: [{ type: "header", key: "x-forwarded-proto", value: "https" }],
        destination: "https://www.rewardoxy.app/:path*",
        permanent: true,
      },
      // Legacy /dashboard route → earn page
      {
        source: "/dashboard",
        destination: "/earn",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
