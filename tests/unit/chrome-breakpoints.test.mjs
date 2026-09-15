/**
 * Chrome breakpoint gate — the compact bar/drawer hand-off is ONE number.
 *
 * Media queries cannot read CSS custom properties, so the pixel literals live
 * in each chrome component's CSS. This gate imports the numbers from
 * src/data/chrome.ts and asserts every @media WIDTH in the chrome file set is
 * derived from them ({COMPACT_MAX, COMPACT_MAX+1, CTA_MIN, CTA_MIN-1}) or on a
 * per-file allowlist of the pre-existing desktop/content tiers. A stray 720 or
 * 721 in a shared component — the exact drift that gave AU a 1180 hand-off and
 * intl a 720 one — fails the build.
 *
 * The allowlists shrink as the legacy files are unified: MobileMenu.astro and
 * IntlMobileMenu.astro are deleted, and IntlLayout/CityNav/IntlProductNav lose
 * their ≤720 sheet blocks, in the PRs that follow. When a file is deleted its
 * entry is simply skipped (existsSync).
 *
 * Also asserts the shared MobileBar carries no backdrop-filter / transform /
 * entrance animation: any of those makes the bar a containing block for the
 * region picker's position:fixed bottom sheet and traps it — a real bug this
 * grep is cheaper to catch than a browser test.
 *
 * Fault-inject before trusting: add `@media (max-width: 720px)` to
 * MobileBar.astro → this test fails.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const chrome = await loadTS(join(ROOT, "src/data/chrome.ts"));
const { COMPACT_MAX, CTA_MIN } = chrome;

// Numbers any chrome file may use without an allowlist entry.
const DERIVED = new Set([COMPACT_MAX, COMPACT_MAX + 1, CTA_MIN, CTA_MIN - 1]);

// Legacy desktop/content tiers that predate unification. Shrinks over the PR
// series; a file absent from disk is skipped.
const ALLOW = {
  "src/components/chrome/MobileBar.astro": [],
  "src/components/chrome/MobileDrawer.astro": [],
  "src/components/LocalePicker.astro": [],
  "src/components/Nav.astro": [1220, 1340, 1379],
  "src/layouts/IntlLayout.astro": [561, 720, 721, 760, 940, 980, 1080],
  "src/components/intl/CityNav.astro": [720, 721],
  "src/components/intl/IntlProductNav.astro": [721, 760, 940, 1080],
  "src/styles/megamenu.css": [720],
  "src/components/MobileMenu.astro": [768],
  "src/components/intl/IntlMobileMenu.astro": [721],
};

function mediaWidths(src) {
  const widths = [];
  for (const m of src.matchAll(/@media([^{]*)\{/g)) {
    for (const w of m[1].matchAll(/(?:max|min)-width\s*:\s*(\d+)px/g)) {
      widths.push(Number(w[1]));
    }
  }
  return widths;
}

test("every @media width in the chrome files is derived from chrome.ts or allowlisted", () => {
  for (const [rel, allow] of Object.entries(ALLOW)) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) continue;
    const allowed = new Set([...DERIVED, ...allow]);
    for (const w of mediaWidths(readFileSync(abs, "utf8"))) {
      assert.ok(
        allowed.has(w),
        `${rel}: @media width ${w}px is neither derived from chrome.ts ` +
          `(${[...DERIVED].sort((a, b) => a - b).join(", ")}) nor allowlisted ` +
          `(${allow.join(", ") || "none"}). Use COMPACT_MAX/CTA_MIN or add the tier to the allowlist.`,
      );
    }
  }
});

test("the shared MobileBar traps nothing — no backdrop-filter / transform / animation", () => {
  const abs = join(ROOT, "src/components/chrome/MobileBar.astro");
  if (!existsSync(abs)) return; // arrives in a later PR
  const css = readFileSync(abs, "utf8");
  // Only the <style> block matters, but the whole file is a safe superset.
  for (const banned of [/backdrop-filter\s*:/, /\btransform\s*:/, /\banimation\s*:/]) {
    assert.ok(
      !banned.test(css),
      `MobileBar.astro must not use ${banned} — it becomes the containing block ` +
        `for the region picker's position:fixed bottom sheet and traps it.`,
    );
  }
});
