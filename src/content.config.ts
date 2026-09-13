/**
 * Content collections (Astro 5 Content Layer).
 *
 * `blog` powers the Resources library. Each Markdown file in
 * src/content/blog/ keeps its stable /blog/{slug}/ URL. The Resources hub
 * at /resources/ filters the same collection by `type`.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const resourceType = z.enum([
  "guide",
  "comparison",
  "case-study",
  "faq",
  "product-update",
  "industry-report",
]);

/**
 * Proof and provenance fields (Wave 8 / W1). A case study is a claim about a
 * named venue, so it cannot publish without that venue's recorded approval;
 * an industry report is a claim about the market, so it cannot publish
 * without sources. Enforced here (the build refuses the file) and reported by
 * scripts/build/content-inventory.mjs (so a draft shows up as "blocked on
 * approval" rather than silently absent).
 */
const customer = z
  .object({
    /** Person quoted or named. */
    name: z.string(),
    venue: z.string(),
    city: z.string().optional(),
    /** Written approval recorded — who, how, when. Never true without it. */
    approved: z.boolean(),
    approvedOn: z.coerce.date().optional(),
    approvedVia: z.string().optional(),
  })
  .optional();
const sources = z.array(z.object({ title: z.string(), url: z.string().url(), accessed: z.coerce.date().optional() })).default([]);
/** City slugs (cities.ts / intl/cities.ts) a piece supports — rendered as city links and counted per market. */
const cities = z.array(z.string()).default([]);

const proofRules = (post: { type: string; customer?: { approved: boolean } | undefined; sources: unknown[]; draft: boolean }, ctx: z.RefinementCtx) => {
  if (post.draft) return; // drafts may be incomplete; the inventory reports what blocks them
  if (post.type === "case-study" && !post.customer?.approved)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A published case study needs `customer.approved: true` with the approval recorded (approvedOn/approvedVia)." });
  if (post.type === "industry-report" && post.sources.length === 0)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A published industry report needs at least one entry in `sources`." });
};

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    /** Page H1 + card heading. Keep the primary keyword near the front. */
    title: z.string(),
    /**
     * Optional shorter <title> for search results (kept ≤ ~60 chars before
     * the " · Biteperk" suffix). Falls back to `title` when omitted.
     */
    seoTitle: z.string().optional(),
    /** Meta description + card excerpt. ~150–160 chars. */
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("The Biteperk team"),
    tags: z.array(z.string()).default([]),
    /**
     * Resources taxonomy (Phase 1D). Defaults to `guide` so older posts
     * without frontmatter still classify cleanly.
     */
    type: resourceType.default("guide"),
    /**
     * Solution verticals this post supports (slugs from solutions.ts) —
     * rendered as a "Built for" block under the article so every guide links
     * into the commercial-intent pages. Validated by the unit tests.
     */
    relatedSolutions: z.array(z.string()).default([]),
    /**
     * Optional per-post Open Graph image. Falls back to the DERIVED card
     * /og/posts/<slug>.png (`npm run og` renders one per published post), then
     * to /og/blog.png.
     */
    ogImage: z.string().optional(),
    /** Hide from the index + noindex while drafting. */
    draft: z.boolean().default(false),
    /** Pull to the top of the index as the cornerstone read. */
    featured: z.boolean().default(false),
    cities,
    sources,
    customer,
  }).superRefine(proofRules),
});

/**
 * International resources (Phase 1 / M2). Language-scoped articles under
 * src/content/intl-resources/<lang>/, emitted at
 * /<base>/resources/<segment>/<slug>/ for every base in `markets`. The same
 * slug in another language is the same article (hreflang alternates cluster
 * by path). Europe-truthful like every global surface: no AU price, NAP or
 * phone; live means live in Australia; Europe is the pilot programme
 * (check-truthful sweeps the built pages).
 */
const intlResources = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/intl-resources" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("The BitePerk team"),
    tags: z.array(z.string()).default([]),
    type: resourceType,
    /** Language of the prose — must match the directory. */
    lang: z.enum(["en", "fr"]),
    /** Locale bases that emit this article (e.g. "/gb-en"). */
    markets: z.array(z.string()).min(1),
    relatedSolutions: z.array(z.string()).default([]),
    cities,
    sources,
    customer,
    ogImage: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }).superRefine(proofRules),
});

export const collections = { blog, intlResources };
