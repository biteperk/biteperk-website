/**
 * Solutions catalogue — commercial-intent vertical pages (Phase 1C).
 *
 * People search “AI receptionist for restaurants”, not product names. This
 * registry is the SSOT for /solutions/{slug}/ once Wave 2 ships templates.
 *
 * Keep slugs stable: they become URL segments and Ads final URLs.
 */

export type SolutionPurpose = "traffic" | "trust" | "conversion";

export type SolutionSector = "hospitality" | "services" | "enterprise";

export type SolutionStatus = "planned" | "draft" | "live";

export type Solution = {
  readonly slug: string;
  readonly name: string;
  readonly sector: SolutionSector;
  /** Why this page exists — Principle 4. */
  readonly purposes: readonly SolutionPurpose[];
  readonly status: SolutionStatus;
  /** Primary product to emphasise on the page. */
  readonly primaryProduct: "voxtable" | "voxorder" | "voxstay" | "voxconcierge" | "voxdrive";
  readonly shortDescription: string;
};

export const SOLUTION_SLUGS = [
  "restaurants",
  "hotels",
  "cafes",
  "takeaway",
  "drive-thru",
  "medical",
  "professional-services",
  "enterprise",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export const solutions: readonly Solution[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "planned",
    primaryProduct: "voxtable",
    shortDescription: "AI phone host that answers booking calls during service.",
  },
  {
    slug: "hotels",
    name: "Hotels",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "planned",
    primaryProduct: "voxstay",
    shortDescription: "AI receptionist for independent hotels and small chains.",
  },
  {
    slug: "cafes",
    name: "Cafes",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "planned",
    primaryProduct: "voxtable",
    shortDescription: "Never miss a table or takeaway call in the morning rush.",
  },
  {
    slug: "takeaway",
    name: "Takeaway",
    sector: "hospitality",
    purposes: ["traffic", "conversion"],
    status: "planned",
    primaryProduct: "voxorder",
    shortDescription: "Phone ordering that keeps the pass moving.",
  },
  {
    slug: "drive-thru",
    name: "Drive-Thru",
    sector: "hospitality",
    purposes: ["traffic", "trust"],
    status: "planned",
    primaryProduct: "voxdrive",
    shortDescription: "Voice ordering for drive-thru lanes — in development story.",
  },
  {
    slug: "medical",
    name: "Medical",
    sector: "services",
    purposes: ["traffic", "trust"],
    status: "planned",
    primaryProduct: "voxconcierge",
    shortDescription: "After-hours and overflow call handling for clinics.",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    sector: "services",
    purposes: ["traffic", "conversion"],
    status: "planned",
    primaryProduct: "voxconcierge",
    shortDescription: "Front-desk phone coverage for firms that live on inbound calls.",
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    sector: "enterprise",
    purposes: ["trust", "conversion"],
    status: "planned",
    primaryProduct: "voxtable",
    shortDescription: "Multi-site voice automation with central visibility.",
  },
] as const;

/** Layout contract for every solution page (Phase 1C standard). */
export const SOLUTION_PAGE_SECTIONS = [
  "hero",
  "business-problem",
  "lost-revenue",
  "how-we-solve",
  "features",
  "benefits",
  "customer-story",
  "faq",
  "book-demo",
] as const;

export type SolutionPageSection = (typeof SOLUTION_PAGE_SECTIONS)[number];

export function solutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
