/**
 * Content collections (Astro 5 Content Layer).
 *
 * `blog` powers the Guides hub — restaurant-owner-facing articles that
 * give Google (and AI answer engines) something to rank beyond the brand
 * name. Each post is a Markdown file in src/content/blog/.
 *
 * Adding a post: drop a new .md file in src/content/blog/ with the
 * frontmatter below. It appears on /blog/ and gets its own page, sitemap
 * entry, and Article structured data automatically.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    /** Page <title> and H1. Keep the primary keyword near the front. */
    title: z.string(),
    /** Meta description + card excerpt. ~150–160 chars. */
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("The Biteperk team"),
    tags: z.array(z.string()).default([]),
    /** Optional per-post Open Graph image; falls back to /og/blog.png. */
    ogImage: z.string().optional(),
    /** Hide from the index + noindex while drafting. */
    draft: z.boolean().default(false),
    /** Pull to the top of the index as the cornerstone read. */
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog };
