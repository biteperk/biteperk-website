// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import { visit } from "unist-util-visit";
import { localesForTarget } from "./src/data/locales";
import { publishedCities } from "./src/data/cities";
import { blogPosts } from "./scripts/build/content-index.mjs";

// slug → lastmod (updatedDate ?? publishDate) for the sitemap.
const blogDates = new Map(blogPosts().map((p) => [p.slug, p.updatedDate ?? p.publishDate]));
import { intlCities } from "./src/data/intl/cities";

// Single-domain international architecture (Option B, rev.3) — see
// deliverables/2026-07-23-intl-site-architecture/PLAN.md.
//
// BOTH targets serve one domain, biteperk.com:
//   au     (default) → base /au-en → dist/         → merged to /au-en/** on biteperk.com
//   global           → base /      → dist-global/  → /en/ + /fr/ on biteperk.com
// biteperk.com.au becomes a redirect-only host → biteperk.com/au-en/** (firebase.json).
//
// src/data/locales.ts is the single source of truth for locales, the origin,
// and each locale's base path (Astro bundles this config with esbuild, so the
// TS import above resolves fine); only TARGET/SITE/BASE are mirrored because
// they configure the build that compiles that very module graph.
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

// Fonts: src/styles/fonts.css hand-writes the four @font-face rules the site
// uses (Inter latin/latin-ext with font-display:optional, Source Serif 4 latin
// 400/500). A PostCSS pass used to force `optional` onto fontsource's output;
// it went with the fontsource CSS import — see the note in fonts.css.

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
        // /blog/ (the index) canonicalises to /resources/guides/ — one listing
        // of the twelve guides in the sitemap, not two.
        if (page === `${HOME}/blog/`) return false;
        // Global build: only the locale trees from locales.ts ship on
        // biteperk.com (the AU pages built alongside are pruned post-build by
        // prune-global.mjs). Derived, NOT a regex literal: a hardcoded (en|fr)
        // silently dropped every /gb-en//be-*/ page from the sitemap.
        if (TARGET === "global")
          return localesForTarget("global").some(
            (l) => page === `${SITE}${l.base}/` || page.startsWith(`${SITE}${l.base}/`),
          );
        return true;
      },
      changefreq: "monthly",
      priority: 0.7,
      serialize(item) {
        // Locale homes are entry points for their whole market.
        if (
          TARGET === "global" &&
          localesForTarget("global").some((l) => item.url === `${SITE}${l.base}/`)
        ) {
          item.priority = 0.9;
          return item;
        }
        // Market city pages — derived from intl/cities.ts (same priority as
        // the AU cities below; without this branch they fell to the 0.7
        // fallback while /au-en/sydney/ sat at 0.9).
        if (
          TARGET === "global" &&
          intlCities.some((c) => c.published && item.url === `${SITE}${c.base}/${c.slug}/`)
        ) {
          item.priority = 0.9;
          return item;
        }
        if (item.url === `${HOME}/`) item.priority = 1.0;
        else if (item.url === `${HOME}/technology/`) item.priority = 0.8;
        else if (item.url === `${HOME}/platform/`) item.priority = 0.8;
        else if (item.url.includes("/products/")) item.priority = 0.9;
        // Commercial-intent verticals: the highest-intent pages on the tree,
        // level with products (they sat at the 0.7 fallback until Sep 2026).
        else if (item.url === `${HOME}/solutions/`) item.priority = 0.8;
        else if (item.url.includes("/solutions/")) item.priority = 0.9;
        else if (item.url === `${HOME}/resources/`) item.priority = 0.8;
        // City landing pages — derived from cities.ts (was a hardcoded regex,
        // the last hand-maintained list in this file).
        else if (publishedCities.some((c) => item.url === `${HOME}/${c.slug}/`)) item.priority = 0.9;
        else if (item.url.includes("/blog/")) {
          // Individual guides: fresher content, crawl more often, dated.
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.WEEKLY;
          const slug = item.url.replace(/\/$/, "").split("/").pop() ?? "";
          const post = blogDates.get(slug);
          if (post) item.lastmod = post;
        } else if (item.url.includes("/legal/")) item.priority = 0.4;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
