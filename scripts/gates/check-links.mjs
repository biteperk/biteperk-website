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
 *   assets (src/srcset/imagesrcset/poster) → must carry THIS build's base
 *   (au → /au-en/; global → /en/, /gb-en/, …), because assets are per build.
 *   links (href/action) → may carry ANY launched locale's base (rev. 13 Sep
 *   2026): the merged site serves all six trees from one host, so a global
 *   page may link /au-en/… and an AU page may link /fr/… host-relatively.
 *   Cross-tree links must RESOLVE in dist-site/ (the merged tree) when it
 *   exists — that is the safety net the old absolute-URL workaround never had.
 *   Internal anchors written ABSOLUTE (https://biteperk.com/…) fail: they are
 *   what sent every region switch on staging to production. Canonical,
 *   hreflang, og:url and JSON-LD are not anchors and stay absolute
 *   (check-schema / check-hreflang own those).
 *
 * Other absolute URLs (external hosts, //…, mailto:, tel:, #, data:) are ignored.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const DIST = TARGET === "global" ? "dist-global" : "dist";
// Bases derive from locales.ts — a hardcoded list here silently stopped
// covering new locales (their pages' links passed because their own base
// wasn't "allowed"… it failed loudly instead, but the fix is the same:
// one source of truth).
const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { localesForTarget, locales } = await loadTS(join(ROOT_DIR, "src/data/locales.ts"));
const ALLOWED_BASES = localesForTarget(TARGET).map((l) => l.base); // this build's trees (assets)
const LINK_BASES = locales.map((l) => l.base); // every launched tree (links)
const DIST_SITE = join(ROOT_DIR, "dist-site");
const HAVE_SITE = existsSync(DIST_SITE);
// Root-relative paths that legitimately stay at the origin root.
const ROOT_OK = ["/api/"];
// No exemptions. /legal/cookies/ was carried here for a while because the
// shared ConsentBanner linked to a page the international tree didn't have —
// which meant every global page shipped a consent notice whose policy link
// 404'd. Every locale now emits the page (it is in pagesForLocale), so the gate holds
// it. Resist re-adding entries: an exemption here is a live broken link.
const KNOWN_GAPS = [];

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

/** Pull candidate URLs from one HTML file, tagged link (href/action) or asset (src/srcset/poster). */
function urlsIn(html) {
  const urls = [];
  for (const m of html.matchAll(/\b(href|src|action|poster)="([^"]*)"/g)) urls.push({ url: m[2], kind: m[1] === "src" || m[1] === "poster" ? "asset" : "link" });
  // srcset / imagesrcset: comma-separated "<url> <descriptor>"
  for (const m of html.matchAll(/(?:srcset|imagesrcset)="([^"]*)"/g)) {
    for (const part of m[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.push({ url, kind: "asset" });
    }
  }
  return urls;
}

/** Internal anchors written absolute to the canonical host — the staging-jumps-to-production bug. */
function absoluteAnchorsIn(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="(https:\/\/(?:www\.)?biteperk\.com(?:\/[^"]*)?)"/g)].map((m) => m[1]);
}

/** Does a cross-tree, host-relative route exist in the merged tree? (hash/query stripped, clean URL) */
function resolvesInSite(url) {
  const clean = url.replace(/[#?].*$/, "");
  if (ASSET_EXT.test(clean)) return existsSync(join(DIST_SITE, clean));
  return existsSync(join(DIST_SITE, clean.replace(/\/$/, ""), "index.html"));
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

const underBase = (url, bases) => bases.some((b) => url === b || url.startsWith(b + "/"));
/** Returns null when fine, else a reason string. */
function problem(url, kind) {
  if (ROOT_OK.some((p) => url === p.replace(/\/$/, "") || url.startsWith(p))) return null;
  if (KNOWN_GAPS.includes(url)) return null;
  if (TARGET === "global" && ASSET_EXT.test(url)) return null; // shared root assets
  if (underBase(url, ALLOWED_BASES)) return null; // this build's own tree
  if (kind === "link" && underBase(url, LINK_BASES)) {
    // A link into another tree: legal, provided the merged site actually has it.
    if (!HAVE_SITE) return null;
    return resolvesInSite(url) ? null : "cross-tree link does not resolve in dist-site/";
  }
  return `escapes the base ${ALLOWED_BASES.join("|")}`;
}

const files = walk(DIST);
const escapes = [];
let crossTree = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  for (const { url, kind } of urlsIn(html)) {
    if (!isInternalRootRelative(url)) continue;
    const why = problem(url, kind);
    if (why) escapes.push({ file: f.replace(`${DIST}/`, ""), url: `${url}  (${why})` });
    else if (kind === "link" && !underBase(url, ALLOWED_BASES) && underBase(url, LINK_BASES)) crossTree++;
  }
  for (const url of absoluteAnchorsIn(html)) {
    escapes.push({ file: f.replace(`${DIST}/`, ""), url: `${url}  (internal anchor written absolute — use the host-relative path so staging stays on staging)` });
  }
}
if (!HAVE_SITE) console.log("check-links: dist-site/ absent — cross-tree links were base-checked only, not resolved (run build:site for the full check).");

if (escapes.length) {
  // Group by URL for a compact report.
  const byUrl = new Map();
  for (const e of escapes) {
    if (!byUrl.has(e.url)) byUrl.set(e.url, new Set());
    byUrl.get(e.url).add(e.file);
  }
  console.error(
    `\n✗ check-links [${TARGET}]: ${escapes.length} internal reference problem(s):\n`,
  );
  for (const [url, filesSet] of [...byUrl.entries()].sort()) {
    const list = [...filesSet].sort();
    const shown = list.slice(0, 4).join(", ") + (list.length > 4 ? `, +${list.length - 4} more` : "");
    console.error(`  ${url}\n      in: ${shown}`);
  }
  console.error("");
  process.exit(1);
}

console.log(`✓ check-links [${TARGET}]: all internal references carry a launched base, ${crossTree} cross-tree link(s) ${HAVE_SITE ? "resolve in dist-site" : "base-checked"}, no absolute internal anchors (${files.length} pages).`);
