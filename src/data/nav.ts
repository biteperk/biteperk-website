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

export const primaryNav: ReadonlyArray<NavLink> = [
  { label: "Products", href: "/products/" },
  { label: "Guides", href: "/blog/" },
  { label: "Contact", href: "/contact/" },
];

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
