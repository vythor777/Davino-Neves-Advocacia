import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.BACKEND_URL ||
  (process.env.PORT && process.env.PORT !== '3000' ? `http://127.0.0.1:${process.env.PORT}` : "http://127.0.0.1:10000");

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'ais-dev-ja32r4izjdwix6f25jemrc-675761064329.us-west2.run.app',
    'ais-pre-ja32r4izjdwix6f25jemrc-675761064329.us-west2.run.app',
    '*.run.app',
    '*.googleusercontent.com',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS,PATCH' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
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
