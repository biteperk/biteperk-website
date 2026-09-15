/**
 * Shared mobile/tablet chrome — constants and prop contracts.
 *
 * SSOT for the compact-chrome breakpoint ladder used by BOTH trees. The AU
 * chrome (Nav.astro + the shared MobileBar/MobileDrawer) and the international
 * chrome (IntlLayout + the same shared components) hand over from their desktop
 * bar to the shared compact bar + drawer at exactly COMPACT_MAX. Before this
 * module the hand-off was 1180px on AU and 720px on intl, so a tablet visitor
 * got a hamburger on one tree and a full link bar on the other.
 *
 * CSS media queries cannot read custom properties, so the pixel literals still
 * live in each component's CSS — but tests/unit/chrome-breakpoints.test.mjs
 * imports the numbers here and asserts every @media width in the chrome file
 * set is derived from them (or on a per-file allowlist). Change a breakpoint =
 * change it here and in the CSS; the gate fails if they drift.
 */

/** ≤ this width → shared compact bar + drawer; ≥ COMPACT_MAX+1 → each tree's own desktop bar. */
export const COMPACT_MAX = 1180;

/** The compact bar shows its CTA from this width up; below it the CTA is the first drawer item. */
export const CTA_MIN = 400;

/** Compact bar content height in px (excludes env(safe-area-inset-top)). */
export const BAR_H_COMPACT = 56;

export type DrawerStatus = "live" | "in-development" | "concept";

export interface DrawerLink {
  readonly label: string;
  readonly href: string;
  readonly current?: boolean;
  /** Status pill shown at the row's trailing edge (products / solutions). */
  readonly pill?: { readonly text: string; readonly status: DrawerStatus };
  readonly dataCta?: string;
}

export interface DrawerSection {
  /** Stable hook for tests + styling: "products" | "solutions" | "pages" | "cities". */
  readonly id: string;
  readonly title: string;
  readonly lede?: string;
  /** "chips" = 2-up grid (cities); "list" = full-width rows (default). */
  readonly layout?: "list" | "chips";
  readonly links: readonly DrawerLink[];
  /** Trailing "See all →" style link. */
  readonly more?: DrawerLink;
}

export interface MobileBarCta {
  readonly label: string;
  readonly href: string;
  readonly dataCta: string;
}

export interface MobileBarProps {
  readonly homeHref: string;
  readonly brandLabel: string;
  readonly cta: MobileBarCta;
  /** Accessible name for the burger. */
  readonly menuLabel: string;
  /** Localised strings forwarded to LocalePicker. */
  readonly picker: { readonly title: string; readonly currentLabel: string; readonly closeLabel: string };
  /**
   * Render an in-flow spacer the height of the fixed bar. Intl pages pass this
   * because their layout previously relied on the sticky header contributing to
   * flow; AU pages clear the fixed bar with their own hero/section top padding.
   */
  readonly spacer?: boolean;
}

export interface MobileDrawerProps {
  readonly homeHref: string;
  readonly brandLabel: string;
  readonly closeLabel: string;
  readonly navLabel: string;
  readonly sections: readonly DrawerSection[];
  /** "Language & region" row: label + the current locale's spelled-out label. */
  readonly languageRegion: { readonly label: string; readonly current: string };
  readonly cta: MobileBarCta;
  readonly theme: { readonly label: string; readonly toLight: string; readonly toDark: string };
}
