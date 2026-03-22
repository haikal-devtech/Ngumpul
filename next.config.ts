import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // If using turbopack in build, sometimes it needs explicit enabling or disabling
    // but we'll leave it default and see if the dynamic fix works first.
  },
};

export default nextConfig;
