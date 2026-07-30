import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node self-host (PM2 on pas): minimal runtime tree under .next/standalone
  output: "standalone",
  turbopack: {
    // Pin workspace root so parent package-lock.json does not confuse Turbopack
    root: process.cwd(),
  },
};

export default nextConfig;

// Enables getCloudflareContext() during `next dev` only (OpenNext Cloudflare).
// Skip on production builds so standalone / Node deploy is not tied to Workers.
// https://opennext.js.org/cloudflare/get-started
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

