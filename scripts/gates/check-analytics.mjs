#!/usr/bin/env node
/**
 * Analytics gate — proves the self-hosted Umami tracker is present, correct and
 * uniform on every built page, and that the config the layout reads agrees with
 * the CSP Firebase serves.
 *
 * Why this exists: nothing else looks at the tracker. check-hosting only checks
 * the CSP has no `data:` in script-src; check-assets/check-links skip absolute
 * URLs; a missing or mistyped `data-website-id`, a `data-tag` that lost a market,
 * or a CSP that forgot the Umami host all ship silently — the last one blocks the
 * script at runtime with no build error. This gate is the single thing that fails
 * CI on any of them, and because it derives the expected tag from locales.ts it
 * keeps covering every locale added later (Canada, USA, …) with no edit here.
 *
 * Asserts, against dist/ (au) or dist-global/ (global) and src/data/*.ts:
 *   - exactly one Umami <script src=".../script.js"> per page, with
 *     data-website-id = config, data-domains = ANALYTICS_HOSTS.join(","), and
 *     data-tag = the base slug of the locale that owns the page (localeFromPath);
 *   - no page references the removed /api/event analytics endpoint;
 *   - (au leg) firebase.json's biteperk-global CSP lists UMAMI_HOST in BOTH
 *     script-src and connect-src;
 *   - the config itself is sane (uuid website id, https non-localhost host).
 *
 * Fault-inject before trusting (ANALYTICS_DIST points it at a fixture dir):
 *   drop the tag from one page → "no Umami tag"; change a data-tag → "data-tag";
 *   strip UMAMI_HOST from the CSP → "CSP script-src".
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const DIST_NAME = TARGET === "global" ? "dist-global" : "dist";
const DIST = process.env.ANALYTICS_DIST || join(ROOT, DIST_NAME);

let failed = 0;
const fail = (m) => { console.error(`  ✗ ${m}`); failed++; };
const ok = (m) => console.log(`  ✓ ${m}`);

if (!existsSync(DIST)) {
  console.error(`check-analytics: ${DIST} not found — run the build first.`);
  process.exit(1);
}

const consent = await loadTS(join(ROOT, "src/data/consent.ts"));
const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID, UMAMI_HOST, ANALYTICS_HOSTS } = consent;
const EXPECTED_DOMAINS = ANALYTICS_HOSTS.join(",");

// AU pages are emitted with the /au-en base STRIPPED on disk (merge-dist re-adds
// it), but the HTML was rendered with the base present — so reconstruct the
// build-time pathname before deriving the owning locale. Global pages carry
// their base on disk already.
const AU_BASE = locales.localesForTarget("au")[0].base; // "/au-en"

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

/** Disk path → the pathname the layout saw at build time. */
function routeFor(file) {
  let r = "/" + file.slice(DIST.length + 1).replace(/index\.html$/, "").replace(/\.html$/, "");
  r = r.replace(/\/$/, "") || "/";
  return TARGET === "au" ? AU_BASE + (r === "/" ? "/" : r) : r;
}

const pages = walk(DIST);
const FLOOR = TARGET === "au" ? 30 : 10;
if (pages.length < FLOOR) fail(`only ${pages.length} page(s) under ${DIST_NAME}/ (< ${FLOOR}) — build looks empty, gate would pass vacuously`);

const tagRe = new RegExp(
  `<script\\b[^>]*\\bsrc="${UMAMI_SCRIPT_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`,
  "g",
);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

let checked = 0;
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(DIST.length + 1);
  const tags = html.match(tagRe) ?? [];
  if (tags.length !== 1) { fail(`${rel}: expected exactly 1 Umami tag, found ${tags.length}`); continue; }
  const tag = tags[0];
  const expectTag = locales.localeFromPath(routeFor(file)).base.slice(1);
  if (attr(tag, "data-website-id") !== UMAMI_WEBSITE_ID) fail(`${rel}: data-website-id=${attr(tag, "data-website-id")}, expected ${UMAMI_WEBSITE_ID}`);
  if (attr(tag, "data-domains") !== EXPECTED_DOMAINS) fail(`${rel}: data-domains=${attr(tag, "data-domains")}, expected ${EXPECTED_DOMAINS}`);
  if (attr(tag, "data-tag") !== expectTag) fail(`${rel}: data-tag=${attr(tag, "data-tag")}, expected ${expectTag}`);
  if (!/\bdefer\b/.test(tag)) fail(`${rel}: Umami tag is missing defer`);
  if (/\/api\/event\b/.test(html)) fail(`${rel}: still references the removed /api/event endpoint`);
  checked++;
}
if (!failed) ok(`${checked} page(s): exactly one Umami tag, correct website-id/domains/data-tag, no /api/event`);

// Config sanity.
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(UMAMI_WEBSITE_ID)) fail(`UMAMI_WEBSITE_ID is not a uuid: ${UMAMI_WEBSITE_ID}`);
if (!/^https:\/\//.test(UMAMI_HOST) || /localhost|127\.0\.0\.1/.test(UMAMI_HOST)) fail(`UMAMI_HOST must be https and non-localhost: ${UMAMI_HOST}`);
if (!failed) ok(`config sane: website id is a uuid, host is ${UMAMI_HOST}`);

// CSP drift (au leg only — the global build has no firebase.json of its own).
if (TARGET === "au") {
  const fb = JSON.parse(readFileSync(process.env.FIREBASE_JSON || join(ROOT, "firebase.json"), "utf8"));
  const global = fb.hosting.find((h) => h.target === "biteperk-global");
  const csp = global?.headers?.flatMap((h) => h.headers).find((h) => /^content-security-policy$/i.test(h.key))?.value ?? "";
  const dir = (name) => csp.split(";").map((s) => s.trim()).find((s) => s.startsWith(name)) ?? "";
  for (const name of ["script-src", "connect-src"]) {
    if (!dir(name).includes(UMAMI_HOST)) fail(`CSP ${name} does not list UMAMI_HOST (${UMAMI_HOST}) — the tracker would be blocked at runtime`);
  }
  if (!failed) ok(`CSP: script-src and connect-src both list ${UMAMI_HOST}`);
}

if (failed) { console.error(`\ncheck-analytics: ${failed} failure(s)`); process.exit(1); }
console.log("\ncheck-analytics: ok");
