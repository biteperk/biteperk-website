/**
 * Resources hub IA (Phase 1D / Wave 4).
 *
 * Content still lives in the `blog` collection at /blog/{slug}/ so existing
 * URLs, Ads finals, and inbound links stay stable. This module owns the
 * public Resources taxonomy and hub paths; category pages filter the same
 * collection by `data.type`.
 */

export const RESOURCE_TYPES = [
  "guide",
  "comparison",
  "case-study",
  "faq",
  "product-update",
  "industry-report",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type ResourceTypeMeta = {
  readonly id: ResourceType;
  readonly label: string;
  readonly plural: string;
  readonly description: string;
  /** App-absolute path (pass through `u()`). */
  readonly path: string;
};

export const resourceTypes: readonly ResourceTypeMeta[] = [
  {
    id: "guide",
    label: "Guide",
    plural: "Guides",
    description: "Educational field notes for operators — missed calls, bookings, and running the phone.",
    path: "/resources/guides/",
  },
  {
    id: "comparison",
    label: "Comparison",
    plural: "Comparisons",
    description: "Buyer-intent breakdowns — AI receptionist vs voicemail, call centres, and answering services.",
    path: "/resources/comparisons/",
  },
  {
    id: "case-study",
    label: "Case study",
    plural: "Case studies",
    description: "Proof from real venues — what changed on the phone and on the floor.",
    path: "/resources/case-studies/",
  },
  {
    id: "faq",
    label: "FAQ",
    plural: "FAQs",
    description: "Straight answers for search and support — short, citeable, no jargon.",
    path: "/resources/faq/",
  },
  {
    id: "product-update",
    label: "Product update",
    plural: "Product updates",
    description: "What shipped and why — transparency for customers and prospects.",
    path: "/resources/product-updates/",
  },
  {
    id: "industry-report",
    label: "Industry report",
    plural: "Industry reports",
    description: "Quarterly authority pieces on phone automation in hospitality.",
    path: "/resources/industry-reports/",
  },
] as const;

/** URL segment → type id (e.g. guides → guide). */
export const RESOURCE_TYPE_BY_SEGMENT: Readonly<Record<string, ResourceType>> = {
  guides: "guide",
  comparisons: "comparison",
  "case-studies": "case-study",
  faq: "faq",
  "product-updates": "product-update",
  "industry-reports": "industry-report",
};

export function resourceTypeMeta(id: ResourceType): ResourceTypeMeta {
  const found = resourceTypes.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown resource type: ${id}`);
  return found;
}

export function resourceTypeFromSegment(segment: string): ResourceTypeMeta | undefined {
  const id = RESOURCE_TYPE_BY_SEGMENT[segment];
  return id ? resourceTypeMeta(id) : undefined;
}

export const RESOURCE_SEGMENTS = Object.keys(RESOURCE_TYPE_BY_SEGMENT);
