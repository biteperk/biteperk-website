#!/usr/bin/env node
/**
 * Route smoke-test over dist/. The expected list is GENERATED from the same
 * data that generates the pages (cities.ts, src/content/blog/) plus the
 * static route list — so the check can't drift when a city or guide ships.
 * Run after `astro build`: node scripts/check-routes.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const src = readFileSync(join(ROOT, "src/data/cities.ts"), "utf8");
const { code } = transformSync(src, { loader: "ts", format: "esm" });
const { cities } = await import(
  "data:text/javascript;base64," + Buffer.from(code).toString("base64")
);

const blogSlugs = readdirSync(join(ROOT, "src/content/blog"))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

const expected = [
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
  "404.html",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "robots.txt",
  "llms.txt",
];

let failed = 0;
for (const route of expected) {
  if (!existsSync(join(ROOT, "dist", route))) {
    console.error(`FAIL  missing dist/${route}`);
    failed++;
  }
}
if (failed) {
  console.error(`\ncheck-routes: ${failed} missing route(s).`);
  process.exit(1);
}
console.log(`check-routes: all ${expected.length} expected routes present.`);
