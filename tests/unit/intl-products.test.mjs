/**
 * Contract tests for the international PRODUCT copy (src/data/intl/products.ts)
 * and the per-product photo map (src/data/intl/page-images.ts).
 *
 * Why this file exists: intl-merge.test.mjs walks `resolveCopy()`, which is
 * copy.ts + markets.ts — the CopyBundle. Product prose lives in a different
 * module keyed `Record<string, …>`, so neither TypeScript nor the parity test
 * noticed a missing slug or English pasted into the French table. The only
 * guards were build-time crashes ([...intl].astro registry check, a TypeError
 * in the overview grid, llms-global, generate-og) — loud, but late. Adding
 * VoxStay (5 Sep 2026) is when this gap was found; this test closes it.
 *
 * Run: node --test tests/unit/  (wired into gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { PRODUCT_SLUGS } = await loadTS(join(ROOT, "src/data/product-slugs.ts"));
const { intlProducts, intlProductsOverview } = await loadTS(
  join(ROOT, "src/data/intl/products.ts"),
);
const { intlProductImages } = await loadTS(join(ROOT, "src/data/intl/page-images.ts"));

const LANGS = ["en", "fr"];
// Longest h1 that renders cleanly on the 1200×630 card at 80px with no Bella
// slot (buildGlobalCards, showBella:false). The longest shipped and
// pixel-reviewed today is 54 (FR VoxOrder) and it wraps to three lines with
// room to spare; satori grows the column rather than clipping, so a fourth
// line walks into the footer. The cap is a runaway guard — pixel-review
// anything near it rather than raising it.
const H1_MAX = 58;
// A French sentence, even a short alt with no accent in it, carries an article
// or preposition English does not. Accent presence alone rejected the real
// "Une commande remise au comptoir".
const FRENCH_WORD = /\b(?:une?|le|la|les|des|du|de|au|aux|sur|dans|pour|avec)\b/i;

const leaves = (v, path = "") =>
  typeof v === "string"
    ? [[path, v]]
    : Array.isArray(v)
      ? v.flatMap((x, i) => leaves(x, `${path}[${i}]`))
      : v && typeof v === "object"
        ? Object.entries(v).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k))
        : [];

test("intl products: every catalogue slug has copy in every language, and no extras", () => {
  for (const lang of LANGS) {
    const have = Object.keys(intlProducts[lang]).sort();
    assert.deepEqual(have, [...PRODUCT_SLUGS].sort(), `${lang}: intlProducts keys ≠ PRODUCT_SLUGS`);
    const caps = Object.keys(intlProductsOverview[lang].capabilities).sort();
    assert.deepEqual(caps, [...PRODUCT_SLUGS].sort(), `${lang}: overview.capabilities keys ≠ PRODUCT_SLUGS`);
  }
});

test("intl products: no empty copy anywhere", () => {
  for (const lang of LANGS) {
    for (const [path, v] of [
      ...leaves(intlProducts[lang], `intlProducts.${lang}`),
      ...leaves(intlProductsOverview[lang], `overview.${lang}`),
    ]) {
      assert.ok(v.trim().length > 0, `${path} is empty`);
    }
  }
});

test("intl products: French copy is French, not English left in place", () => {
  // Leaf-for-leaf: the FR table has the same shape as EN, and every FR string
  // longer than a label must differ from its EN counterpart. A slug pasted in
  // English "to fix later" fails here rather than shipping on /fr and /be-fr.
  const en = new Map(leaves(intlProducts.en));
  for (const [path, fr] of leaves(intlProducts.fr)) {
    const enV = en.get(path);
    assert.ok(enV !== undefined, `fr has ${path} but en does not`);
    // Short labels can legitimately coincide ("Concept" is French too); a
    // sentence cannot.
    if (fr.length > 12) assert.notEqual(fr, enV, `${path} is identical in EN and FR: "${fr}"`);
  }
  for (const slug of PRODUCT_SLUGS) {
    const cap = intlProductsOverview.fr.capabilities[slug];
    assert.notEqual(cap.outcome, intlProductsOverview.en.capabilities[slug].outcome, `${slug} FR outcome = EN`);
    assert.notEqual(cap.body, intlProductsOverview.en.capabilities[slug].body, `${slug} FR body = EN`);
  }
});

test("intl products: h1 fits the OG card in both languages", () => {
  for (const lang of LANGS) {
    for (const slug of PRODUCT_SLUGS) {
      const h1 = intlProducts[lang][slug].h1;
      assert.ok(h1.length <= H1_MAX, `${lang}/${slug} h1 is ${h1.length} chars (max ${H1_MAX}): "${h1}"`);
    }
    const oh1 = intlProductsOverview[lang].h1;
    assert.ok(oh1.length <= H1_MAX, `${lang} overview h1 is ${oh1.length} chars: "${oh1}"`);
  }
});

test("intl products: every product has a photo with a per-language alt", () => {
  for (const slug of PRODUCT_SLUGS) {
    const img = intlProductImages[slug];
    assert.ok(img, `${slug} has no intlProductImages entry — the photo block silently disappears`);
    assert.ok(img.slug && img.alt?.en && img.alt?.fr, `${slug} image missing slug or alt`);
    assert.match(img.alt.fr, FRENCH_WORD, `${slug} FR alt is not French: "${img.alt.fr}"`);
    assert.notEqual(img.alt.fr, img.alt.en, `${slug} FR alt = EN alt`);
  }
});
