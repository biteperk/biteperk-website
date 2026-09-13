/**
 * Site-wide navigation structures.
 *
 * Header dropdown reads `products` from `./products`; footer columns are
 * defined here so adding/removing a top-level page is a one-line edit.
 */

import { site } from "./site";
import { products, productUrl } from "./products";
import { liveSolutions, solutionPath } from "./solutions";
import { publishedCities, cityUrl } from "./cities";
import { u, stripBase } from "./locales";

export interface NavLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface NavColumn {
  readonly heading: string;
  readonly links: ReadonlyArray<NavLink>;
}

/**
 * Header navigation — the single source for the desktop centre links AND
 * the mobile menu's Company section (Products is separate: megamenu on
 * desktop + Solutions megamenu, their own sections on mobile).
 *
 * `activeMatch: "never"` is for hash links (the server can't see the
 * fragment, and lighting them by base path causes double-active states —
 * e.g. Pricing + the Products trigger both lit on /products/voxtable/).
 */
export interface HeaderNavLink extends NavLink {
  /** Render in the desktop centre cluster. Default true. */
  readonly desktop?: boolean;
  /** Render in the mobile menu. Default true. */
  readonly mobile?: boolean;
  readonly activeMatch?: "prefix" | "exact" | "never";
}

// Order is the Phase 1 IA — Products · Solutions (the two mega-menus, rendered
// before this list) · Resources · Pricing · Platform · About. This array is the
// ONLY definition: a parallel `nav-ia.ts` used to carry the target order,
// imported by nothing, and disagreed with what rendered.
export const headerNav: ReadonlyArray<HeaderNavLink> = [
  { label: "Resources", href: u("/resources/") },
  { label: "Pricing", href: u("/products/voxtable/#pricing"), activeMatch: "never" },
  { label: "Platform", href: u("/platform/") },
  { label: "How it works", href: u("/technology/"), desktop: false },
  { label: "About", href: u("/about/") },
  // Desktop-hidden: Contact is already reachable from the visible phone
  // number, the "Book a demo" CTA (→ /contact/), and the footer. Keeping it
  // out of the centre cluster lets the remaining links + the phone number
  // breathe. Still shown in the mobile menu.
  { label: "Contact", href: u("/contact/"), desktop: false },
];

/** Shared active-state rule for header links (used by Nav + MobileMenu).
 * Base-agnostic: strips the locale base from both the current pathname and the
 * (now base-prefixed) link href so matching works under /au-en. */
export function isNavActive(pathname: string, link: HeaderNavLink): boolean {
  if (link.activeMatch === "never" || link.href.includes("#")) return false;
  const norm = (s: string) => (stripBase(s).replace(/\/$/, "") || "/");
  const path = norm(pathname);
  const target = norm(link.href);
  if (link.activeMatch === "exact") return path === target;
  return path === target || path.startsWith(target + "/");
}

export const productNavLinks: ReadonlyArray<NavLink> = products.map((p) => ({
  label: p.name,
  href: productUrl(p),
}));

export const footerColumns: ReadonlyArray<NavColumn> = [
  {
    heading: "Products",
    links: products.map((p) => ({ label: p.name, href: productUrl(p) })),
  },
  {
    heading: "Solutions",
    links: [
      { label: "All solutions", href: u("/solutions/") },
      ...liveSolutions().map((s) => ({ label: s.name, href: u(solutionPath(s.slug)) })),
    ],
  },
  {
    heading: "Locations",
    links: publishedCities.map((c) => ({
      label: `AI for ${c.name} restaurants`,
      href: cityUrl(c),
    })),
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: u("/about/") },
      { label: "Platform", href: u("/platform/") },
      { label: "How it works", href: u("/technology/") },
      { label: "Resources", href: u("/resources/") },
      { label: "Contact", href: u("/contact/") },
      { label: "Careers", href: site.email.href },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: u("/legal/privacy/") },
      { label: "Terms", href: u("/legal/terms/") },
    ],
  },
  {
    heading: "Get in touch",
    links: [
      { label: site.phone.display, href: site.phone.href },
      { label: site.email.display, href: site.email.href },
      { label: "biteperk.com.au", href: site.url, external: true },
    ],
  },
];
