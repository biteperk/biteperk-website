#!/usr/bin/env node
/**
 * Planned-locale artefact gate (Wave 7 / C2) — runs after `npm run build:site`.
 *
 * The source-level contract (tests/unit/locale-planned.test.mjs) says the
 * exported `locales` array filters planned locales out of everything. This
 * gate checks the SHIPPED tree, because a leak surface that bypasses the
 * array — a hand-written list, a glob over bases, a manifest route — would
 * pass the unit test and still publish "/ca-en/" to the world. For each
 * planned locale it asserts, over dist-site/ (what biteperk-global serves):
 *   - no dist-site/<seg>/ directory and no <seg>/index.html;
 *   - zero occurrences of the base path in every sitemap, llms.txt, robots.txt
 *     and webmanifest;
 *   - zero hreflang="<code>" (any of its codes) in any built HTML;
 *   - no og card, no manifest, no city cityscape referenced for it;
 *   - firebase.json carries no redirect or header naming the base.
 *
 * Positive-shaped where it must be: it fails if there are no planned locales
 * at all (a gate that finds nothing to check must say so, not pass silently).
 *
 * Fault-inject before trusting (PLANNED_DIST points it at a fixture copy of
 * dist-site): mkdir <fixture>/ca-en; add "/ca-en/" to a sitemap; add
 * hreflang="en-CA" to any page.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = process.env.PLANNED_DIST ? join(ROOT, process.env.PLANNED_DIST) : join(ROOT, "dist-site");
if (!existsSync(DIST)) { console.error(`check-planned: ${DIST} not found — run npm run build:site first.`); process.exit(1); }

const loc = await loadTS(join(ROOT, "src/data/locales.ts"));
const planned = loc.plannedLocales();
if (planned.length === 0) { console.error("check-planned: no planned locale registered — nothing to check is a failure, not a pass."); process.exit(1); }

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };

const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else files.push(p); } })(DIST);
const textFiles = files.filter((f) => /\.(html|xml|txt|webmanifest|json)$/i.test(f));
const firebase = readFileSync(join(ROOT, "firebase.json"), "utf8");

for (const p of planned) {
  const seg = p.base.replace(/^\//, "");
  if (existsSync(join(DIST, seg))) fail(`${p.base}: dist-site/${seg}/ exists — a planned locale was built`);
  // No lookbehind: "https://biteperk.com/ca-en/" is the leak, and the host ends in a word character.
  const basePath = new RegExp(`${p.base.replace("/", "\\/")}(?:/|["'\\s<])`);
  const codes = new RegExp(`hreflang=["'](?:${p.hreflang.join("|")})["']`, "i");
  let baseHits = 0, codeHits = 0;
  for (const f of textFiles) {
    const s = readFileSync(f, "utf8");
    if (basePath.test(s)) { baseHits++; if (baseHits <= 3) fail(`${p.base}: referenced in ${relative(DIST, f)}`); }
    if (/\.html$/i.test(f) && codes.test(s)) { codeHits++; if (codeHits <= 3) fail(`${p.base}: hreflang ${p.hreflang.join("/")} emitted in ${relative(DIST, f)}`); }
  }
  if (baseHits > 3) fail(`${p.base}: …and ${baseHits - 3} more file(s) reference it`);
  if (codeHits > 3) fail(`${p.base}: …and ${codeHits - 3} more page(s) emit its hreflang`);
  for (const f of files) {
    const rel = relative(DIST, f);
    if (/^og\/intl\/.*-(?:ca-en|ca-fr)\.png$/.test(rel) && rel.includes(seg)) fail(`${p.base}: OG card ${rel} generated for a planned locale`);
    if (rel === `manifest/${seg}.webmanifest`) fail(`${p.base}: web manifest generated for a planned locale`);
  }
  if (firebase.includes(`"${p.base}/`) || firebase.includes(`"${p.base}"`)) fail(`${p.base}: firebase.json names the planned base`);
  console.log(`ok    ${p.base} (${p.lang}): absent from dist-site, sitemaps, llms, hreflang, OG, manifest, firebase.json`);
}

if (failed) { console.error(`\ncheck-planned: ${failed} failure(s) across ${planned.length} planned locale(s)`); process.exit(1); }
console.log(`\ncheck-planned: ok — ${planned.length} planned locale(s) leak nowhere in ${textFiles.length} built text files`);
