/**
 * Contract tests for the /gb-en photo upgrade (PR 1).
 *
 * Why this file exists: before this, all eight UK city pages shared ONE
 * hospitality photo (`bar-brass-evening`), which was also the home band — a
 * templated look on the market's front doors, and a slug that broke the image
 * weight budget (172KB/352KB) while only the cityscape was capped. PR 1 gave
 * every UK city its own storyImage and a lighter home-band shot. Nothing in
 * TypeScript or the parity test stops those slugs regressing to a shared
 * frame, a missing variant, or a heavy export, so this test pins:
 *   - eight published gb-en cities, each with a DISTINCT storyImage,
 *   - no storyImage collides with its own cityscape, the home band or the hero,
 *   - every referenced slug has all nine variants on disk plus an LQIP,
 *   - alts are present, sanely bounded, and carry no NAP-banned words.
 *
 * Run: node --test tests/unit/  (wired into gates:au and gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, statSync } from "node:fs";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));
const { marketContent } = await loadTS(join(ROOT, "src/data/intl/markets.ts"));
const placeholders = (
  await import(join(ROOT, "src/data/image-placeholders.json"), { with: { type: "json" } })
).default;

const gb = marketContent["/gb-en"];
const ukCities = intlCities.filter((c) => c.base === "/gb-en" && c.published);
const WIDTHS = [768, 1280, 1920];
const FORMATS = ["avif", "webp", "jpg"];
// Same caps check-cities enforces on disk; asserted here too so a heavy export
// fails in the fast unit run, not only in the gate step.
const AVIF_CAP = { 768: 120_000, 1280: 280_000 };
// check-truthful bans these words anywhere on a global page; a storyImage alt
// ships into the HTML, so guard the alt text here as well.
const BANNED = /haymarket|elizabeth street|477 pitt|surry hills/i;

const variants = (slug) =>
  WIDTHS.flatMap((w) => FORMATS.map((f) => `public/images/${slug}-${w}.${f}`));

test("gb-en emits the eight published UK cities", () => {
  assert.equal(ukCities.length, 8, "expected 8 published gb-en cities");
});

test("every UK city storyImage is distinct from the others", () => {
  const stories = ukCities.map((c) => c.storyImage);
  assert.equal(new Set(stories).size, stories.length, `duplicate storyImage: ${stories.join(", ")}`);
});

test("no storyImage collides with its cityscape, the home band or the hero", () => {
  const bandSlug = gb.media?.hospitality?.slug;
  const heroSlug = gb.hero?.slug;
  assert.ok(bandSlug && heroSlug, "gb-en must define a media band and a hero");
  for (const c of ukCities) {
    assert.notEqual(c.storyImage, c.cityscapeImage, `${c.slug}: storyImage == cityscape`);
    assert.notEqual(c.storyImage, bandSlug, `${c.slug}: storyImage reuses the home band`);
    assert.notEqual(c.storyImage, heroSlug, `${c.slug}: storyImage reuses the hero`);
  }
});

test("every referenced UK slug has all nine variants, within the AVIF caps, with an LQIP", () => {
  const slugs = [...new Set([...ukCities.map((c) => c.storyImage), gb.media.hospitality.slug])];
  for (const slug of slugs) {
    for (const rel of variants(slug))
      assert.ok(existsSync(join(ROOT, rel)), `missing variant ${rel}`);
    for (const w of [768, 1280]) {
      const bytes = statSync(join(ROOT, `public/images/${slug}-${w}.avif`)).size;
      assert.ok(bytes <= AVIF_CAP[w], `${slug}-${w}.avif is ${bytes}b (cap ${AVIF_CAP[w]}b)`);
    }
    assert.ok(placeholders[slug], `no LQIP in image-placeholders.json for ${slug}`);
  }
});

test("every UK storyImage alt is present, bounded and free of NAP-banned words", () => {
  for (const c of ukCities) {
    const alt = c.storyImageAlt;
    assert.ok(alt && alt.trim().length > 0, `${c.slug}: empty storyImageAlt`);
    assert.ok(alt.length <= 125, `${c.slug}: storyImageAlt is ${alt.length} chars (max 125)`);
    assert.ok(!BANNED.test(alt), `${c.slug}: storyImageAlt contains a NAP-banned word`);
  }
});
