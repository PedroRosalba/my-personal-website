import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Extra hostnames allowed to load dev assets and HMR, e.g. a Tailscale name: DEV_ORIGINS=host.ts.net,100.x.y.z
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(",").filter(Boolean) ?? [],
  // The journal is its own app (basePath /blog) served on this domain, so crossing over is same-origin.
  // BLOG_ORIGIN is the blog deployment's own URL, e.g. https://pedro-rosalba-blog.vercel.app or http://localhost:3001.
  async rewrites() {
    const blog = process.env.BLOG_ORIGIN?.replace(/\/$/, "");
    if (!blog) return [];
    return [
      { source: "/blog", destination: `${blog}/blog` },
      { source: "/blog/:path+", destination: `${blog}/blog/:path+` },
    ];
  },
};

export default nextConfig;
