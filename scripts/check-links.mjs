#!/usr/bin/env node
/**
 * Base-prefix gate (single-domain rev.3).
 *
 * Every internal, root-relative URL in the built HTML must carry the current
 * build's locale base, or it will 404 when the site is served under that base
 * (biteperk.com/au-en/…, /en/…, /fr/…). Astro prefixes its own bundled assets
 * and the sitemap, but leaves every literal string the code writes — links,
 * /og and /images assets, form actions — untouched. This gate is the safety
 * net: it fails the build if any such reference escapes the base.
 *
 *   au     → every "/…" href/src/action/srcset must start with /au-en/ (or /api/)
 *   global → …must start with /en/ or /fr/ (or /api/)
 *
 * Absolute URLs (https://…, //…, mailto:, tel:, #, data:) are ignored — the
 * canonical/OG/JSON-LD absolute URLs are checked by check-schema/check-assets.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const DIST = TARGET === "global" ? "dist-global" : "dist";
const ALLOWED_BASES = TARGET === "global" ? ["/en", "/fr"] : ["/au-en"];
// Root-relative paths that legitimately stay at the origin root.
const ROOT_OK = ["/api/"];
// Known pre-existing gaps (documented, not migration regressions). The shared
// ConsentBanner links to /legal/cookies/, which exists in the AU tree but not
// yet in the international tree; /en + /fr are noindex until that content lands.
const KNOWN_GAPS = TARGET === "global" ? ["/legal/cookies/"] : [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Pull candidate URL strings from one HTML file. */
function urlsIn(html) {
  const urls = [];
  // href / src / action attributes
  for (const m of html.matchAll(/(?:href|src|action)="([^"]*)"/g)) urls.push(m[1]);
  // srcset / imagesrcset: comma-separated "<url> <descriptor>"
  for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]*)"/g)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls;
}

function isInternalRootRelative(url) {
  if (!url.startsWith("/")) return false; // external, #, mailto:, tel:, data:, relative
  if (url.startsWith("//")) return false; // protocol-relative
  return true;
}

// Static assets are shared at the deploy root in the global build (/en and /fr
// reference one /_astro, /og, /images, /favicon). Their existence is check-assets'
// job; here we only require the locale base on ROUTE links. In the AU build
// everything (assets included) lives under /au-en, so the base still applies.
const ASSET_EXT = /\.(svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|css|js|mjs|json|webmanifest|xml|txt|mp3|mp4|webm|pdf)(\?|$)/i;

function ok(url) {
  if (ROOT_OK.some((p) => url === p.replace(/\/$/, "") || url.startsWith(p))) return true;
  if (KNOWN_GAPS.includes(url)) return true;
  if (TARGET === "global" && ASSET_EXT.test(url)) return true; // shared root assets
  return ALLOWED_BASES.some((b) => url === b || url.startsWith(b + "/"));
}

const files = walk(DIST);
const escapes = [];
for (const f of files) {
  const html = readFileSync(f, "utf8");
  for (const url of urlsIn(html)) {
    if (isInternalRootRelative(url) && !ok(url)) {
      escapes.push({ file: f.replace(`${DIST}/`, ""), url });
    }
  }
}

if (escapes.length) {
  // Group by URL for a compact report.
  const byUrl = new Map();
  for (const e of escapes) {
    if (!byUrl.has(e.url)) byUrl.set(e.url, new Set());
    byUrl.get(e.url).add(e.file);
  }
  console.error(
    `\n✗ check-links [${TARGET}]: ${escapes.length} internal reference(s) escape the base ${ALLOWED_BASES.join("|")}:\n`,
  );
  for (const [url, filesSet] of [...byUrl.entries()].sort()) {
    const list = [...filesSet].sort();
    const shown = list.slice(0, 4).join(", ") + (list.length > 4 ? `, +${list.length - 4} more` : "");
    console.error(`  ${url}\n      in: ${shown}`);
  }
  console.error("");
  process.exit(1);
}

console.log(`✓ check-links [${TARGET}]: all internal references carry the ${ALLOWED_BASES.join("|")} base (${files.length} pages).`);
