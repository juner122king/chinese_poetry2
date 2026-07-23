import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so parent package-lock.json does not confuse Turbopack
    root: process.cwd(),
  },
};

export default nextConfig;
