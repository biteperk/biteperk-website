// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import { visit } from "unist-util-visit";

// Single-domain international architecture (Option B, rev.3) — see
// deliverables/2026-07-23-intl-site-architecture/PLAN.md.
//
// BOTH targets serve one domain, biteperk.com:
//   au     (default) → base /au-en → dist/         → merged to /au-en/** on biteperk.com
//   global           → base /      → dist-global/  → /en/ + /fr/ on biteperk.com
// biteperk.com.au becomes a redirect-only host → biteperk.com/au-en/** (firebase.json).
//
// src/data/locales.ts is the single source of truth for locales, the origin,
// and each locale's base path; the constants are mirrored here because the
// Astro config is evaluated before the project's TypeScript module graph.
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const SITE = "https://biteperk.com";
const BASE = TARGET === "global" ? undefined : "/au-en";
const OUT_DIR = TARGET === "global" ? "./dist-global" : "./dist";
// Absolute home of this build (origin + base), for sitemap priority matching.
const HOME = SITE + (BASE || "");

// Prefix root-relative markdown links with the build's base so blog cross-links
// (/products/…, /sydney/, /blog/…) resolve under /au-en. Astro never rewrites
// markdown link URLs itself; /api/* stays at the origin root (Firebase rewrite).
/** @param {string} base */
function remarkBaseLinks(base) {
  /** @param {import("unist").Node} tree */
  return (tree) => {
    visit(tree, "link", (/** @type {any} */ node) => {
      const url = node.url;
      if (
        typeof url === "string" &&
        url.startsWith("/") &&
        !url.startsWith("//") &&
        url !== base &&
        !url.startsWith(base + "/") &&
        !url.startsWith("/api/")
      ) {
        node.url = base + url;
      }
    });
  };
}

// Static-only output — this is a marketing site, no SSR needed.
// Firebase Hosting serves the contents of the build's out dir directly.
export default defineConfig({
  site: SITE,
  base: BASE,
  outDir: OUT_DIR,
  output: "static",
  trailingSlash: "ignore",
  build: {
    // Inline tiny CSS to cut a render-blocking request on the hero.
    inlineStylesheets: "always",
  },
  compressHTML: true,
  markdown: {
    remarkPlugins: BASE ? [[remarkBaseLinks, BASE]] : [],
  },
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
        if (item.url === `${HOME}/`) item.priority = 1.0;
        else if (item.url === `${HOME}/technology/`) item.priority = 0.8;
        else if (item.url === `${HOME}/platform/`) item.priority = 0.8;
        else if (item.url.includes("/products/")) item.priority = 0.9;
        else if (
          // City landing pages — keep in sync with src/data/cities.ts
          // (CI's route list is generated from cities.ts, which catches drift).
          /\/(sydney|melbourne|brisbane|perth|adelaide|gold-coast)\/$/.test(item.url)
        )
          item.priority = 0.9;
        else if (item.url === `${HOME}/blog/`) item.priority = 0.8;
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
