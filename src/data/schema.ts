/**
 * Shared schema.org (JSON-LD) nodes.
 *
 * The Organization and WebSite nodes describe the brand itself and are
 * identical on every page, so they live here once and are emitted as a
 * sitewide `@graph` by Base.astro. Page-specific nodes (BreadcrumbList,
 * FAQPage, Article, SoftwareApplication, Service…) are built on the page
 * and reference these by `@id`:
 *
 *   publisher: { "@id": ORG_ID }
 *   isPartOf:  { "@id": WEBSITE_ID }
 *
 * Stable @ids let Google merge the nodes into one knowledge graph instead
 * of treating each page's copy as a separate entity.
 *
 * Cross-domain (international architecture — PLAN.md §6b): the Organization
 * `@id` is SHARED, anchored to the AU host, on BOTH the biteperk.com.au and
 * biteperk.com builds — that's precisely how Google merges the two properties
 * into one company entity. The AU build emits the full LocalBusiness (NAP, geo,
 * hours, areaServed); the global build emits Organization only — the local
 * entity is Australia's. Nothing here changes the AU build's output.
 */
import { site } from "./site";
import { publishedCities } from "./cities";
import { AU_HOME, CCTLDS, abs, currentTarget } from "./locales";

// Organization @id is anchored to the AU home (biteperk.com/au-en) and SHARED
// across every build (au + en + fr) — that's how Google merges the properties
// into one company entity.
export const ORG_ID = `${AU_HOME}/#organization`;
// The WebSite node for the property this build emits.
export const WEBSITE_ID = `${abs("/")}#website`;
/** Stable @id for the one Vox product (shared identity, AU-anchored). */
export const VOX_ID = `${AU_HOME}/products/#vox`;
/** Stable @id for a per-capability SoftwareApplication "edition" of Vox. */
export const voxEditionId = (slug: string) => `${AU_HOME}/products/${slug}/#software`;

const telephone = site.phone.href.replace("tel:", "");
const email = site.email.href.replace("mailto:", "");

const IS_GLOBAL = currentTarget() === "global";

/**
 * Company registration identifiers.
 *
 * `taxID` carries the ABN — the number Australians actually recognise and the
 * one the ATO requires on tax invoices. Both numbers are ALSO emitted as
 * labelled PropertyValues, because a bare 11-digit string tells a consumer
 * nothing about whether it's an ABN, an ACN or a phone number.
 *
 * Emitted on BOTH builds, unlike `telephone`: an ABN is a fact about the legal
 * entity, true in Paris as much as in Sydney. `legalName` is already global for
 * exactly the same reason. The published phone line is an AU market fact; this
 * is not.
 */
const LEGAL_IDENTIFIERS = {
  taxID: site.abn,
  identifier: [
    { "@type": "PropertyValue" as const, propertyID: "ABN", value: site.abnPlain },
    { "@type": "PropertyValue" as const, propertyID: "ACN", value: site.acnPlain },
  ],
};

const KNOWS_ABOUT = [
  "Restaurant phone answering",
  "AI receptionist for restaurants",
  "Voice AI for hospitality",
  "Restaurant booking automation",
];

/**
 * The company. Typed as both Organization and LocalBusiness so Google can
 * treat Biteperk as a real, physically-located business (Surry Hills) AND as
 * the brand/publisher behind the site. Full NAP + geo + hours + priceRange
 * are what let it anchor local results and a knowledge panel.
 *
 * AU build only — the local entity belongs to Australia.
 */
const auOrganizationNode = {
  "@type": ["Organization", "LocalBusiness"],
  "@id": ORG_ID,
  name: site.name,
  legalName: "Biteperk Pty Ltd",
  ...LEGAL_IDENTIFIERS,
  url: AU_HOME,
  logo: {
    "@type": "ImageObject",
    // Google requires a raster ≥112×112 for logo rich results — never the SVG
    // favicon. Regenerate with `npm run brand`.
    url: `${AU_HOME}/brand/biteperk-mark-512.png`,
  },
  image: `${AU_HOME}/og/home.png`,
  description: site.description,
  email,
  telephone,
  priceRange: "$$",
  currenciesAccepted: "AUD",
  // The ABN Lookup record is the government's own page for this entity —
  // exactly what sameAs is for: an authoritative URL that unambiguously
  // identifies the item. It anchors the brand to a verifiable legal person.
  sameAs: [site.social.linkedin, site.abnLookupUrl],
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.countryCode,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: site.address.geo.lat,
    longitude: site.address.geo.lng,
  },
  hasMap: site.address.mapsUrl,
  // Country-wide service + the cities we actively target with landing pages.
  // The NAP above stays the single real Surry Hills address — cities are
  // served markets, never fake premises.
  areaServed: [
    { "@type": "Country", name: "Australia" },
    ...publishedCities.map((c) => ({
      "@type": "City" as const,
      name: c.name,
      containedInPlace: { "@type": "State" as const, name: c.stateName },
    })),
  ],
  knowsAbout: KNOWS_ABOUT,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...site.hours.days],
      opens: site.hours.opens,
      closes: site.hours.closes,
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone,
      email,
      contactType: "customer service",
      areaServed: "AU",
      availableLanguage: ["en-AU"],
    },
  ],
};

/**
 * The company as brand/publisher only — NO LocalBusiness, NAP, geo, hours or
 * areaServed (those are Australia's local entity). Same shared @id merges it
 * with the AU node; `sameAs` lists both properties so Google links them.
 *
 * Global (biteperk.com) build only.
 */
const globalOrganizationNode = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: site.name,
  legalName: "Biteperk Pty Ltd",
  ...LEGAL_IDENTIFIERS,
  url: AU_HOME,
  logo: {
    "@type": "ImageObject",
    // Google requires a raster ≥112×112 for logo rich results — never the SVG
    // favicon. Regenerate with `npm run brand`.
    url: `${AU_HOME}/brand/biteperk-mark-512.png`,
  },
  image: `${AU_HOME}/og/home.png`,
  description: site.description,
  email,
  // NO telephone: the published line is an AU fact (Europe-truthful, PLAN.md
  // §8). It shipped here unnoticed until check-truthful started sweeping the
  // built HTML — structured data is part of the page. International contact
  // is email-only until local numbers exist.
  // Every ccTLD front door (com.au, uk, fr, be — derived from locales.ts) +
  // the canonical AU home: each 301s into biteperk.com, and listing them here
  // tells Google every front door belongs to the one BitePerk org.
  sameAs: [site.social.linkedin, ...CCTLDS, AU_HOME],
  knowsAbout: KNOWS_ABOUT,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email,
      contactType: "customer service",
      availableLanguage: ["en", "fr"],
    },
  ],
};

export const organizationNode = IS_GLOBAL ? globalOrganizationNode : auOrganizationNode;

/**
 * The website as an entity — lets the brand own its name in search. Per-host.
 *
 * `inLanguage` is a property of the SITE, not the page: biteperk.com serves
 * English and French, so it declares both. It previously claimed "en" flat,
 * which asserted the French trees were English.
 */
export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: abs("/"),
  name: site.name,
  description: site.description,
  inLanguage: IS_GLOBAL ? ["en", "fr"] : "en-AU",
  publisher: { "@id": ORG_ID },
};

/** Sitewide graph emitted once per page by Base.astro. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [organizationNode, websiteNode],
};

/**
 * Build a FAQPage node for a page that carries its own Q&A list. `isPartOf`
 * links it to the sitewide WebSite by @id so Google merges it into the one
 * entity graph (same pattern the page-level BreadcrumbList/Article nodes use).
 *
 * The page emits the returned object as JSON-LD via the Base `jsonld` slot.
 */
export function buildFaqPage(
  faqs: ReadonlyArray<{ readonly q: string; readonly a: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Build the Vox SoftwareApplication node for the /products overview.
 *
 * Vox is ONE product. This single node — as opposed to the four per-capability
 * SoftwareApplication nodes on the /products/<slug>/ pages — is what tells
 * Google the brand sells one product (with capabilities), not four. Linked to
 * the Organization (publisher) and WebSite (isPartOf) by @id so it merges into
 * the one sitewide entity graph.
 *
 * `offers` is derived only from real prices passed in by the page (the live
 * capability's tiers) — never fabricated. `featureList` should list live
 * features only, so the structured data doesn't overpromise unshipped work.
 */
export function buildVoxApplication(opts: {
  readonly description: string;
  readonly featureList: ReadonlyArray<string>;
  /** Numeric AUD prices already parsed from the live capability's tiers. */
  readonly prices?: ReadonlyArray<number>;
  /** @ids of the per-capability "edition" nodes (build with `voxEditionId(slug)`). */
  readonly editionIds?: ReadonlyArray<string>;
}) {
  const priced = (opts.prices ?? []).filter((n) => Number.isFinite(n) && n > 0);
  const parts = opts.editionIds ?? [];
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": VOX_ID,
    name: "Vox",
    url: `${AU_HOME}/products/`,
    // The live app runs on the product subdomain — declare it as the same
    // entity's other home so the two properties consolidate into one.
    sameAs: [site.voxtableUrl],
    description: opts.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Phone",
    featureList: [...opts.featureList],
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(parts.length > 0 ? { hasPart: parts.map((id) => ({ "@id": id })) } : {}),
    ...(priced.length > 0
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "AUD",
            lowPrice: Math.min(...priced).toString(),
            highPrice: Math.max(...priced).toString(),
            offerCount: priced.length.toString(),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}
