import type { NextConfig } from "next";

function normalizeBaseUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  return url.replace(/\/$/, "");
}

const jobsApiBase =
  normalizeBaseUrl(process.env.JOBS_API_BASE_URL) ??
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL) ??
  "http://127.0.0.1:8088";

const manaUangApiBase =
  normalizeBaseUrl(process.env.MANA_UANG_API_BASE_URL) ??
  normalizeBaseUrl(process.env.NEXT_PUBLIC_MANA_UANG_API_BASE_URL) ??
  "http://127.0.0.1:8089";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.123.25.78", "lab.bayuuat.com"],
  async rewrites() {
    return [
      {
        source: "/jobs-api/:path*",
        destination: `${jobsApiBase}/api/:path*`,
      },
      {
        source: "/mana-uang-api/:path*",
        destination: `${manaUangApiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
