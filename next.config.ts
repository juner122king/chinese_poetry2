import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root so parent package-lock.json does not confuse Turbopack
    root: process.cwd(),
  },
};

export default nextConfig;

// Enables getCloudflareContext() during `next dev` (OpenNext Cloudflare).
// https://opennext.js.org/cloudflare/get-started
void initOpenNextCloudflareForDev();

