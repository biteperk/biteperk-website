/**
 * Route list for the E2E/axe suites — generated from the SAME data as
 * scripts/gates/check-routes.mjs, per BUILD_TARGET, so it cannot drift when a city,
 * guide, or locale ships.
 *   au     → cities.ts + blog collection + AU_STATIC_PAGES (locales.ts)
 *   global → src/data/locales.ts (pagesForLocale per tree)
 *
 * That claim was only two-thirds true until Jul 2026: the global half derived
 * correctly, and cities/guides derived correctly, but the STATIC AU list was
 * hand-written here AND in check-routes.mjs, in two different shapes. Both now
 * read AU_STATIC_PAGES.
 */
import { readdirSync } from "node:fs";
import { resourceTypes } from "../../src/data/resources";
import { populatedResourceTypes } from "../../scripts/build/content-index.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cities } from "../../src/data/cities";
import { localesForTarget, pagesForLocale, AU_STATIC_PAGES } from "../../src/data/locales";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";

/**
 * The AU build's base path. Playwright's `baseURL` is the bare origin, so a
 * hand-written `page.goto("/contact/")` lands on the UN-based root — which is
 * a 404 since the site moved under /au-en. Route those through `p()`.
 */
export const AU_BASE = "/au-en";

/** p("/contact/") → "/au-en/contact/". p() → "/au-en/". */
export function p(path = "/"): string {
  return `${AU_BASE}${path}`;
}

function auRoutes(): string[] {
  const blogSlugs = readdirSync(join(ROOT, "src/content/blog"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
  // The AU site is served under /au-en on biteperk.com (single-domain rev.3).
  const b = "/au-en";
  return [
    // Static pages come from locales.ts so this list and check-routes.mjs
    // cannot disagree — they each held their own copy until Jul 2026.
    ...AU_STATIC_PAGES.map((p) => `${b}/${p ? `${p}/` : ""}`),
    // Resources category pages: only populated types build (content-derived).
    ...resourceTypes.filter((t) => populatedResourceTypes().has(t.id)).map((t) => `${b}${t.path}`),
    ...blogSlugs.map((s) => `${b}/blog/${s}/`),
    ...cities.filter((c) => c.published).map((c) => `${b}/${c.slug}/`),
    `${b}/404.html`,
  ];
}

function globalRoutes(): string[] {
  const out: string[] = [];
  for (const l of localesForTarget("global")) {
    const seg0 = l.base.replace(/^\//, "");
    for (const p of pagesForLocale(l)) {
      const seg = [seg0, p].filter(Boolean).join("/");
      out.push(`/${seg}/`);
    }
  }
  out.push("/404.html");
  return out;
}

/** Every HTML page route served on the current build target. */
export const routes: string[] = TARGET === "global" ? globalRoutes() : auRoutes();
