import type { NextConfig } from "next";

import { getBackendApiUrl } from './utils/backendUrl';

const backendApiUrl = getBackendApiUrl(process.env);

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
    return [
      {
        source: '/api/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
