#!/usr/bin/env node
/**
 * Meta gate — <title>, description and canonical hygiene on every built page.
 *
 * Nothing covered this before 13 Sep 2026: content.config.ts documented
 * "≤ ~60 chars" as a comment, two pages shared a title with the guide about
 * the same city (a city page and its guide competing for one query), and
 * descriptions ran to 259 characters. Asserts, per page (404 and the design
 * reference excluded):
 *   - exactly one <title>, unique across the tree, ≤ MAX_TITLE chars
 *   - exactly one description, unique, MIN..MAX_DESC chars, and NOT the
 *     sitewide default unless this is the home (a page that forgets to pass
 *     one inherits site.description silently)
 *   - exactly one canonical, absolute, carrying the tree's base
 *
 * Runs on both targets: BUILD_TARGET=global reads dist-global/.
 * Fault-inject (META_DIST → a copy): duplicate a title, blank a description.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";
import { pages, html, unescape } from "./_dist.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const DIST = process.env.META_DIST ?? join(ROOT, TARGET === "global" ? "dist-global" : "dist");
if (!existsSync(DIST)) { console.error(`check-meta: ${DIST} not found — build first.`); process.exit(1); }

// Google's ~600px title slot ≈ 60–70 Latin characters; the snippet shows
// ~155–160 of a description. AU (English, unreviewed-friendly) is held to the
// tight bounds. The global tree carries native-reviewed French that runs
// ~15% longer, and terse legal descriptions — held to a wider band, tightened
// with the next French review batch, never by editing reviewed copy blind.
const MAX_TITLE = TARGET === "global" ? 72 : 65;
const MIN_DESC = TARGET === "global" ? 25 : 60;
const MAX_DESC = TARGET === "global" ? 205 : 170;

const { site } = await loadTS(join(ROOT, "src/data/site.ts"));
const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));
const bases = localesForTarget(TARGET).map((l) => l.base);

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
// Uniqueness is scoped to a locale TREE: /fr/products/voxtable/ and
// /be-fr/products/voxtable/ are byte-identical hreflang alternates by design
// (intl/products.ts), not duplicates.
const treeOf = (route) => bases.find((b) => route === `${b}/` || route.startsWith(`${b}/`)) ?? "";
const titles = new Map();
const descs = new Map();
let checked = 0;

for (const { file, route } of pages(DIST)) {
  if (route.startsWith("/404") || route.startsWith("/kitchen-sink")) continue;
  checked++;
  const h = html(file);
  const t = [...h.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => unescape(m[1]));
  const d = [...h.matchAll(/<meta name="description" content="([^"]*)"/g)].map((m) => unescape(m[1]));
  const c = [...h.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);

  if (t.length !== 1) fail(`${route}: ${t.length} <title> tags`);
  else {
    if (t[0].length > MAX_TITLE) fail(`${route}: title is ${t[0].length} chars (max ${MAX_TITLE}): "${t[0]}"`);
    if (t[0].trim().length < 8) fail(`${route}: title too short: "${t[0]}"`);
    titles.set(`${treeOf(route)}|${t[0]}`, [...(titles.get(`${treeOf(route)}|${t[0]}`) ?? []), route]);
  }
  if (d.length !== 1) fail(`${route}: ${d.length} description tags`);
  else {
    if (d[0].length < MIN_DESC || d[0].length > MAX_DESC) fail(`${route}: description is ${d[0].length} chars (want ${MIN_DESC}–${MAX_DESC})`);
    const isHome = bases.some((b) => route === `${b}/`) || route === "/";
    if (!isHome && d[0] === site.description) fail(`${route}: description is the sitewide default — the page forgot to pass one`);
    descs.set(`${treeOf(route)}|${d[0]}`, [...(descs.get(`${treeOf(route)}|${d[0]}`) ?? []), route]);
  }
  if (c.length !== 1) fail(`${route}: ${c.length} canonical links`);
  else if (!/^https:\/\//.test(c[0])) fail(`${route}: canonical is not absolute: ${c[0]}`);
  else if (!bases.some((b) => c[0].includes(`biteperk.com${b}/`))) fail(`${route}: canonical ${c[0]} carries no locale base`);
}
for (const [t, routes] of titles) if (routes.length > 1) fail(`duplicate title "${t.split("|")[1]}" on ${routes.join(", ")}`);
for (const [d, routes] of descs) {
  // A /blog/ index that canonicalises to /resources/guides/ may share; nothing else may.
  const distinct = routes.filter((r) => !/\/blog\/$/.test(r));
  if (distinct.length > 1) fail(`duplicate description on ${distinct.join(", ")}`);
}

if (failed) { console.error(`\ncheck-meta (${TARGET}): ${failed} failure(s) across ${checked} pages`); process.exit(1); }
console.log(`check-meta (${TARGET}): ok — ${checked} pages, unique titles ≤${MAX_TITLE}, descriptions ${MIN_DESC}–${MAX_DESC}, one absolute canonical each`);
