import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // All frontend API calls go through /api/backend/...
        // Next.js maps this to the FastAPI backend's /api/... routes
        // Example: /api/backend/stocks/analyze/AAPL → backend:8001/api/stocks/analyze/AAPL
        source: "/api/backend/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
