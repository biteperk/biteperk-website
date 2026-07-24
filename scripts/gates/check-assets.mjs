#!/usr/bin/env node
/**
 * Asset-reference gate over dist/.
 *
 * Every local asset URL emitted into the built HTML — <img src>, srcset,
 * <link rel=preload href>/imagesrcset, stylesheet/script/icon hrefs, and the
 * og:image / twitter:image meta tags — must resolve to a real file in dist/.
 *
 * Why this exists: renaming a product family renames asset FILES and the code
 * that references them, and those two can drift. It has bitten twice — a
 * renamed hero composite 404'd the LCP preload, and a product rename shipped
 * og:image tags pointing at cards that were never regenerated. Neither was
 * caught by check-routes (pages existed) or check-images (its manifest is
 * empty, so it gates nothing).
 *
 * The expected list is DERIVED from the built output, not hard-coded, so it
 * covers new products, cities and guides with no edit here.
 *
 * Run after `astro build`: node scripts/gates/check-assets.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const DIST_NAME = TARGET === "global" ? "dist-global" : "dist";
const DIST = join(ROOT, DIST_NAME);
// The au build is served under /au-en but emits FLAT to dist/ (the /au-en/**
// nesting is added at the merge step). So strip the locale base before
// resolving a reference against the flat build dir.
const BASE = TARGET === "global" ? "" : "/au-en";

if (!existsSync(DIST)) {
  console.error(`check-assets: ${DIST_NAME}/ not found — run the build first.`);
  process.exit(1);
}

/** Extensions we treat as assets that must exist on disk. */
const ASSET_EXT =
  /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|css|js|mjs|mp3|mp4|webm|pdf|txt|xml|json|webmanifest)$/i;

/** Site origins that mean "this file is in dist/". */
const LOCAL_ORIGINS = [
  "https://biteperk.com.au",
  "https://www.biteperk.com.au",
  "http://biteperk.com.au",
  "https://biteperk.com",
  "https://www.biteperk.com",
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Pull every candidate URL out of one HTML file. */
function extractUrls(html) {
  const urls = [];

  // src="…", href="…", content="…" (og:image/twitter:image)
  for (const m of html.matchAll(/\b(?:src|href|content)\s*=\s*"([^"]+)"/gi)) {
    urls.push(m[1]);
  }
  // srcset / imagesrcset: "url 800w, url 1600w"
  for (const m of html.matchAll(/\b(?:image)?srcset\s*=\s*"([^"]+)"/gi)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls;
}

/** Normalise a URL to a dist-relative path, or null if it isn't a local asset. */
function toDistPath(raw) {
  let url = raw.trim();
  if (!url) return null;

  for (const origin of LOCAL_ORIGINS) {
    if (url.startsWith(origin)) {
      url = url.slice(origin.length);
      break;
    }
  }

  // Strip the locale base (/au-en) — files live at the flat build root.
  if (BASE && (url === BASE || url.startsWith(BASE + "/"))) {
    url = url.slice(BASE.length) || "/";
  }

  // Skip anything still remote, or non-file schemes.
  if (/^(?:https?:)?\/\//i.test(url)) return null;
  if (/^(?:data|mailto|tel|javascript|blob):/i.test(url)) return null;

  url = url.split(/[?#]/)[0];
  if (!url.startsWith("/")) return null; // relative/anchor — not an asset ref
  if (!ASSET_EXT.test(url)) return null; // routes are check-routes' job

  return decodeURIComponent(url.slice(1));
}

const pages = walk(DIST);
const missing = new Map(); // asset path -> Set of pages referencing it
let checked = 0;

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const rel = page.slice(DIST.length + 1);

  for (const raw of extractUrls(html)) {
    const assetPath = toDistPath(raw);
    if (!assetPath) continue;
    checked++;
    if (!existsSync(join(DIST, assetPath))) {
      if (!missing.has(assetPath)) missing.set(assetPath, new Set());
      missing.get(assetPath).add(rel);
    }
  }
}

if (missing.size > 0) {
  console.error(
    `\ncheck-assets: ${missing.size} referenced asset(s) missing from dist/\n`,
  );
  for (const [asset, refs] of [...missing].sort()) {
    const list = [...refs].sort();
    const shown = list.slice(0, 5).join(", ");
    const more = list.length > 5 ? ` (+${list.length - 5} more)` : "";
    console.error(`  ✗ /${asset}\n      referenced by: ${shown}${more}`);
  }
  console.error(
    "\nIf a product/asset was renamed, regenerate or rename the files:\n" +
      "  npm run og       # Open Graph cards\n" +
      "  npm run images   # composites\n",
  );
  process.exit(1);
}

console.log(
  `check-assets: OK — ${checked} asset references across ${pages.length} pages all resolve.`,
);
