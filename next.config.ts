import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of client-side navigation
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
};

export default nextConfig;
