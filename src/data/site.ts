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
    /** Street line incl. unit/level, e.g. "Level 1, 477 Pitt Street". */
    readonly street: string;
    /** Suburb — what Google and Australia Post call the locality. */
    readonly locality: string;
    /** Metro the suburb sits in; used for "Made in {city}" branding. */
    readonly city: string;
    readonly region: string;
    readonly postalCode: string;
    readonly country: string;
    readonly countryCode: string;
    readonly locale: string;
    /** Pin for LocalBusiness geo schema — match your Google Business Profile. */
    readonly geo: { readonly lat: number; readonly lng: number };
    readonly mapsUrl: string;
  };
  /** Company contact hours. Drives visible copy + OpeningHoursSpecification. */
  readonly hours: {
    readonly display: string;
    /** schema.org DayOfWeek names. */
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
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
  phone: { display: "+61 2 5504 1140", href: "tel:+61255041140" },
  email: { display: "hello@biteperk.com.au", href: "mailto:hello@biteperk.com.au" },
  vocotableUrl: "https://vocotable.biteperk.com.au",
  abn: "TODO",
  address: {
    street: "Level 1, 477 Pitt Street",
    locality: "Haymarket",
    city: "Sydney",
    region: "NSW",
    postalCode: "2000",
    country: "Australia",
    countryCode: "AU",
    locale: "en-AU",
    geo: { lat: -33.8806, lng: 151.2043 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Level%201%2C%20477%20Pitt%20Street%2C%20Haymarket%20NSW%202000",
  },
  hours: {
    display: "Mon–Fri, 9am–5pm AEST",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
  social: { linkedin: "https://www.linkedin.com/company/biteperk" },
  legalLastUpdated: "2026-05-28",
};
