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
 */
import { site } from "./site";

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

const telephone = site.phone.href.replace("tel:", "");
const email = site.email.href.replace("mailto:", "");

/** The company. Full NAP + geo + hours so it can anchor local results. */
export const organizationNode = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: site.name,
  legalName: "Biteperk Pty Ltd",
  url: site.url,
  logo: {
    "@type": "ImageObject",
    url: `${site.url}/favicon.svg`,
  },
  image: `${site.url}/og/home.png`,
  description: site.description,
  email,
  telephone,
  sameAs: [site.social.linkedin],
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
  areaServed: { "@type": "Country", name: "Australia" },
  knowsAbout: [
    "Restaurant phone answering",
    "AI receptionist for restaurants",
    "Voice AI for hospitality",
    "Restaurant booking automation",
  ],
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

/** The website as an entity — lets the brand own its name in search. */
export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: site.url,
  name: site.name,
  description: site.description,
  inLanguage: "en-AU",
  publisher: { "@id": ORG_ID },
};

/** Sitewide graph emitted once per page by Base.astro. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [organizationNode, websiteNode],
};
