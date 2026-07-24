#!/usr/bin/env node
/**
 * Anti-doorway + integrity gate for the city-page engine.
 *
 * For every `published: true` city in src/data/cities.ts:
 *   1. Unique hand-written copy (intro + scenarios + faqs) ≥ 600 words.
 *   2. Cross-city intro similarity below threshold (4-word shingle overlap
 *      ≤ 35%) — catches "same paragraph, city name swapped" doorway copy.
 *   3. An OG card exists at public/og/<slug>.png.
 *   4. relatedGuides slugs exist in src/content/blog/.
 *
 * Runs in CI and locally: node scripts/gates/check-cities.mjs
 * cities.ts is transpiled with esbuild (already in the Astro dependency
 * tree) and imported as a data URL — no extra dependencies, no fragile
 * hand-rolled type stripping.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The city-page engine is an AU concept; the global (biteperk.com) build has no
// city pages, so this gate is AU-only.
if (process.env.BUILD_TARGET === "global") {
  console.log("check-cities: AU-only gate; skipped for the global build.");
  process.exit(0);
}

const { cities } = await loadTS(join(ROOT, "src/data/cities.ts"));

const words = (s) => s.split(/\s+/).filter(Boolean);
const shingles = (s, n = 4) => {
  const w = words(s.toLowerCase().replace(/[^a-z0-9\s]/g, ""));
  const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
};
const overlap = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const s of a) if (b.has(s)) hit++;
  return hit / Math.min(a.size, b.size);
};

const blogDir = join(ROOT, "src/content/blog");
const blogSlugs = new Set(
  readdirSync(blogDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""))
);

const published = cities.filter((c) => c.published);
let failed = 0;
const fail = (msg) => {
  failed++;
  console.error(`FAIL  ${msg}`);
};

const aiLocalText = (c) =>
  [c.aiLocal.lead, ...c.aiLocal.points.flatMap((p) => [p.title, p.body])].join(" ");

const cityText = (c) =>
  [
    ...c.intro,
    ...c.scenarios.flatMap((s) => [s.title, s.body]),
    ...c.faqs.flatMap((f) => [f.q, f.a]),
    aiLocalText(c),
  ].join(" ");

for (const c of published) {
  const count = words(cityText(c)).length;
  if (count < 600) fail(`${c.slug}: only ${count} words of unique copy (need ≥600)`);
  else console.log(`PASS  ${c.slug}: ${count} words`);

  if (!existsSync(join(ROOT, "public/og", `${c.slug}.png`)))
    fail(`${c.slug}: missing OG card public/og/${c.slug}.png`);

  for (const g of c.relatedGuides)
    if (!blogSlugs.has(g)) fail(`${c.slug}: relatedGuide "${g}" not found in src/content/blog/`);
}

// llms.txt must mention every published city page (AI-crawler surface).
const llms = readFileSync(join(ROOT, "public/llms.txt"), "utf8");
for (const c of published) {
  if (!llms.includes(`https://biteperk.com.au/${c.slug}/`))
    fail(`${c.slug}: not listed in public/llms.txt`);
}

// Pairwise similarity on the two fields most tempting to template: the
// intro and the AI-explainer (whose four topics are shared across cities,
// so the *copy* must stay genuinely per-city).
for (let i = 0; i < published.length; i++) {
  for (let j = i + 1; j < published.length; j++) {
    const a = published[i], b = published[j];
    const introSim = overlap(shingles(a.intro.join(" ")), shingles(b.intro.join(" ")));
    if (introSim > 0.35) fail(`${a.slug} ↔ ${b.slug}: intro similarity ${(introSim * 100).toFixed(0)}% (max 35%) — doorway risk`);
    else console.log(`PASS  ${a.slug} ↔ ${b.slug}: intro similarity ${(introSim * 100).toFixed(0)}%`);

    const aiSim = overlap(shingles(aiLocalText(a)), shingles(aiLocalText(b)));
    if (aiSim > 0.35) fail(`${a.slug} ↔ ${b.slug}: aiLocal similarity ${(aiSim * 100).toFixed(0)}% (max 35%) — doorway risk`);
    else console.log(`PASS  ${a.slug} ↔ ${b.slug}: aiLocal similarity ${(aiSim * 100).toFixed(0)}%`);
  }
}

if (failed) {
  console.error(`\ncheck-cities: ${failed} failure(s).`);
  process.exit(1);
}
console.log(`\ncheck-cities: ${published.length} published cities pass all gates.`);
