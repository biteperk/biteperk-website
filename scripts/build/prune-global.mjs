#!/usr/bin/env node
/**
 * Tailor the GLOBAL build's dist-global/ down to the biteperk.com pages only.
 *
 * The global pass builds from the same src/pages, so the AU pages (home, cities,
 * products, blog, about, contact, technology, platform, legal, kitchen-sink)
 * also emit at the root. biteperk.com must NOT serve them — that's the exact
 * cross-domain duplication the whole architecture avoids — so we remove them,
 * leaving /en/, /fr/, the 404 and shared assets. The apex (/) 301s to /en/ via
 * the biteperk-global hosting config in firebase.json.
 *
 * Run after `BUILD_TARGET=global npm run build`, before the gates:
 *   node scripts/build/prune-global.mjs
 */
import { rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "./_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
if (!existsSync(DIST)) {
  console.error("prune-global: dist-global/ not found — run BUILD_TARGET=global npm run build first.");
  process.exit(1);
}

// AU static-page outputs (top-level) that must not appear on biteperk.com.
const STATIC = [
  "index.html", "about", "contact", "technology", "platform",
  "blog", "legal", "products", "kitchen-sink",
];

// AU city outputs — derived from cities.ts so the list can't drift.
const { cities } = await loadTS(join(ROOT, "src/data/cities.ts"));
const citySlugs = cities.filter((c) => c.published).map((c) => c.slug);

const remove = [...STATIC, ...citySlugs];
let removed = 0;
for (const name of remove) {
  const p = join(DIST, name);
  if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); removed++; }
}
console.log(`prune-global: removed ${removed} AU-only path(s) from dist-global; kept /en/, /fr/, 404, assets.`);
