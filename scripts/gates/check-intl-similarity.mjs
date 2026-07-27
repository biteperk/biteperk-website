#!/usr/bin/env node
/**
 * Anti-duplicate gate for the market trees (dist-global/).
 *
 * The international trees serve the same product in the same language to
 * different regions. hreflang legitimately covers that — but only if the pages
 * are genuinely for different markets. Before this gate the three English trees
 * were 90-95% identical and /about/ was 100% identical across all three: three
 * near-copies of one page, separated by a flag. That is the doorway pattern
 * check-cities.mjs already blocks on the AU city pages, and this applies the
 * same standard, the same method and the same 35% threshold to the market trees.
 *
 * Pools are PER LANGUAGE, because pages in different languages are already
 * distinguished by language — the meaningful comparison is within one:
 *   English = /en + /gb-en + /be-en      French = /fr + /be-fr
 *
 * Primitives come from _similarity.mjs so this and check-cities cannot drift.
 * (True since Jul 2026 — check-cities kept a private copy before that, and this
 * line asserted otherwise while they were already drifting. Keep it true.)
 * Note the metric is containment, not Jaccard: adding unique copy to only one
 * side barely helps, so a market that skips (say) its FAQ will not pass by
 * having its sibling grow.
 *
 * Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-intl-similarity.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { shingles, overlap, visibleText } from "./_similarity.mjs";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
const MAX = 0.35;

if (!existsSync(DIST)) {
  console.error("check-intl-similarity: dist-global/ not found — run BUILD_TARGET=global npm run build first.");
  process.exit(1);
}

const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const globals = locales.localesForTarget("global");

/** Pages worth comparing: the two every locale emits and a visitor actually reads. */
const PAGES = ["", "about/"];

// Pool by copy language — derived from locales.ts, so a new locale joins its
// pool automatically rather than needing an edit here.
const pools = new Map();
for (const l of globals) {
  if (!pools.has(l.copyLang)) pools.set(l.copyLang, []);
  pools.get(l.copyLang).push(l);
}

let failed = 0;
let worst = 0;

for (const page of PAGES) {
  const label = page === "" ? "home" : `/${page.replace(/\/$/, "")}`;

  for (const [lang, pool] of pools) {
    if (pool.length < 2) continue; // nothing to compare against

    const text = new Map();
    for (const l of pool) {
      const file = join(DIST, l.base.replace(/^\//, ""), page, "index.html");
      if (!existsSync(file)) {
        console.error(`FAIL  [${lang}] ${l.base}/${page} not built — expected ${file}`);
        failed++;
        continue;
      }
      text.set(l.base, shingles(visibleText(readFileSync(file, "utf8"))));
    }

    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const a = pool[i].base;
        const b = pool[j].base;
        const A = text.get(a);
        const B = text.get(b);
        if (!A || !B) continue;

        const sim = overlap(A, B);
        const pct = Math.round(sim * 100);
        worst = Math.max(worst, pct);

        if (sim > MAX) {
          console.error(
            `FAIL  [${lang}] ${label}: ${a} vs ${b} — ${pct}% similar (max ${MAX * 100}%). ` +
              `These trees read as near-copies of each other; differentiate the market copy ` +
              `(home h1/lede/proof/trust/closing, about, and the market FAQ) rather than translating one page five ways.`,
          );
          failed++;
        } else {
          console.log(`PASS  [${lang}] ${label}: ${a} vs ${b} — ${pct}%`);
        }
      }
    }
  }
}

if (failed) {
  console.error(`\ncheck-intl-similarity: ${failed} failure(s). Worst pair ${worst}%.`);
  process.exit(1);
}
console.log(
  `\ncheck-intl-similarity: OK — every pair under ${MAX * 100}% ` +
    `(worst ${worst}%, ${Math.round(MAX * 100) - worst} points of headroom).`,
);
