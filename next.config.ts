import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper handling of client-side navigation
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  },
  // Optimize for static export if needed
  output: 'standalone',
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  }
};

export default nextConfig;
