#!/usr/bin/env node
/**
 * Anti-doorway + integrity gate for the city-page engines — BOTH of them.
 *
 *   BUILD_TARGET=au      → src/data/cities.ts        (the AU engine)
 *   BUILD_TARGET=global  → src/data/intl/cities.ts   (the market engine)
 *
 * For every `published: true` city:
 *   1. Unique hand-written copy (intro + scenarios + faqs + aiLocal) ≥ 600 words.
 *   2. Pairwise similarity below threshold (4-word shingle overlap ≤ 35%) on the
 *      two fields most tempting to template — the intro and the AI explainer,
 *      whose topics are shared by design so the *wording* must not be.
 *   3. An OG card exists.
 *   4. relatedGuides resolve to real guides.
 *   5. The page is listed in the llms.txt that ships for that build.
 *
 * ── Why the global pass compares PER LANGUAGE, not per market ────────────────
 * Doorway copy leaks along the language seam, not the border. London (gb-en)
 * and Brussels-EN (be-en) are both English and both say "Vox is opening pilots
 * here"; London vs. Paris is already separated by being in different languages.
 * So the comparison pools are English = gb-en + be-en and French = fr + be-fr —
 * 6 cities each at full build-out, i.e. 15 pairs per language, 30 in total.
 * Comparing within a market instead would have left the riskiest pair unchecked.
 *
 * The global side is live and enforcing before a single market city exists, on
 * purpose: a similarity gate first exercised against 24 freshly-written pages
 * is a gate you will be tempted to loosen rather than trust.
 *
 * ── The similarity method lives in _similarity.mjs, not here ────────────────
 * This gate and check-intl-similarity.mjs share `words`/`shingles`/`overlap`
 * from that module. They did NOT until Jul 2026: each kept its own copy under
 * comments claiming they could not drift, and they had already drifted — the
 * copy here stripped accents (`l'équipe` → `lquipe`) and deleted punctuation
 * rather than substituting a space. That is precisely the tokenizer the shared
 * module documents as unsafe, and this is the gate that pools FRENCH cities.
 * It was latent only because intl/cities.ts is still empty. Do not re-inline
 * these primitives.
 *
 * Fault-inject before trusting: duplicate one city's intro onto another,
 * re-run, confirm exit 1. Run after a build (the global pass reads the
 * generated dist-global/llms.txt):
 *   node scripts/gates/check-cities.mjs
 *   BUILD_TARGET=global node scripts/gates/check-cities.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";
// Deliberately NOT importing `visibleText` alongside these: it exists to pull
// prose out of built HTML, and this gate measures SOURCE DATA (cities.ts), so
// there is no markup to strip. Importing it would imply a substrate this gate
// does not have.
import { words, shingles, overlap } from "./_similarity.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const IS_GLOBAL = process.env.BUILD_TARGET === "global";

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

/**
 * Pairwise intro + aiLocal similarity across one pool of cities.
 * `label` names the pool in output ("AU", "English", "French").
 */
function comparePool(label, pool, id) {
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i], b = pool[j];
      const pair = `${id(a)} ↔ ${id(b)}`;
      for (const [field, text] of [
        ["intro", (c) => c.intro.join(" ")],
        ["aiLocal", aiLocalText],
      ]) {
        const sim = overlap(shingles(text(a)), shingles(text(b)));
        const pct = (sim * 100).toFixed(0);
        if (sim > 0.35) fail(`[${label}] ${pair}: ${field} similarity ${pct}% (max 35%) — doorway risk`);
        else console.log(`PASS  [${label}] ${pair}: ${field} similarity ${pct}%`);
      }
    }
  }
}

/** Shared per-city checks: word count, OG card, related guides. */
function checkCity(c, id, ogPath, guideSlugs, guidesLabel) {
  const count = words(cityText(c)).length;
  if (count < 600) fail(`${id}: only ${count} words of unique copy (need ≥600)`);
  else console.log(`PASS  ${id}: ${count} words`);

  if (!existsSync(join(ROOT, ogPath))) fail(`${id}: missing OG card ${ogPath}`);

  for (const g of c.relatedGuides)
    if (!guideSlugs.has(g)) fail(`${id}: relatedGuide "${g}" not found in ${guidesLabel}`);
}

const readSlugs = (dir) =>
  new Set(
    existsSync(dir)
      ? readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""))
      : [],
  );

// ── AU pass ──────────────────────────────────────────────────────────────────
if (!IS_GLOBAL) {
  const { cities } = await loadTS(join(ROOT, "src/data/cities.ts"));
  const published = cities.filter((c) => c.published);
  const guides = readSlugs(join(ROOT, "src/content/blog"));

  for (const c of published) checkCity(c, c.slug, `public/og/${c.slug}.png`, guides, "src/content/blog/");

  // dist/llms.txt is GENERATED (scripts/build/llms-au.mjs, derived from
  // cities.ts) — the file that ships, not a hand-kept public/ copy that
  // pointed every URL at the redirect-only .com.au host until 13 Sep 2026.
  const llmsPath = join(ROOT, "dist/llms.txt");
  if (!existsSync(llmsPath)) fail("dist/llms.txt missing — run npm run build (llms-au.mjs writes it)");
  const llms = existsSync(llmsPath) ? readFileSync(llmsPath, "utf8") : "";
  for (const c of published)
    if (!llms.includes(`https://biteperk.com/au-en/${c.slug}/`))
      fail(`${c.slug}: not listed in dist/llms.txt`);

  comparePool("AU", published, (c) => c.slug);

  if (failed) {
    console.error(`\ncheck-cities (au): ${failed} failure(s).`);
    process.exit(1);
  }
  console.log(`\ncheck-cities (au): ${published.length} published cities pass all gates.`);
  process.exit(0);
}

// ── Global pass ──────────────────────────────────────────────────────────────
const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));
const { locales } = await loadTS(join(ROOT, "src/data/locales.ts"));
const published = intlCities.filter((c) => c.published);
const byBase = new Map(locales.map((l) => [l.base, l]));

// Generated at build time, so this pass runs after `BUILD_TARGET=global npm run build`.
const LLMS = join(ROOT, "dist-global/llms.txt");
if (!existsSync(LLMS)) {
  console.error(`check-cities: ${LLMS} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}
const llms = readFileSync(LLMS, "utf8");

// The file that actually SHIPS is dist-site/llms.txt — merge-dist rebuilds the
// root llms.txt from the AU file + the global sections, and until 29 Jul 2026
// it dropped the global sections entirely: dist-global/llms.txt passed this
// gate while the deployed /llms.txt carried none of the city lines. Check the
// merged artifact whenever it exists (gates run before merge in build:site,
// so absence is fine — check-merged runs after; CI's gate step sees both).
const LLMS_MERGED = join(ROOT, "dist-site/llms.txt");
const llmsMerged = existsSync(LLMS_MERGED) ? readFileSync(LLMS_MERGED, "utf8") : null;

for (const c of published) {
  const id = `${c.base}/${c.slug}`;
  const locale = byBase.get(c.base);

  // A city whose base isn't a real global locale would silently emit nothing.
  if (!locale || locale.target !== "global") {
    fail(`${id}: base "${c.base}" is not a global locale in locales.ts`);
    continue;
  }
  if (locale.copyLang !== c.copyLang)
    fail(`${id}: copyLang "${c.copyLang}" contradicts locale ${c.base} (${locale.copyLang})`);

  // Same filename convention as the intl OG cards (/en keeps legacy names,
  // every other tree carries its base as a suffix) — scripts/brand/generate-og.mjs.
  const suffix = c.base === "/en" ? "" : `-${c.base.slice(1)}`;
  checkCity(
    c,
    id,
    `public/og/intl/${c.slug}${suffix}.png`,
    readSlugs(join(ROOT, `src/content/intl/${c.base.slice(1)}`)),
    `src/content/intl/${c.base.slice(1)}/`,
  );

  if (!llms.includes(`https://biteperk.com${c.base}/${c.slug}/`))
    fail(`${id}: not listed in dist-global/llms.txt (see scripts/build/llms-global.mjs)`);
  if (llmsMerged && !llmsMerged.includes(`https://biteperk.com${c.base}/${c.slug}/`))
    fail(`${id}: not listed in dist-site/llms.txt — merge-dist dropped the global sections`);
}

// Cityscape image-weight cap — the fast-on-weak-connections guardrail. The
// cityscape is a city's one unique establishing shot (also its card in the
// home strip and every other city's cross-link grid), so a heavy export
// multiplies across the tree. AVIF byte caps are loose enough that every shot
// graded to date passes (the current worst, london-skyline, is 79KB/203KB)
// and tight enough to fail a careless 300KB+ export. Enforced on disk here
// rather than as a Lighthouse aggregate: deterministic, and it fires in the
// gate step, before a bloated image can ever reach a perf run.
const AVIF_CAP = { 768: 120_000, 1280: 280_000 };
for (const c of published) {
  for (const w of [768, 1280]) {
    const rel = `public/images/${c.cityscapeImage}-${w}.avif`;
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) continue; // check-assets owns "must exist"; this owns "must be light"
    const bytes = statSync(abs).size;
    if (bytes > AVIF_CAP[w])
      fail(
        `${c.base}/${c.slug}: cityscape ${rel} is ${(bytes / 1024).toFixed(0)}KB ` +
          `(cap ${AVIF_CAP[w] / 1024}KB) — crop or blur it (fetch-images.mjs rect/params)`,
      );
  }
}

// The pools that matter: language, across markets.
for (const lang of ["en", "fr"]) {
  const pool = published.filter((c) => c.copyLang === lang);
  comparePool(lang === "en" ? "English" : "French", pool, (c) => `${c.base}/${c.slug}`);
}

if (failed) {
  console.error(`\ncheck-cities (global): ${failed} failure(s).`);
  process.exit(1);
}
console.log(
  `\ncheck-cities (global): ${published.length} published market cities pass all gates ` +
    `(${published.filter((c) => c.copyLang === "en").length} EN, ` +
    `${published.filter((c) => c.copyLang === "fr").length} FR).`,
);
