// @ts-check
import { defineConfig } from "astro/config";

// Static-only output — this is a marketing landing, no SSR needed.
// Firebase Hosting serves the contents of `dist/` directly.
export default defineConfig({
  site: "https://biteperk.com.au",
  output: "static",
  build: {
    // Inline tiny CSS to cut a render-blocking request on the hero.
    inlineStylesheets: "auto"
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false
  }
});
