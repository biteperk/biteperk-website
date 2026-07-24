#!/usr/bin/env node
/**
 * hreflang integrity gate over the GLOBAL build (dist-global/).
 *
 * For every global-locale page (all bases derived from locales.ts) asserts:
 *   - the complete cluster of hreflang codes (derived from src/data/locales.ts)
 *   - exactly one x-default
 *   - every href is absolute (https://biteperk.com/…) and resolves to a built
 *     page in dist-global (never a redirect target / 404)
 *   - self-referencing (the page's own canonical is one of its alternates)
 *   - reciprocal (paired pages — same path across locales — list the same set)
 *
 * Fault-inject before trusting: break one href in a built file, re-run, confirm
 * exit 1. Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-hreflang.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
const HOST = "https://biteperk.com";

if (!existsSync(DIST)) {
  console.error(`check-hreflang: ${DIST} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

// locales.ts is the single source of truth — loadTS (bundling) rather than a
// raw transform + data URL, so the gate keeps working if locales.ts ever
// grows a relative import (a data: URL has no base to resolve one against).
const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const globals = locales.localesForTarget("global");
const EXPECTED_CODES = new Set(globals.flatMap((l) => l.hreflang));
// Reciprocity key: strip the LOCALE SEGMENT (derived, longest-first so
// "be-en" wins over any prefix). A hardcoded (en|fr) here silently skipped
// every page of a new locale — the check "passed" by never comparing them.
const SEG_ALT = globals
  .map((l) => l.base.replace(/^\//, ""))
  .sort((a, b) => b.length - a.length)
  .join("|");
const SEG_RE = new RegExp(`^(${SEG_ALT})/`);

function htmlFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}
const pages = globals.flatMap((l) => htmlFiles(join(DIST, l.base.replace(/^\//, ""))));

function alternatesOf(html) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/g)) {
    const tag = m[0];
    const hl = tag.match(/hreflang="([^"]+)"/);
    const hf = tag.match(/href="([^"]+)"/);
    if (hl && hf) out.push({ hreflang: hl[1], href: hf[1] });
  }
  return out;
}
const canonicalOf = (html) => (html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/) || [])[1] ?? null;

function resolvesInDist(href) {
  if (!href.startsWith(HOST + "/")) return false;
  const path = href.slice(HOST.length).replace(/^\/+/, "").replace(/\/$/, "");
  const file = path ? join(DIST, path, "index.html") : join(DIST, "index.html");
  return existsSync(file);
}

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
const setsByPath = new Map();

for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");
  const alts = alternatesOf(html);
  const canonical = canonicalOf(html);

  const xdef = alts.filter((a) => a.hreflang === "x-default");
  if (xdef.length !== 1) fail(`${rel}: expected exactly one x-default, found ${xdef.length}`);

  const codes = new Set(alts.filter((a) => a.hreflang !== "x-default").map((a) => a.hreflang));
  for (const c of EXPECTED_CODES) if (!codes.has(c)) fail(`${rel}: missing hreflang="${c}"`);

  for (const a of alts) {
    if (!a.href.startsWith(HOST + "/")) fail(`${rel}: hreflang ${a.hreflang} href not absolute on ${HOST}: ${a.href}`);
    else if (!resolvesInDist(a.href)) fail(`${rel}: hreflang ${a.hreflang} href does not resolve in dist-global: ${a.href}`);
  }

  if (canonical && !alts.some((a) => a.href === canonical))
    fail(`${rel}: not self-referencing (canonical ${canonical} absent from its alternates)`);

  const key = rel.replace(SEG_RE, "").replace(/index\.html$/, "");
  const hrefSet = [...new Set(alts.filter((a) => a.hreflang !== "x-default").map((a) => a.href))].sort().join("|");
  const prev = setsByPath.get(key);
  if (prev && prev !== hrefSet) fail(`${rel}: hreflang set not reciprocal with its "${key}" sibling`);
  else setsByPath.set(key, hrefSet);
}

if (!pages.length) fail("no global-locale pages found in dist-global");

if (failed) {
  console.error(`\ncheck-hreflang: ${failed} failure(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(`check-hreflang: ${pages.length} page(s) OK — complete cluster, reciprocal, absolute, resolving; one x-default each.`);
