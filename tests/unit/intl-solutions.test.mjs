/**
 * Contract tests for the international SOLUTION copy (src/data/intl/solutions.ts)
 * — the same guards intl-products.test.mjs gives the product copy: every
 * renderable vertical has prose in every language and no extras, nothing is
 * empty, the French is French, the h1 fits the OG card, every vertical has a
 * photo, and nothing here makes a claim the Europe-truthful rules ban.
 *
 * Run: node --test tests/unit/  (gates:au and gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { renderableSolutions, SOLUTION_SLUGS } = await loadTS(join(ROOT, "src/data/solutions.ts"));
const { intlSolutions, intlSolutionsOverview } = await loadTS(join(ROOT, "src/data/intl/solutions.ts"));
const { intlSolutionImages } = await loadTS(join(ROOT, "src/data/intl/page-images.ts"));
const LANGS = ["en", "fr"];
const H1_MAX = 80;
const FRENCH_WORD = /\b(?:une?|le|la|les|des|du|de|au|aux|en|et|sur|dans|pour|avec|chaque|votre|vos|vous|nous|ce|qui|que|est|pas|plus|sans|par|son|sa|ses|à)\b|[àâçéèêëîïôûùüÿœ]/i;
const leaves = (v, path = "") =>
  typeof v === "string" ? [[path, v]] : Array.isArray(v) ? v.flatMap((x, i) => leaves(x, `${path}[${i}]`)) : v && typeof v === "object" ? Object.entries(v).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k)) : [];

test("intl solutions: every renderable slug has copy in every language, and no extras", () => {
  const want = renderableSolutions().map((s) => s.slug).sort();
  for (const lang of LANGS) assert.deepEqual(Object.keys(intlSolutions[lang]).sort(), want, `${lang}`);
  assert.deepEqual(want, [...SOLUTION_SLUGS].sort(), "every solution is renderable today");
});

test("intl solutions: no empty copy, 3 lost points, ≥2 FAQs, ≥3 steps and features", () => {
  for (const lang of LANGS) {
    for (const [slug, copy] of Object.entries(intlSolutions[lang])) {
      for (const [path, v] of leaves(copy)) assert.ok(v.trim(), `${lang}.${slug}.${path} is empty`);
      assert.equal(copy.lostPoints.length, 3, `${lang}.${slug}: lostPoints`);
      assert.ok(copy.faqs.length >= 2 && copy.steps.length >= 3 && copy.features.length >= 3, `${lang}.${slug}: shape`);
    }
    for (const [path, v] of leaves(intlSolutionsOverview[lang])) assert.ok(v.trim(), `${lang}.overview.${path} is empty`);
  }
});

test("intl solutions: French is French and differs from the English", () => {
  for (const slug of Object.keys(intlSolutions.en)) {
    const en = Object.fromEntries(leaves(intlSolutions.en[slug]));
    for (const [path, v] of leaves(intlSolutions.fr[slug])) {
      if (v.length > 30) {
        assert.notEqual(v, en[path], `fr.${slug}.${path} is the English`);
        assert.match(v, FRENCH_WORD, `fr.${slug}.${path} carries no French function word: "${v.slice(0, 60)}"`);
      }
    }
  }
});

test("intl solutions: h1 fits the OG card; every vertical has a photo", () => {
  for (const lang of LANGS) for (const [slug, copy] of Object.entries(intlSolutions[lang])) {
    assert.ok(copy.h1.length <= H1_MAX, `${lang}.${slug}: h1 ${copy.h1.length} chars`);
    assert.ok(intlSolutionImages[slug]?.slug, `${slug}: no photo`);
  }
});

test("intl solutions: Europe-truthful — no price, no AU facts, no certification, no EU-hosting, no human-oversight, no PMS names", () => {
  const banned = [/\$\s?\d/, /\bAUD\b/, /\+61/, /Surry Hills|Elizabeth Street|Haymarket/i, /certif/i, /accredit/i, /hosted (in|on) (the EU|Europe|Paris)|héberg\w* (à Paris|dans l['’]UE|en Europe)/i, /human (oversight|supervision)|supervision humaine/i, /\b(Mews|Opera|Cloudbeds|SiteMinder)\b/, /our (London|Paris|Brussels|European) (team|office)|notre (bureau|équipe) (à|de) (Londres|Paris|Bruxelles)/i];
  for (const lang of LANGS) for (const [slug, copy] of Object.entries(intlSolutions[lang])) for (const [path, v] of leaves(copy)) for (const re of banned) assert.doesNotMatch(v, re, `${lang}.${slug}.${path}`);
});
