import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/smallroom";

const nextConfig: NextConfig = {
  basePath,
  reactStrictMode: true,
  // data/cities.json is read server side only; keep it out of client bundles.
  outputFileTracingIncludes: { "/api/cities": ["./data/cities.json"], "/api/cities/in-view": ["./data/cities.json"] },
};

export default nextConfig;
