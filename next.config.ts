import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Extra hostnames allowed to load dev assets and HMR, e.g. a Tailscale name: DEV_ORIGINS=host.ts.net,100.x.y.z
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(",").filter(Boolean) ?? [],
};

export default nextConfig;
