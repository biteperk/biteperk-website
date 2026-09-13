#!/usr/bin/env node
/**
 * Title-template gate — city pages in one tree must not share a <title> or
 * hero-h1 SHAPE.
 *
 * Why this exists: on 13 Sep 2026 all eleven French city pages carried one
 * title template, "Répondeur téléphonique IA pour les restaurants {gentilé} —
 * Vox par BitePerk" — eleven near-identical <title>s in a single tree, the
 * exact pattern a doorway-page classifier looks for, on the field it weighs
 * most. check-cities scores `intro` + `aiLocal` for similarity and never
 * looked at the title; this gate does. (It also carried the wrong word:
 * "répondeur" is an answering machine — the thing the product replaces.)
 *
 * Method: for every published city in a tree, take seoTitle and heroHeadline,
 * lower-case, strip accents, drop the city name and any token that starts with
 * the city name's first three letters (the gentilé: parisien, lyonnais,
 * bruxellois…), collapse to a token shape. Three or more cities in one tree
 * with the same shape fail — two may legitimately rhyme; three is a template.
 *
 * Reads SOURCE (cities.ts / intl/cities.ts) like check-cities, so it needs no
 * build and runs on both targets. Fault-inject: give three cities the same
 * seoTitle apart from the city name → exit 1.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const IS_GLOBAL = process.env.BUILD_TARGET === "global";

const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function shape(text, cityName) {
  const city = fold(cityName);
  const stem = city.slice(0, 3);
  return fold(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w !== city && !w.startsWith(stem))
    .join(" ");
}

let failed = 0;
const trees = new Map(); // tree label → [{name, title, h1}]
if (IS_GLOBAL) {
  const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));
  for (const c of intlCities.filter((x) => x.published)) {
    if (!trees.has(c.base)) trees.set(c.base, []);
    trees.get(c.base).push({ name: c.name, title: c.seoTitle, h1: c.heroHeadline });
  }
} else {
  const { publishedCities } = await loadTS(join(ROOT, "src/data/cities.ts"));
  trees.set("/au-en", publishedCities.map((c) => ({ name: c.name, title: c.seoTitle ?? c.title ?? "", h1: c.heroHeadline ?? c.h1 ?? "" })));
}

for (const [tree, cities] of trees) {
  const before = failed;
  for (const field of ["title", "h1"]) {
    const groups = new Map();
    for (const c of cities) {
      const sh = shape(c[field] ?? "", c.name);
      if (!sh) continue;
      if (!groups.has(sh)) groups.set(sh, []);
      groups.get(sh).push(c.name);
    }
    for (const [sh, names] of groups) {
      if (names.length >= 3) {
        failed++;
        console.error(`FAIL  ${tree} ${field}: ${names.length} cities share one template — "${sh}" (${names.join(", ")})`);
      }
    }
  }
  if (failed === before) console.log(`ok    ${tree}: ${cities.length} cities, no shared title/h1 template`);
}

if (failed) { console.error(`\ncheck-title-templates: ${failed} shared template(s)`); process.exit(1); }
console.log("check-title-templates: ok");
