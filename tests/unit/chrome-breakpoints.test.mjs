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
  "src/layouts/IntlLayout.astro": [561, 720, 760, 980],
  "src/components/intl/CityNav.astro": [],
  "src/components/intl/IntlProductNav.astro": [],
  "src/styles/megamenu.css": [720],
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

test("the MobileBar's picker-ancestor rules create no containing block for the sheet", () => {
  const abs = join(ROOT, "src/components/chrome/MobileBar.astro");
  if (!existsSync(abs)) return; // arrives in a later PR
  const css = readFileSync(abs, "utf8");
  // Only elements that ANCESTOR the LocalePicker matter — the bar root and the
  // actions wrapper it sits in. A transform/filter/animation/perspective or a
  // containing `contain`/`will-change` on either makes it the containing block
  // for the picker's position:fixed sheet and traps it. (The burger's own
  // transform is fine: the burger is not an ancestor of the picker.)
  const banned = /(backdrop-filter|filter|transform|animation|perspective|will-change|contain)\s*:/;
  for (const sel of ["\\.mbar", "\\.mbar-actions"]) {
    const re = new RegExp(sel + "\\s*\\{([^}]*)\\}", "g");
    for (const m of css.matchAll(re)) {
      assert.ok(
        !banned.test(m[1]),
        `MobileBar.astro: rule for ${sel.replace(/\\\\/g, "")} must not set a ` +
          `containing-block property (transform/filter/animation/…) — it would ` +
          `trap the region picker's position:fixed bottom sheet.\n  ${m[1].trim()}`,
      );
    }
  }
});
