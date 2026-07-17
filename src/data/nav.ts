/**
 * Site-wide navigation structures.
 *
 * Header dropdown reads `products` from `./products`; footer columns are
 * defined here so adding/removing a top-level page is a one-line edit.
 */

import { site } from "./site";
import { products, productUrl } from "./products";
import { publishedCities, cityUrl } from "./cities";

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
 * desktop, its own section on mobile).
 *
 * `activeMatch: "never"` is for hash links (the server can't see the
 * fragment, and lighting them by base path causes double-active states —
 * e.g. Pricing + the Products trigger both lit on /products/vocotable/).
 */
export interface HeaderNavLink extends NavLink {
  /** Render in the desktop centre cluster. Default true. */
  readonly desktop?: boolean;
  /** Render in the mobile menu. Default true. */
  readonly mobile?: boolean;
  readonly activeMatch?: "prefix" | "exact" | "never";
}

export const headerNav: ReadonlyArray<HeaderNavLink> = [
  { label: "Pricing", href: "/products/vocotable/#pricing", activeMatch: "never" },
  { label: "How it works", href: "/technology/" },
  { label: "Guides", href: "/blog/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

/** Shared active-state rule for header links (used by Nav + MobileMenu). */
export function isNavActive(pathname: string, link: HeaderNavLink): boolean {
  if (link.activeMatch === "never" || link.href.includes("#")) return false;
  const path = pathname.replace(/\/$/, "") || "/";
  const target = link.href.replace(/\/$/, "") || "/";
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
    heading: "Locations",
    links: publishedCities.map((c) => ({
      label: `AI for ${c.name} restaurants`,
      href: cityUrl(c),
    })),
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about/" },
      { label: "How it works", href: "/technology/" },
      { label: "Guides", href: "/blog/" },
      { label: "Contact", href: "/contact/" },
      { label: "Careers", href: site.email.href },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy/" },
      { label: "Terms", href: "/legal/terms/" },
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
