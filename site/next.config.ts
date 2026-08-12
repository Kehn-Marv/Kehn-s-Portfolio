import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages — the site has no server-side logic.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
