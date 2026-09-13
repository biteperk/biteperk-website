/**
 * The international chrome's navigation list — the SSOT for what appears in
 * the `<nav class="intl-links">` bar and, with the legal entries appended, in
 * the intl footer.
 *
 * It exists because the list previously lived only as markup in
 * IntlLayout.astro, which meant the device test could not do better than
 * restate the count (`toHaveCount(4)`) with a comment reminding whoever
 * changed the nav to come back and edit the number. That comment had already
 * been wrong once — the bar went 3 → 4 when the product tree shipped — and a
 * test that has to be manually re-synced is a test that will eventually
 * assert the old truth.
 *
 * `key` indexes ChromeCopy["nav"], so the label is always the locale's own;
 * `path` is base-less and gets the locale base applied at render.
 */
import type { ChromeCopy } from "./copy";

export type IntlNavItem = {
  key: Exclude<keyof ChromeCopy["nav"], "home">;
  path: string;
};

export const INTL_NAV: readonly IntlNavItem[] = [
  { key: "products", path: "products" },
  { key: "solutions", path: "solutions" },
  { key: "resources", path: "resources" },
  { key: "howItWorks", path: "how-it-works" },
  { key: "about", path: "about" },
  { key: "contact", path: "contact" },
];
