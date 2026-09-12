/**
 * Phase 1 target information architecture for header navigation.
 *
 * NOT consumed by Nav.astro / MobileMenu yet — Wave 3 wires this after
 * Solutions + Resources destinations exist. Keeping the target in data stops
 * agents from inventing a third nav shape mid-flight.
 */

export type NavIaItem = {
  readonly id: string;
  readonly label: string;
  /** App-absolute path WITHOUT locale base (pass through `u()` when wiring). */
  readonly path: string;
  readonly kind: "mega" | "link" | "cta";
  readonly desktop?: boolean;
  readonly mobile?: boolean;
};

export const phase1HeaderNav: readonly NavIaItem[] = [
  { id: "products", label: "Products", path: "/products/", kind: "mega" },
  { id: "solutions", label: "Solutions", path: "/solutions/", kind: "mega" },
  { id: "resources", label: "Resources", path: "/resources/", kind: "link" },
  { id: "pricing", label: "Pricing", path: "/products/voxtable/#pricing", kind: "link" },
  { id: "platform", label: "Platform", path: "/platform/", kind: "link" },
  { id: "about", label: "About", path: "/about/", kind: "link" },
  { id: "book-demo", label: "Book Demo", path: "/contact/", kind: "cta" },
] as const;

/** Solutions mega-menu verticals (paths under /solutions/). */
export const phase1SolutionsNav: readonly { readonly slug: string; readonly label: string }[] = [
  { slug: "restaurants", label: "Restaurants" },
  { slug: "hotels", label: "Hotels" },
  { slug: "cafes", label: "Cafes" },
  { slug: "takeaway", label: "Takeaway" },
  { slug: "drive-thru", label: "Drive-Thru" },
  { slug: "medical", label: "Medical" },
  { slug: "professional-services", label: "Professional Services" },
  { slug: "enterprise", label: "Enterprise" },
] as const;

/** Resources hub sections. */
export const phase1ResourcesNav: readonly { readonly id: string; readonly label: string; readonly path: string }[] =
  [
    { id: "guides", label: "Guides", path: "/resources/guides/" },
    { id: "case-studies", label: "Case Studies", path: "/resources/case-studies/" },
    { id: "comparisons", label: "Comparisons", path: "/resources/comparisons/" },
    { id: "faq", label: "FAQ", path: "/resources/faq/" },
    { id: "product-updates", label: "Product Updates", path: "/resources/product-updates/" },
    { id: "industry-reports", label: "Industry Reports", path: "/resources/industry-reports/" },
  ] as const;
