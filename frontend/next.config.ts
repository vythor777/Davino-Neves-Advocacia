import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  (process.env.PORT && process.env.PORT !== '3000' ? `http://127.0.0.1:${process.env.PORT}` : "http://127.0.0.1:10000");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
