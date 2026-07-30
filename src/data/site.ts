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
  readonly voxtableUrl: string;
  /** ABN in the ATO's spaced display format — "36 700 831 303". */
  readonly abn: string;
  /** ABN digits only, for URLs and structured data. */
  readonly abnPlain: string;
  /** ACN in ASIC's spaced display format — "700 831 303". */
  readonly acn: string;
  /** ACN digits only, for structured data. */
  readonly acnPlain: string;
  /**
   * Public ABN Lookup record. Australians verify businesses here, so the
   * footer links the ABN straight to it — a claimed number proves nothing,
   * a one-click check does.
   */
  readonly abnLookupUrl: string;
  readonly address: {
    /** Street line incl. unit/level, e.g. "Level 1/457-459 Elizabeth Street". */
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
    "Biteperk builds voice and AI tools for hospitality — starting with VoxTable, the AI phone host that answers every restaurant call in a warm Australian voice. Made in Sydney.",
  phone: { display: "+61 2 5504 1140", href: "tel:+61255041140" },
  email: { display: "hello@biteperk.com.au", href: "mailto:hello@biteperk.com.au" },
  // NOTE (Vox rename, Jul 2026): the booking app still lives on the legacy
  // `vocotable.` subdomain. Do NOT change this URL until the app + DNS are
  // migrated to a `voxtable.` subdomain (then update the lychee exclude in
  // .github/workflows/web.yml too).
  voxtableUrl: "https://vocotable.biteperk.com.au",
  // Registered with ASIC 29 Jul 2026 (application 2607-PG-3124). The ABN
  // embeds the ACN — "36" + "700831303" — which is how every Australian
  // company's two identifiers relate. Both verified against their official
  // check-digit algorithms. Source of truth: asic/01-register/COMPANY_FACTS.md.
  //
  // Showing the ABN alone satisfies s1344 / ASIC RG 13 where the ACN would
  // otherwise be required, so the footer stays clean and shows one number.
  // The ACN is kept here for contracts, invoices and legal pages.
  abn: "36 700 831 303",
  abnPlain: "36700831303",
  acn: "700 831 303",
  acnPlain: "700831303",
  abnLookupUrl: "https://abr.business.gov.au/ABN/View?abn=36700831303",
  // Moved from Level 1, 477 Pitt St Haymarket → Surry Hills (28 Jul 2026,
  // confirmed by Sam; the rebuilt print collateral carried the new address
  // first). Format matches the print pieces byte-for-byte — "Level 1/457-459",
  // plain hyphen, "Street" spelled out. GBP and directory citations must use
  // this exact string when they are created (docs/directory-citations.md).
  address: {
    street: "Level 1/457-459 Elizabeth Street",
    locality: "Surry Hills",
    city: "Sydney",
    region: "NSW",
    postalCode: "2010",
    country: "Australia",
    countryCode: "AU",
    locale: "en-AU",
    // Block-level for 457-459 Elizabeth St; refine to the GBP pin once the
    // profile is verified.
    geo: { lat: -33.8886, lng: 151.2099 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Level%201%2F457-459%20Elizabeth%20Street%2C%20Surry%20Hills%20NSW%202010",
  },
  hours: {
    display: "Mon–Fri, 9am–5pm AEST",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
  social: { linkedin: "https://www.linkedin.com/company/biteperk" },
  legalLastUpdated: "2026-07-30",
};
