// OpenNext Cloudflare adapter — https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// Optional: R2 incremental cache (ISR / revalidation). Enable after creating the bucket:
//   npx wrangler r2 bucket create chinese-poetry2-opennext-cache
// Then uncomment the import + incrementalCache below, and restore r2_buckets in wrangler.jsonc.
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // incrementalCache: r2IncrementalCache,
});
