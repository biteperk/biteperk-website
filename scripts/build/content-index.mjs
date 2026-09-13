/**
 * Content index — what the blog collection contains, readable from plain Node
 * (gates, the Playwright route helper, astro.config) without Astro's
 * `getCollection`.
 *
 * Reads frontmatter with a deliberately small parser: `type:` and `draft:` are
 * single-line scalars in every post and the collection schema defaults them
 * (`guide`, `false`), so the two rules below ARE the schema's rules. The build
 * itself uses getCollection; check-routes compares the two, so if a post ever
 * writes these fields in a shape this parser misreads, the gate fails rather
 * than a category page silently appearing or vanishing.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BLOG = join(ROOT, "src/content/blog");

/** @returns {{ slug: string, type: string, draft: boolean, publishDate: string, updatedDate?: string }[]} */
export function blogPosts() {
  return readdirSync(BLOG)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const src = readFileSync(join(BLOG, f), "utf8");
      const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const scalar = (key) => fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, "m"))?.[1]?.trim();
      return {
        slug: f.replace(/\.md$/, ""),
        type: scalar("type") ?? "guide",
        draft: scalar("draft") === "true",
        publishDate: scalar("publishDate") ?? "",
        updatedDate: scalar("updatedDate") || undefined,
      };
    });
}

/** Published (non-draft) posts. */
export function publishedPosts() {
  return blogPosts().filter((p) => !p.draft);
}

/** Resource type ids that have at least one published post — the only category pages that build. */
export function populatedResourceTypes() {
  return new Set(publishedPosts().map((p) => p.type));
}
