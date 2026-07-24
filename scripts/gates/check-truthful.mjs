#!/usr/bin/env node
/**
 * Europe-truthful content sweep over the GLOBAL build (dist-global/).
 *
 * The prose half of the PLAN.md §8 rules — check-schema covers the structured
 * data (Organization-only, no NAP/geo/areaServed); THIS gate greps the built
 * HTML of every global-locale page for Australia-only facts that must never
 * appear on an international page:
 *
 *   - the published AU phone number (+61 2 5504 1140, any common formatting)
 *   - the print-only demo line ((02) 7501 1140)
 *   - the Haymarket NAP (street or suburb)
 *   - the "$80" AU price (EU pricing is a pilot outcome, never quoted)
 *
 * Domain mentions (biteperk.com.au) are deliberately NOT forbidden: the org
 * schema's sameAs, the "Australia site ↗" footer link and the hello@ contact
 * email all legitimately reference the AU property. What's forbidden is AU
 * *facts* presented to a European visitor.
 *
 * CLAUDE.md described this sweep before it existed — this file makes the
 * documented control real. Fault-inject before trusting: plant "$80" in a
 * built page, re-run, confirm exit 1.
 *
 * Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-truthful.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");

if (!existsSync(DIST)) {
  console.error(`check-truthful: ${DIST} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));

// Each entry: a human label + a regex tolerant of the formattings that have
// actually appeared in this repo's copy (spaces, non-breaking spaces, tel:
// hrefs with no spaces).
const FORBIDDEN = [
  { label: "AU phone +61 2 5504 1140", re: /\+?61[\s ]?2[\s ]?5504[\s ]?1140|61255041140|0?2[\s ]5504[\s ]1140/ },
  { label: "print-only demo line (02) 7501 1140", re: /7501[\s ]?1140/ },
  { label: "Haymarket NAP", re: /Haymarket|477[\s ]?Pitt/i },
  { label: "AU price $80", re: /\$[\s ]?80\b|80[\s ]?AUD/ },
];

function htmlFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const pages = localesForTarget("global").flatMap((l) =>
  htmlFiles(join(DIST, l.base.replace(/^\//, ""))),
);

let failed = 0;
for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");
  for (const { label, re } of FORBIDDEN) {
    const m = html.match(re);
    if (m) {
      failed++;
      console.error(`FAIL  ${rel}: contains ${label} — "…${m[0]}…"`);
    }
  }
}

if (!pages.length) {
  console.error("FAIL  check-truthful: no global-locale pages found in dist-global");
  process.exit(1);
}

if (failed) {
  console.error(`\ncheck-truthful: ${failed} AU-fact leak(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(`check-truthful: ${pages.length} global page(s) carry no AU phone, NAP or price.`);
