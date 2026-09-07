#!/usr/bin/env node
/**
 * French native-review sheet for CITY PAGES.
 *
 * `scripts/build/extract-fr-review.mjs` walks copy.ts / products.ts / markets.ts
 * (its FR_ROOTS) — it does NOT read the per-city French in src/data/intl/cities.ts.
 * So the hand-written city copy (intro, scenarios, faqs, aiLocal, seo, headline,
 * alts) is invisible to it. The Paris/Brussels-FR batch was reviewed from a
 * throwaway scratchpad script; this is that script, committed, so every French
 * city batch produces the same shape of review sheet and nothing depends on a
 * scratchpad that clears on session restart.
 *
 * City copy is original French with no English counterpart, so this is a
 * one-column sheet (French only) grouped by page — a native reader reads it for
 * idiom and tone. The machine checks (≥600 words, ≤35% similarity, banned
 * strings) are check-cities' job and are noted in the header, not re-run here.
 *
 * Usage:
 *   node scripts/build/extract-city-fr-review.mjs --out <file.md> [--slugs lyon,marseille,nice] [--title "..."]
 *
 * With no --slugs it lists every copyLang:"fr" city (published or staged). The
 * two market home-strip blocks and market band image alts (markets.ts /fr,
 * /be-fr) are always appended, since those are French too and change with a
 * photo swap.
 *
 * Filed sheets live in docs/ops-records/ and are never edited in place — a new
 * batch is a NEW dated file, exactly like extract-fr-review.mjs's filed docs.
 */
import { writeFileSync } from "node:fs";
import { loadTS } from "./_load-ts.mjs";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const out = arg("out");
if (!out) {
  console.error("--out <file.md> is required");
  process.exit(1);
}
const only = arg("slugs")?.split(",").map((s) => s.trim()).filter(Boolean);
const title = arg("title") ?? "French native review — city pages";

const { intlCities } = await loadTS("src/data/intl/cities.ts");
const markets = await loadTS("src/data/intl/markets.ts");
const mc = markets.marketContent ?? markets.default;

let fr = intlCities.filter((c) => c.copyLang === "fr");
if (only) fr = fr.filter((c) => only.includes(c.slug));
if (!fr.length) {
  console.error(`no French cities matched${only ? ` (--slugs ${only.join(",")})` : ""}`);
  process.exit(1);
}

const rows = [];
const add = (key, text) => rows.push({ key, text });

for (const c of fr) {
  const p = `${c.base}/${c.slug}`;
  add(`${p} · seoTitle`, c.seoTitle);
  add(`${p} · seoDescription`, c.seoDescription);
  add(`${p} · heroHeadline`, c.heroHeadline);
  c.intro.forEach((t, i) => add(`${p} · intro[${i}]`, t));
  add(`${p} · cityscapeImageAlt`, c.cityscapeImageAlt);
  add(`${p} · storyImageAlt`, c.storyImageAlt);
  c.scenarios.forEach((s, i) => {
    add(`${p} · scenarios[${i}].title`, s.title);
    add(`${p} · scenarios[${i}].body`, s.body);
  });
  c.faqs.forEach((f, i) => {
    add(`${p} · faqs[${i}].q`, f.q);
    add(`${p} · faqs[${i}].a`, f.a);
  });
  add(`${p} · aiLocal.lead`, c.aiLocal.lead);
  c.aiLocal.points.forEach((pt, i) => {
    add(`${p} · aiLocal.points[${i}].title`, pt.title);
    add(`${p} · aiLocal.points[${i}].body`, pt.body);
  });
}

// French market chrome that a photo swap or strip edit touches.
for (const base of ["/fr", "/be-fr"]) {
  const m = mc[base];
  if (!m) continue;
  if (m.cities)
    for (const k of ["eyebrow", "heading", "body"])
      add(`${base} · home cities.${k}`, m.cities[k]);
  if (m.media?.cityscape?.alt) add(`${base} · media cityscape alt`, m.media.cityscape.alt);
  if (m.media?.hospitality?.alt) add(`${base} · media hospitality alt`, m.media.hospitality.alt);
}

const esc = (s) => String(s).replace(/\|/g, "\\|");
const table = rows.map((r) => `| \`${r.key}\` | ${esc(r.text)} |`).join("\n");
const pages = fr.map((c) => `${c.base}/${c.slug}`).join(", ");

const doc = `# ${title}

- **Status:** ⏳ PENDING Ludovic's native pass — cities are staged \`published: false\`
  and must not flip live until this batch is signed off. When he passes it, change
  this line to the dated pass and note the medium (verbal/email), exactly as the
  other \`docs/ops-records/…-french-review-*\` sheets do.
- **Reviewer:** Ludovic (native French)
- **Pages:** ${pages}
- **Scope:** hand-written per-city French in \`src/data/intl/cities.ts\` plus the
  French market home-strip / image-alt strings in \`src/data/intl/markets.ts\`.
  New French written after any earlier filed review — a separate batch; earlier
  filed sheets and their byte-exact test are untouched.
- **Machine checks (check-cities, run separately):** ≥600 unique words per city;
  Paris↔all-French intro & aiLocal ≤35%; no banned strings (\`+33\`, AU NAP/phone/
  price, "notre équipe à …"). This sheet is the human question only: **native,
  idiomatic, on-brand French?**

## Strings (${rows.length})

| Key | French |
|---|---|
${table}
`;

writeFileSync(out, doc);
console.log(`wrote ${out} — ${rows.length} strings across ${fr.length} city page(s): ${pages}`);
