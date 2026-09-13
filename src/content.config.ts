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
    /** Optional per-post Open Graph image; falls back to /og/blog.png. */
    ogImage: z.string().optional(),
    /** Hide from the index + noindex while drafting. */
    draft: z.boolean().default(false),
    /** Pull to the top of the index as the cornerstone read. */
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
