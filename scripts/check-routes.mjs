#!/usr/bin/env node
/**
 * Route smoke-test over the build output, per BUILD_TARGET:
 *   au     → dist/:        GENERATED from cities.ts + the blog collection + the
 *            static AU route list, so it can't drift when a city or guide ships.
 *   global → dist-global/: GENERATED from src/data/locales.ts (the /en/ + /fr/
 *            locale trees) + the shared infra files.
 * Run after a build: node scripts/check-routes.mjs
 * (set BUILD_TARGET=global for the global pass).
 */
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS as loadTSAbs } from "./_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
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
  DIST = "dist";
  expected = [
    "index.html",
    "products/index.html",
    "products/voxtable/index.html",
    "products/voxorder/index.html",
    "products/voxconcierge/index.html",
    "products/voxdrive/index.html",
    "contact/index.html",
    "about/index.html",
    "technology/index.html",
    "platform/index.html",
    "blog/index.html",
    ...blogSlugs.map((s) => `blog/${s}/index.html`),
    ...cities.filter((c) => c.published).map((c) => `${c.slug}/index.html`),
    "legal/privacy/index.html",
    "legal/terms/index.html",
    "legal/cookies/index.html",
    ...INFRA,
  ];
}

let failed = 0;
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
