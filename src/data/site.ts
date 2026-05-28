/**
 * Single source of truth for site-wide data.
 *
 * Every component imports from here. Changing a phone number or email is
 * a one-line edit, not a project-wide search-and-replace.
 *
 * Values marked `TODO` MUST be filled before the corresponding page ships
 * (see plan, "Open questions to resolve before P1 ships").
 */

export type SiteData = {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly phone: { readonly display: string; readonly href: string };
  readonly email: { readonly display: string; readonly href: string };
  readonly vocotableUrl: string;
  readonly abn: string;
  readonly address: {
    readonly city: string;
    readonly country: string;
    readonly locale: string;
  };
  readonly social: { readonly linkedin: string };
};

export const site: SiteData = {
  name: "Biteperk",
  url: "https://biteperk.com.au",
  description:
    "Biteperk builds VocoTable, the AI phone host for restaurants. Bella answers every call 24/7 in a natural Australian voice and books the table. Made in Sydney.",
  phone: { display: "0450 011 140", href: "tel:+61450011140" },
  email: { display: "hello@biteperk.com.au", href: "mailto:hello@biteperk.com.au" },
  vocotableUrl: "https://vocotable.biteperk.com.au",
  abn: "TODO", // Required by APP before /legal/privacy ships
  address: { city: "Sydney", country: "Australia", locale: "en-AU" },
  social: { linkedin: "https://www.linkedin.com/company/biteperk" },
};

/**
 * Nav links rendered in `Nav.astro`. Order matters.
 * `external: true` adds rel="noopener" and target="_blank".
 */
export const navLinks: ReadonlyArray<{
  label: string;
  href: string;
  external?: boolean;
}> = [
  { label: "VocoTable", href: site.vocotableUrl, external: true },
  { label: "Contact", href: "/#contact" },
];
