// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

// International build architecture — see
// deliverables/2026-07-23-intl-site-architecture/PLAN.md.
//
// BUILD_TARGET selects which host this pass emits. src/data/locales.ts is the
// single source of truth for locales + hosts; the two host constants are
// mirrored here because the Astro config is evaluated before the project's
// TypeScript module graph is available.
//   au     (default) → biteperk.com.au → dist/         (the existing shipped site, unchanged)
//   global           → biteperk.com    → dist-global/  (/en/ + /fr/ scaffolding)
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const SITE = TARGET === "global" ? "https://biteperk.com" : "https://biteperk.com.au";
const OUT_DIR = TARGET === "global" ? "./dist-global" : "./dist";

// Static-only output — this is a marketing site, no SSR needed.
// Firebase Hosting serves the contents of the build's out dir directly.
export default defineConfig({
  site: SITE,
  outDir: OUT_DIR,
  output: "static",
  trailingSlash: "ignore",
  build: {
    // Inline tiny CSS to cut a render-blocking request on the hero.
    inlineStylesheets: "always",
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  image: {
    // Astro picks AVIF/WebP for <Image> automatically; this keeps the
    // pipeline explicit and consistent.
    responsiveStyles: true,
  },
  integrations: [
    sitemap({
      filter: (page) => {
        if (page.includes("/kitchen-sink") || page.includes("/404")) return false;
        // Global build: only the /en/ and /fr/ locale trees ship on biteperk.com
        // (the AU pages built alongside are pruned post-build by prune-global.mjs).
        if (TARGET === "global") return /\/(en|fr)(\/|$)/.test(page);
        return true;
      },
      changefreq: "monthly",
      priority: 0.7,
      serialize(item) {
        if (item.url === `${SITE}/`) item.priority = 1.0;
        else if (item.url === `${SITE}/technology/`) item.priority = 0.8;
        else if (item.url === `${SITE}/platform/`) item.priority = 0.8;
        else if (item.url.includes("/products/")) item.priority = 0.9;
        else if (
          // City landing pages — keep in sync with src/data/cities.ts
          // (CI's route list is generated from cities.ts, which catches drift).
          /\/(sydney|melbourne|brisbane|perth|adelaide|gold-coast)\/$/.test(item.url)
        )
          item.priority = 0.9;
        else if (item.url === `${SITE}/blog/`) item.priority = 0.8;
        else if (item.url.includes("/blog/")) {
          // Individual guides: fresher content, crawl more often.
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.includes("/legal/")) item.priority = 0.4;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
