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
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// When locales.ts is bundled by _load-ts.mjs (a data: URL) this module rides
// along and import.meta.url is not a file URL — fall back to the working
// directory, which every gate and test runs from the repo root.
const ROOT = import.meta.url.startsWith("file:")
  ? join(dirname(fileURLToPath(import.meta.url)), "..", "..")
  : process.cwd();
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
        title: scalar("title") ?? "",
        description: scalar("description") ?? "",
        type: scalar("type") ?? "guide",
        draft: scalar("draft") === "true",
        publishDate: scalar("publishDate") ?? "",
        updatedDate: scalar("updatedDate") || undefined,
      };
    });
}

const INTL = join(ROOT, "src/content/intl-resources");

/**
 * International resource articles, by language directory. The `lang/slug`
 * pair is the collection id Astro assigns; `markets` is the list of bases the
 * article ships under. Same small frontmatter parser as blogPosts().
 */
export function intlResourcePosts() {
  if (!existsSync(INTL)) return [];
  const out = [];
  for (const lang of readdirSync(INTL)) {
    const dir = join(INTL, lang);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md") || f.startsWith("_")) continue;
      const src = readFileSync(join(dir, f), "utf8");
      const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const scalar = (key) => fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, "m"))?.[1]?.trim();
      const list = (key) => (fm.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, "m"))?.[1] ?? "").split(",").map((x) => x.trim().replace(/^"|"$/g, "")).filter(Boolean);
      out.push({
        lang,
        slug: f.replace(/\.md$/, ""),
        title: scalar("title") ?? "",
        description: scalar("description") ?? "",
        type: scalar("type") ?? "guide",
        draft: scalar("draft") === "true",
        markets: list("markets"),
        relatedSolutions: list("relatedSolutions"),
        publishDate: scalar("publishDate") ?? "",
      });
    }
  }
  return out;
}

/** Published intl articles that ship under a given locale base. */
export function intlResourcesForBase(base) {
  return intlResourcePosts().filter((p) => !p.draft && p.markets.includes(base));
}

/** Published (non-draft) posts. */
export function publishedPosts() {
  return blogPosts().filter((p) => !p.draft);
}

/** Resource type ids that have at least one published post — the only category pages that build. */
export function populatedResourceTypes() {
  return new Set(publishedPosts().map((p) => p.type));
}
