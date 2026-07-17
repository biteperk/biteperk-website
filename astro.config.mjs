// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

// Static-only output — this is a marketing site, no SSR needed.
// Firebase Hosting serves the contents of `dist/` directly.
export default defineConfig({
  site: "https://biteperk.com.au",
  output: "static",
  trailingSlash: "ignore",
  build: {
    // Inline tiny CSS to cut a render-blocking request on the hero.
    inlineStylesheets: "auto",
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
      filter: (page) =>
        !page.includes("/kitchen-sink") &&
        !page.includes("/404"),
      changefreq: "monthly",
      priority: 0.7,
      serialize(item) {
        if (item.url === "https://biteperk.com.au/") item.priority = 1.0;
        else if (item.url === "https://biteperk.com.au/technology/") item.priority = 0.8;
        else if (item.url.includes("/products/")) item.priority = 0.9;
        else if (
          // City landing pages — keep in sync with src/data/cities.ts
          // (CI's route list is generated from cities.ts, which catches drift).
          /\/(sydney|melbourne|brisbane|perth|adelaide|gold-coast)\/$/.test(item.url)
        )
          item.priority = 0.9;
        else if (item.url === "https://biteperk.com.au/blog/") item.priority = 0.8;
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
