/**
 * Route list for the E2E/axe suites — generated from the SAME data as
 * scripts/check-routes.mjs (cities.ts + blog collection + static list),
 * so it cannot drift when a city or guide ships.
 */
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cities } from "../../src/data/cities";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const blogSlugs = readdirSync(join(ROOT, "src/content/blog"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

/** Every HTML page route served on the site (mirrors check-routes.mjs). */
export const routes: string[] = [
  "/",
  "/products/",
  "/products/perktable/",
  "/products/perkorder/",
  "/products/perkconcierge/",
  "/products/perkdrive/",
  "/contact/",
  "/about/",
  "/technology/",
  "/platform/",
  "/blog/",
  ...blogSlugs.map((s) => `/blog/${s}/`),
  ...cities.filter((c) => c.published).map((c) => `/${c.slug}/`),
  "/legal/privacy/",
  "/legal/terms/",
  "/legal/cookies/",
  "/404.html",
];
