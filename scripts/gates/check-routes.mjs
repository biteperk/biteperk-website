#!/usr/bin/env node
/**
 * Route smoke-test over the build output, per BUILD_TARGET:
 *   au     → dist/:        GENERATED from cities.ts + the blog collection + the
 *            static AU route list, so it can't drift when a city or guide ships.
 *   global → dist-global/: GENERATED from src/data/locales.ts (the /en/ + /fr/
 *            locale trees) + the shared infra files.
 * Run after a build: node scripts/gates/check-routes.mjs
 * (set BUILD_TARGET=global for the global pass).
 */
import { existsSync, readdirSync } from "node:fs";
import { populatedResourceTypes } from "../build/content-index.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS as loadTSAbs } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";

const loadTS = (rel) => loadTSAbs(join(ROOT, rel));

const INFRA = ["404.html", "sitemap-index.xml", "sitemap-0.xml", "robots.txt", "llms.txt"];

let DIST, expected;
if (TARGET === "global") {
  const locales = await loadTS("src/data/locales.ts");
  DIST = "dist-global";
  expected = [...locales.pageRoutesForTarget("global"), ...INFRA];
} else {
  const { cities } = await loadTS("src/data/cities.ts");
  const blogSlugs = readdirSync(join(ROOT, "src/content/blog"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
  // Static pages come from locales.ts (AU_STATIC_PAGES) so this gate and
  // tests/helpers/routes.ts cannot disagree about what the AU tree contains.
  // They each carried their own hand-written copy, in different shapes, until
  // Jul 2026 — under a comment claiming they could not drift.
  const { AU_STATIC_PAGES } = await loadTS("src/data/locales.ts");
  // Resources category pages exist only for populated types (content-derived,
  // see locales.ts). Expect exactly those — and, below, NONE of the others.
  const { resourceTypes } = await loadTS("src/data/resources.ts");
  const populated = populatedResourceTypes();
  const categoryPages = resourceTypes.map((t) => ({ t, page: `${t.path.replace(/^\/|\/$/g, "")}/index.html` }));
  DIST = "dist";
  expected = [
    ...AU_STATIC_PAGES.map((p) => (p ? `${p}/index.html` : "index.html")),
    ...categoryPages.filter(({ t }) => populated.has(t.id)).map(({ page }) => page),
    ...blogSlugs.map((s) => `blog/${s}/index.html`),
    ...cities.filter((c) => c.published).map((c) => `${c.slug}/index.html`),
    ...INFRA,
  ];
}

let failed = 0;
if (TARGET !== "global") {
  const { resourceTypes } = await loadTS("src/data/resources.ts");
  const populated = populatedResourceTypes();
  for (const t of resourceTypes) {
    const page = `${t.path.replace(/^\/|\/$/g, "")}/index.html`;
    if (!populated.has(t.id) && existsSync(join(ROOT, DIST, page))) {
      console.error(`FAIL  ${DIST}/${page} was built for an EMPTY category (${t.id}) — a thin page`);
      failed++;
    }
  }
}
for (const route of expected) {
  if (!existsSync(join(ROOT, DIST, route))) {
    console.error(`FAIL  missing ${DIST}/${route}`);
    failed++;
  }
}
if (failed) {
  console.error(`\ncheck-routes (${TARGET}): ${failed} missing route(s).`);
  process.exit(1);
}
console.log(`check-routes (${TARGET}): all ${expected.length} expected routes present in ${DIST}/.`);
