import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.123.25.78", "lab.bayuuat.com"],
  async rewrites() {
    return [
      {
        source: '/api/mana-uang/:path*',
        destination: 'http://127.0.0.1:8088/api/:path*' 
      },
      {
        source: '/api/jobs/:path*',
        destination: 'http://127.0.0.1:8089/api/:path*' 
      }
    ];
  }
};

export default nextConfig;
