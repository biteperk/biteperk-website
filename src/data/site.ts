/**
 * Single source of truth for site-wide brand + contact data.
 *
 * Every component imports from here. Changing a phone number or email is
 * a one-line edit, not a project-wide search-and-replace.
 *
 * Values marked `TODO` MUST be filled before the corresponding page
 * ships (see the launch checklist).
 *
 * Navigation arrays live in `./nav.ts`; products in `./products.ts`.
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
  /** ISO date string for "last updated" rendering on legal pages. */
  readonly legalLastUpdated: string;
};

export const site: SiteData = {
  name: "Biteperk",
  url: "https://biteperk.com.au",
  description:
    "Biteperk builds voice and AI tools for hospitality — starting with VocoTable, the AI phone host that answers every restaurant call in a warm Australian voice. Made in Sydney.",
  phone: { display: "0450 011 140", href: "tel:+61450011140" },
  email: { display: "hello@biteperk.com.au", href: "mailto:hello@biteperk.com.au" },
  vocotableUrl: "https://vocotable.biteperk.com.au",
  abn: "TODO",
  address: { city: "Sydney", country: "Australia", locale: "en-AU" },
  social: { linkedin: "https://www.linkedin.com/company/biteperk" },
  legalLastUpdated: "2026-05-28",
};
