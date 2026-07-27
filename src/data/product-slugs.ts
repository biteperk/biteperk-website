/**
 * The product slugs, in catalogue order — the one list both the catalogue and
 * the international route tree derive from.
 *
 * Why this is its own module rather than a field on products.ts: products.ts
 * value-imports `u()` from locales.ts and calls it at MODULE SCOPE to build
 * hrefs. If locales.ts imported products.ts back to derive its route list, the
 * cycle would resolve with locales.ts half-initialised and `u()` would hit its
 * consts in the temporal dead zone — a build crash. This module imports
 * nothing, so both sides can depend on it safely.
 *
 * products.ts asserts at load that its catalogue matches this list exactly, so
 * adding a product in one place and not the other fails the build rather than
 * silently emitting a route with no page (or a page with no route).
 *
 * Unrelated to the same-named allowlist in functions/index.js — that one is the
 * Cloud Function's accepted form values and deliberately keeps the legacy voco
 * and perk slugs. (Not written as a glob pair: a star followed by a slash ends
 * a block comment, which has broken this repo's build three times in one day.)
 */
export const PRODUCT_SLUGS = ["voxtable", "voxorder", "voxconcierge", "voxdrive"] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];
