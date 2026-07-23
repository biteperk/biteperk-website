/**
 * Route list for the E2E/axe suites — generated from the SAME data as
 * scripts/check-routes.mjs, per BUILD_TARGET, so it cannot drift when a city,
 * guide, or locale ships.
 *   au     → cities.ts + blog collection + the static AU list
 *   global → src/data/locales.ts (the /en/ + /fr/ locale trees)
 */
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cities } from "../../src/data/cities";
import { localesForTarget, INTL_PAGE_PATHS } from "../../src/data/locales";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";

function auRoutes(): string[] {
  const blogSlugs = readdirSync(join(ROOT, "src/content/blog"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
  return [
    "/",
    "/products/",
    "/products/voxtable/",
    "/products/voxorder/",
    "/products/voxconcierge/",
    "/products/voxdrive/",
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
}

function globalRoutes(): string[] {
  const out: string[] = [];
  for (const l of localesForTarget("global")) {
    for (const p of INTL_PAGE_PATHS) {
      const seg = [l.path, p].filter(Boolean).join("/");
      out.push(`/${seg}/`);
    }
  }
  out.push("/404.html");
  return out;
}

/** Every HTML page route served on the current build target. */
export const routes: string[] = TARGET === "global" ? globalRoutes() : auRoutes();
