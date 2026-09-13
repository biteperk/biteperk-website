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
  readonly social: readonly SocialProfile[];
  /** ISO date string for "last updated" rendering on legal pages. */
  readonly legalLastUpdated: string;
};

/**
 * One owned social profile.
 *
 * `visible` controls RENDERING only — every profile lands in the Organization
 * `sameAs` regardless. That split is deliberate: `sameAs` is how search engines
 * consolidate the brand entity across the web and costs nothing to state, while
 * a footer icon pointing at an empty profile is worse than no icon at all. So a
 * freshly-created account goes in the data the day it exists and gets its icon
 * the day it has content — a one-word edit, no schema churn.
 */
export type SocialProfile = {
  readonly network: "linkedin" | "youtube" | "facebook" | "instagram";
  /** Platform name, used to build the link's accessible name. */
  readonly label: string;
  readonly url: string;
  /** Shown beside the icons on the contact page. */
  readonly handle: string;
  readonly visible: boolean;
};

export const site: SiteData = {
  name: "Biteperk",
  url: "https://biteperk.com.au",
  description:
    "Biteperk builds voice and AI tools for hospitality — starting with VoxTable, the AI phone host that answers every restaurant call in a warm Australian voice. Made in Sydney.",
  phone: { display: "+61 2 5504 1140", href: "tel:+61255041140" },
  email: { display: "hello@biteperk.com.au", href: "mailto:hello@biteperk.com.au" },
  // Canonical dashboard host since the 25 Aug 2026 product-subdomain
  // decision (NAMES.md §2 in the voxtable repo). The legacy `vocotable.`
  // host still serves and redirects here. If this ever changes again,
  // update the lychee exclude in .github/workflows/web.yml with it.
  voxtableUrl: "https://voxtable.biteperk.com.au",
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
  // Array order is render order. Confirmed live 7 Aug 2026; the four accounts
  // were registered by the sales team and handed over by email.
  //
  // Instagram is `visible: false` because the account exists but is empty
  // (0 posts, 0 followers as at 7 Aug 2026). It is still in `sameAs` — see the
  // SocialProfile doc comment. Flip the flag the day it has content.
  social: [
    {
      network: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/biteperk",
      handle: "/company/biteperk",
      visible: true,
    },
    {
      network: "youtube",
      label: "YouTube",
      url: "https://www.youtube.com/@biteperk",
      handle: "@biteperk",
      visible: true,
    },
    {
      network: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/biteperk/",
      handle: "/biteperk",
      visible: true,
    },
    {
      network: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/biteperk/",
      handle: "@biteperk",
      visible: false,
    },
  ],
  legalLastUpdated: "2026-07-30",
};

/**
 * Profiles that get an icon in the footer and on the contact page.
 *
 * Never use this for `sameAs` — that takes the full `site.social` list.
 */
export const visibleSocial: readonly SocialProfile[] = site.social.filter((s) => s.visible);

/**
 * The two legal entities behind the site.
 *
 * `site` above stays SINGLE-ENTITY on purpose: dozens of call sites read
 * `site.address` / `site.abn` / `site.phone` and every one of them means the
 * Australian operating company. Reshaping it into a map would have touched all
 * of them to say the same thing. This is a sibling export instead — the UK
 * facts in one place, nothing else moved.
 *
 * `uk` is a REGISTERED OFFICE, not a premises. There is no UK staff, no UK
 * phone line and no VAT registration (the £90k threshold is a long way off for
 * a company incorporated 4 Aug 2026). Copy must never imply otherwise, and
 * check-truthful's `+44` ban plus its "our London office/team" ban both stay in
 * force precisely because none of that is true yet.
 *
 * Source of record is Companies House, never a third-party aggregator. Those
 * sites publish INFERRED size/turnover bands for companies that have filed no
 * accounts — Biteperk Ltd's first are not due until 4 May 2028 — and
 * republishing an inference as fact is what check-claims exists to stop.
 */
export type LegalEntity = {
  readonly legalName: string;
  /** Wording for the "registered in …" disclosure. */
  readonly placeOfRegistration: string;
  readonly registerLabel: string;
  readonly registerNumber: string;
  /** Public register record, so the number can be checked in one click. */
  readonly registerUrl: string;
  readonly office: {
    readonly street: string;
    readonly locality: string;
    readonly region: string;
    readonly postalCode: string;
    readonly country: string;
    readonly countryCode: string;
  };
};

export const entities = {
  au: {
    legalName: "Biteperk Pty Ltd",
    placeOfRegistration: "Australia",
    registerLabel: "ABN",
    registerNumber: site.abn,
    registerUrl: site.abnLookupUrl,
    office: {
      street: site.address.street,
      locality: site.address.locality,
      region: site.address.region,
      postalCode: site.address.postalCode,
      country: site.address.country,
      countryCode: site.address.countryCode,
    },
  },
  uk: {
    legalName: "Biteperk Ltd",
    placeOfRegistration: "England and Wales",
    registerLabel: "Company number",
    registerNumber: "17379647",
    registerUrl: "https://find-and-update.company-information.service.gov.uk/company/17379647",
    office: {
      street: "124 City Road",
      locality: "London",
      region: "England",
      postalCode: "EC1V 2NX",
      country: "United Kingdom",
      countryCode: "GB",
    },
  },
} as const satisfies Record<string, LegalEntity>;

/**
 * Contact address for the UK entity.
 *
 * Separate from `site.email` (the AU published address) because of two
 * independent rules that happen to point the same way: CLAUDE.md's
 * domain-by-audience rule puts international correspondence on `@biteperk.com`,
 * and the E-Commerce Regulations 2002 reg 6 require a service provider to give
 * "an electronic mail address" allowing rapid and direct communication — a
 * contact form alone does not satisfy it.
 *
 * Deliberately `sales@biteperk.com`, the address CLAUDE.md already documents as
 * the live rest-of-world identity, rather than a fresh `uk@`. Publishing an
 * address that has not been provisioned would defeat the very requirement this
 * exists to meet. Swap it for a dedicated UK mailbox here, in one place, once
 * one exists and is monitored.
 *
 * MUST be monitored. An unread address here is a compliance failure, not a
 * cosmetic one.
 */
export const ukEmail = {
  display: "sales@biteperk.com",
  href: "mailto:sales@biteperk.com",
} as const;

/**
 * The one <title> suffix. Every AU page title went through five hand-typed
 * variants ("· Biteperk", "· BitePerk", "— Biteperk", "Biteperk —"…) until
 * 13 Sep 2026; the wordmark is BitePerk (BRAND.md). Registries store the BARE
 * title; layouts wrap it here. `site.name` stays "Biteperk" for the
 * Organization node (a legal-name spelling, not the wordmark).
 */
export const BRAND = "BitePerk";
export function pageTitle(title: string): string {
  return `${title} · ${BRAND}`;
}
