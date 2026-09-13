#!/usr/bin/env node
/**
 * Hosting-layer gate over firebase.json — THE ONE FILE NO OTHER GATE READS.
 *
 * Why this exists: every other gate checks a built tree; nothing checked the
 * config Firebase serves it through, and on 13 Sep 2026 four defects were
 * found LIVE that had passed every CI run:
 *   - `**\/*.@(html)` Cache-Control never matched (cleanUrls: no request path
 *     ends in .html), so pages cached for Firebase's 3600s default, not 300;
 *   - biteperk.com.au/sitemap-index.xml (the sitemap Search Console holds for
 *     the migrating domain) 301'd into /au-en/… and 404'd — merge-dist keeps
 *     root-only files OUT of /au-en on purpose;
 *   - legacy .com.au product slugs took two hops (cctld → /au-en/<legacy> →
 *     /au-en/products/<slug>/), where CLAUDE.md promised one;
 *   - no Content-Language on any locale tree.
 *
 * Asserts, against dist-site/ (what biteperk-global serves) and locales.ts:
 *   redirects (global)  every relative destination resolves to a real page or
 *                       file, and is not itself a redirect source (no chains)
 *   redirects (cctld)   every destination is on ORIGIN, resolves, and is not a
 *                       global redirect source (no cross-host chains); every
 *                       root-only file merge-dist places at the site root has a
 *                       direct cctld redirect; every /au-en/<x> → /au-en/<y>
 *                       legacy rule on the global target is mirrored as /<x> →
 *                       ORIGIN/au-en/<y> on the cctld target (single hop)
 *   headers             every rule matches ≥1 real request path (a dead rule is
 *                       a policy that silently does not apply); every page gets
 *                       a Cache-Control with max-age=300; every hashed /_astro
 *                       asset gets `immutable`; no unhashed asset gets it; every
 *                       published locale base gets a Content-Language equal to
 *                       its lang; CSP has no `data:` in script-src and carries
 *                       object-src
 *
 * Matching uses picomatch (extglob + braces), which reproduces Firebase's glob
 * behaviour for every pattern in the file — the `**\/*.@(html)` non-match was
 * confirmed with it before the rule was replaced. `regex` sources are RE2 in
 * Firebase; the subset used here is plain JS-compatible.
 *
 * Fault-inject before trusting (FIREBASE_JSON points it at a copy):
 *   re-add {"source":"**\/*.@(html)"} → "matches no request path";
 *   drop the /sitemap-index.xml cctld rule → "root-only file … no direct";
 *   change /au-en/voxtable's cctld mirror → "two hops".
 *
 * Run after `npm run build:site`:  node scripts/gates/check-hosting.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import picomatch from "picomatch";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = join(ROOT, "dist-site");
const CONFIG = process.env.FIREBASE_JSON ?? join(ROOT, "firebase.json");
const ORIGIN = "https://biteperk.com";
const ROOT_ONLY = ["robots.txt", "llms.txt", "humans.txt", "sitemap-0.xml", "sitemap-index.xml"];

if (!existsSync(SITE)) {
  console.error(`check-hosting: ${SITE} not found — run npm run build:site first.`);
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(CONFIG, "utf8"));
const global = cfg.hosting.find((h) => h.target === "biteperk-global");
const cctld = cfg.hosting.find((h) => h.target === "biteperk");
if (!global || !cctld) {
  console.error("check-hosting: expected hosting targets biteperk-global and biteperk in firebase.json");
  process.exit(1);
}

const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const published = [...locales.localesForTarget("au"), ...locales.localesForTarget("global")];

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
const ok = (m) => console.log(`ok    ${m}`);

// ---------- what Firebase would actually be asked for ----------
const pages = []; // "/gb-en/about/" — every index.html directory, as its clean request path
const assets = []; // "/_astro/x.js", "/og/home.png", "/robots.txt" — every other file
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const rel = "/" + relative(SITE, p).split("\\").join("/");
    if (name === "index.html") pages.push(rel.replace(/index\.html$/, ""));
    else if (name === "404.html") pages.push("/__404__/"); // served for any miss; treat as a page
    else assets.push(rel);
  }
})(SITE);
const requestPaths = [...pages.filter((p) => p !== "/__404__/"), ...assets];

/** Does a header/redirect rule match a request path, the way Firebase evaluates it? */
function matcherFor(rule) {
  if (rule.regex) {
    const re = new RegExp(rule.regex);
    return (path) => re.test(path);
  }
  const src = rule.source;
  // Firebase sources are matched against the path; `**` globs are written without a leading
  // slash in this file and with one on literal paths — picomatch handles both if we try both.
  const m = picomatch(src, { dot: false });
  return (path) => m(path) || (path.startsWith("/") && m(path.slice(1)));
}

/** dist-site file a site-relative path resolves to, or null. */
function resolves(path) {
  const clean = path.replace(/^\/+/, "");
  if (!clean) return existsSync(join(SITE, "index.html"));
  if (/\.[a-z0-9]+$/i.test(clean)) return existsSync(join(SITE, clean));
  return existsSync(join(SITE, clean.replace(/\/$/, ""), "index.html"));
}

const isLiteral = (s) => typeof s === "string" && !/[*?{}()@!+\[\]]/.test(s) && !s.includes(":");

// ---------- redirects: biteperk-global ----------
const gSources = new Set(global.redirects.filter((r) => isLiteral(r.source)).map((r) => r.source));
for (const r of global.redirects) {
  const dest = r.destination;
  if (/^https?:\/\//.test(dest)) continue;
  if (dest.includes(":")) continue; // capture-carrying destination; not statically resolvable
  if (!resolves(dest)) fail(`global redirect ${r.source ?? r.regex} → ${dest}: destination does not resolve in dist-site`);
  if (gSources.has(dest) || gSources.has(dest.replace(/\/$/, ""))) fail(`global redirect ${r.source} → ${dest}: destination is itself a redirect source (chain)`);
}
ok(`global redirects: ${global.redirects.length} rules, destinations resolve, no chains`);

// ---------- redirects: cctld (biteperk.com.au) ----------
const cSources = new Set(cctld.redirects.filter((r) => isLiteral(r.source)).map((r) => r.source));
for (const r of cctld.redirects) {
  const dest = r.destination;
  if (!dest.startsWith(ORIGIN + "/")) { fail(`cctld redirect ${r.source} → ${dest}: must land on ${ORIGIN}`); continue; }
  const path = dest.slice(ORIGIN.length);
  if (path.includes(":")) continue; // the /:path* catch-all
  if (!resolves(path)) fail(`cctld redirect ${r.source} → ${dest}: destination does not resolve in dist-site`);
  if (gSources.has(path) || gSources.has(path.replace(/\/$/, ""))) fail(`cctld redirect ${r.source} → ${dest}: lands on a global redirect source — two hops`);
}
for (const f of ROOT_ONLY) {
  if (!existsSync(join(SITE, f))) continue;
  const rule = cctld.redirects.find((r) => r.source === `/${f}`);
  if (!rule) fail(`root-only file /${f} exists at the site root but has no direct cctld redirect — the /:path* catch-all sends it to /au-en/${f} (404)`);
  else if (rule.destination !== `${ORIGIN}/${f}`) fail(`cctld /${f} → ${rule.destination}: expected ${ORIGIN}/${f}`);
}
// Every legacy /au-en/<x> → /au-en/<y> rule on the global target must be mirrored single-hop on the cctld target.
for (const r of global.redirects) {
  if (!r.source || !r.source.startsWith("/au-en/") || !r.destination.startsWith("/au-en/")) continue;
  const src = r.source.slice("/au-en".length);
  const mirror = cctld.redirects.find((x) => x.source === src);
  if (!mirror) fail(`cctld has no mirror for ${r.source}: .com.au${src} would take two hops`);
  else if (mirror.destination !== `${ORIGIN}${r.destination}`) fail(`cctld ${src} → ${mirror.destination}: expected ${ORIGIN}${r.destination} (single hop)`);
}
ok(`cctld redirects: ${cctld.redirects.length} rules, root-only files direct, legacy slugs single-hop`);

// ---------- headers ----------
const rules = global.headers.map((h) => ({ rule: h, match: matcherFor(h), label: h.source ?? `regex ${h.regex}` }));
for (const { rule, match, label } of rules) {
  if (!requestPaths.some(match)) fail(`header rule ${label} matches no request path in dist-site — a policy that never applies`);
}
const cacheOf = (path) => {
  let value = null;
  for (const { rule, match } of rules) if (match(path)) for (const h of rule.headers) if (/^cache-control$/i.test(h.key)) value = h.value;
  return value;
};
let pagesOk = 0;
for (const p of pages) {
  if (p === "/__404__/") continue;
  const cc = cacheOf(p) ?? "";
  if (!/max-age=300\b/.test(cc)) fail(`page ${p}: Cache-Control is "${cc || "(none → Firebase default 3600)"}", expected max-age=300`);
  else pagesOk++;
}
ok(`${pagesOk} pages get max-age=300`);
let hashedOk = 0, unhashedOk = 0;
for (const a of assets) {
  const cc = cacheOf(a) ?? "";
  if (a.startsWith("/_astro/")) { if (!/immutable/.test(cc)) fail(`hashed asset ${a}: expected immutable, got "${cc}"`); else hashedOk++; }
  else if (/\.(png|jpe?g|webp|avif|svg|ico|webmanifest)$/i.test(a)) { if (/immutable/.test(cc)) fail(`unhashed asset ${a}: must not be immutable (cannot be regenerated within max-age)`); else unhashedOk++; }
}
ok(`${hashedOk} hashed assets immutable, ${unhashedOk} unhashed assets re-fetchable`);

for (const l of published) {
  const home = `${l.base}/`;
  let value = null;
  for (const { rule, match } of rules) if (match(home)) for (const h of rule.headers) if (/^content-language$/i.test(h.key)) value = h.value;
  if (value !== l.lang) fail(`${home}: Content-Language is ${value ?? "(none)"}, expected ${l.lang} (locales.ts)`);
}
ok(`Content-Language set for ${published.length} locale bases`);

const csp = global.headers.flatMap((h) => h.headers).find((h) => /^content-security-policy$/i.test(h.key))?.value ?? "";
const scriptSrc = csp.split(";").map((s) => s.trim()).find((s) => s.startsWith("script-src")) ?? "";
if (/\bdata:/.test(scriptSrc)) fail("CSP script-src allows data: — a known bypass; nothing on the site loads a data-URI script");
if (!/object-src\s+'none'/.test(csp)) fail("CSP has no object-src 'none'");
ok("CSP: script-src has no data:, object-src 'none'");

if (failed) { console.error(`\ncheck-hosting: ${failed} failure(s)`); process.exit(1); }
console.log("\ncheck-hosting: ok");
