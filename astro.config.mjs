// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import { visit } from "unist-util-visit";
import { localesForTarget } from "./src/data/locales";

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

/**
 * Force `font-display: optional` on the Inter faces (@fontsource ships `swap`).
 *
 * `swap` guarantees a reflow whenever the webfont loses the race to first
 * paint, and that reflow was the last of this site's layout shift: on CI the
 * blog template measured CLS 0.02195 — deterministic, reproduced to 17
 * significant figures in a Linux container — entirely from text re-flowing
 * horizontally as Inter replaced the fallback. `optional` gives Inter ~100ms
 * and otherwise keeps the fallback FOR THAT PAGE VIEW ONLY, so the swap can
 * never happen mid-paint. Measured after: 0.000 on every URL, perf 0.98–0.99.
 *
 * This is only acceptable because the metrics-matched "Inter Fallback" face in
 * global.css is already in place — the fallback occupies identical space, so a
 * first-time visitor on a slow connection sees the same layout in slightly
 * different letterforms, and Inter (now cached) renders from the next page on.
 * If that @font-face is ever removed, revisit this together with it.
 *
 * A PostCSS pass rather than a hand-copied @font-face block: fontsource ships
 * seven subsets with their own unicode-ranges, and a copy would silently go
 * stale the first time the package updated. Source Serif 4 keeps `swap` — it
 * renders one inline span (.serif-accent) and contributes no measured shift.
 */
const interFontDisplayOptional = {
  postcssPlugin: "inter-font-display-optional",
  AtRule: {
    /** @param {import("postcss").AtRule} rule */
    "font-face": (rule) => {
      let isInter = false;
      rule.walkDecls("font-family", (/** @type {import("postcss").Declaration} */ d) => {
        if (d.value.includes("Inter Variable")) isInter = true;
      });
      if (!isInter) return;
      let seen = false;
      rule.walkDecls("font-display", (/** @type {import("postcss").Declaration} */ d) => {
        d.value = "optional";
        seen = true;
      });
      if (!seen) rule.append({ prop: "font-display", value: "optional" });
    },
  },
};
// NB: no `.postcss = true` here — that marker tells PostCSS the export is a
// plugin FACTORY and it will try to call it. This is already a plugin object.

// Static-only output — this is a marketing site, no SSR needed.
// Firebase Hosting serves the contents of the build's out dir directly.
export default defineConfig({
  vite: {
    css: { postcss: { plugins: [interFontDisplayOptional] } },
  },
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
