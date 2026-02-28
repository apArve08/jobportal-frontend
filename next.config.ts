import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5177";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Proxy all /api/proxy/* requests server-side to the .NET backend.
  // The browser calls same-origin (localhost:3000/api/proxy/...)
  // Next.js server forwards it to localhost:5177/api/...
  // This eliminates all CORS issues completely.
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
