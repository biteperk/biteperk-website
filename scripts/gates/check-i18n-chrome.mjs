#!/usr/bin/env node
/**
 * In-language chrome gate — every French document must be French all the way
 * down, INCLUDING the parts a sighted visitor never reads.
 *
 * Why this exists: on 13 Sep 2026 nine accessible names shipped in English on
 * every /fr and /be-fr page — "Skip to content", "BitePerk home", "Site",
 * "Breadcrumb", "Close cities menu", "Region and language — currently …",
 * "Close region picker", "Switch to dark theme" — plus the contact form's
 * "Sending…" / "Thanks — we'll be in touch." / "Network error…" inside its
 * inline script. No gate could see them: check-truthful strips <script>
 * before its text pass, axe does not judge language, and the similarity gate
 * strips nav/footer. A screen-reader user in Paris heard English chrome around
 * French content.
 *
 * Asserts, for every built page whose <html lang> is French:
 *   - no aria-label / alt / title / placeholder attribute value, and no
 *     .sr-only element, contains an ENGLISH marker
 *   - no inline <script> string literal contains one (JSON-LD is check-schema's
 *     job; the LocaleSuggest data blob is exempt — its strings are deliberately
 *     in the TARGET locale's language)
 *
 * Markers are English-only words and phrases — never "Menu", "Site", "Contact",
 * which are also French. Extend the list when a new English string is found in
 * a French document; never shrink it to make a page pass.
 *
 * Fault-inject before trusting (I18N_DIST points it at a fixture):
 *   add aria-label="Close" to any element on a French page → exit 1.
 *
 * Run after `npm run build:global`:  node scripts/gates/check-i18n-chrome.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = process.env.I18N_DIST ?? join(ROOT, "dist-global");

if (!existsSync(DIST)) {
  console.error(`check-i18n-chrome: ${DIST} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

const ENGLISH = new RegExp(
  String.raw`\b(?:Skip to|Close (?:region|cities|menu)|Choose your|Sending|Thanks|Sorry|Network error|Switch (?:to|theme)|Region and language|Breadcrumb|home page|BitePerk home|Region picker|Select a|Please)\b`,
);

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html")) pages.push(p);
  }
})(DIST);

let failed = 0;
let checked = 0;
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const lang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1] ?? "";
  if (!lang.toLowerCase().startsWith("fr")) continue;
  checked++;
  const rel = relative(DIST, file);
  const hits = [];

  // Attribute values that assistive tech reads.
  for (const m of html.matchAll(/\b(aria-label|alt|title|placeholder)="([^"]*)"/g)) {
    const v = m[2].replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    if (ENGLISH.test(v)) hits.push(`${m[1]}="${v}"`);
  }
  // Screen-reader-only text.
  for (const m of html.matchAll(/class="[^"]*\bsr-only\b[^"]*"[^>]*>([^<]*)</g)) {
    if (ENGLISH.test(m[1])) hits.push(`.sr-only "${m[1]}"`);
  }
  // Inline scripts: string literals only (JSON-LD and the suggest blob exempt).
  for (const m of html.matchAll(/<script(?![^>]*type="application\/(?:ld\+)?json")(?![^>]*data-locale-suggest-data)[^>]*>([\s\S]*?)<\/script>/g)) {
    for (const lit of m[1].matchAll(/(["'`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) {
      if (lit[2].length > 3 && ENGLISH.test(lit[2])) hits.push(`script literal "${lit[2].slice(0, 60)}"`);
    }
  }

  if (hits.length) {
    failed++;
    console.error(`FAIL  ${rel} (lang=${lang}): English in the chrome —\n        ${hits.slice(0, 8).join("\n        ")}${hits.length > 8 ? `\n        … +${hits.length - 8}` : ""}`);
  }
}

if (checked === 0) {
  console.error("check-i18n-chrome: found no French page — the gate would pass vacuously");
  process.exit(1);
}
if (failed) {
  console.error(`\ncheck-i18n-chrome: ${failed} of ${checked} French pages carry English chrome`);
  process.exit(1);
}
console.log(`check-i18n-chrome: ok — ${checked} French pages, no English in aria/alt/title/sr-only/script literals`);
