/**
 * Phase 1E conversion system — Single Source of Truth.
 *
 * CTA hierarchy (AU commercial pages):
 *   Primary   → Book Demo
 *   Secondary → See How It Works
 * Phone + trust stay visible as support (hero trust line / ConversionTrust),
 * not as a competing primary CTA.
 *
 * Contact query continuity:
 *   ?intent=demo              — contact page reframes for demos
 *   &product=<slug>           — preselects product context when known
 */

import { u } from "./locales";
import { site } from "./site";

export type BookDemoOpts = {
  /** Product slug (voxtable, voxorder, …). */
  readonly product?: string;
};

/** App-absolute Book Demo URL (pass through as-is; already locale-prefixed via `u`). */
export function bookDemoHref(opts: BookDemoOpts = {}): string {
  const params = new URLSearchParams({ intent: "demo" });
  if (opts.product) params.set("product", opts.product);
  return u(`/contact/?${params.toString()}`);
}

/** Secondary CTA — technology / how-it-works explainer. */
export function howItWorksHref(): string {
  return u("/technology/");
}

export const CTA_LABELS = {
  bookDemo: "Book Demo",
  howItWorks: "See How It Works",
} as const;

/** Default bottom-of-page CTA actions for commercial AU pages. */
export function defaultCtaActions(opts: BookDemoOpts = {}): {
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
} {
  return {
    primary: { label: CTA_LABELS.bookDemo, href: bookDemoHref(opts) },
    secondary: { label: CTA_LABELS.howItWorks, href: howItWorksHref() },
  };
}

/** Compact trust copy used under heroes / above bottom CTAs. */
export const CONVERSION_TRUST = {
  line: "Australian-built voice AI for hospitality",
  phone: site.phone,
} as const;

/**
 * Soft checklist for tests / docs — what a commercial page should expose.
 * Not enforced at runtime; unit tests assert key templates import the SSOT.
 */
export const CONVERSION_PAGE_REQUIREMENTS = [
  "book-demo-cta",
  "contact-phone",
  "trust-indicator",
  "faq",
  "customer-story-when-data",
] as const;
