#!/usr/bin/env node
/**
 * Sitemap gate — the URL set is EXACTLY the pages that should be indexed.
 *
 * Replaces the workflow's three greps (which proved one product URL and the
 * host). Expected set is derived: AU = AU_STATIC_PAGES + populated resources
 * categories + published cities + published posts, minus /blog/ (canonical →
 * /resources/guides/); global = pageRoutesForTarget("global"). Also asserts
 * priorities on the commercial pages and lastmod on posts.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";
import { publishedPosts, populatedResourceTypes } from "../build/content-index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const FILE = join(ROOT, TARGET === "global" ? "dist-global" : "dist", "sitemap-0.xml");
if (!existsSync(FILE)) { console.error(`check-sitemap: ${FILE} not found`); process.exit(1); }
const xml = readFileSync(FILE, "utf8");
const ORIGIN = "https://biteperk.com";
const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
  const b = m[1];
  return { loc: b.match(/<loc>([^<]+)<\/loc>/)?.[1], priority: b.match(/<priority>([^<]+)<\/priority>/)?.[1], lastmod: b.match(/<lastmod>/) != null };
});
const have = new Set(urls.map((u) => u.loc));
const locales = await loadTS(join(ROOT, "src/data/locales.ts"));

let expected;
if (TARGET === "global") {
  expected = locales.pageRoutesForTarget("global").map((r) => `${ORIGIN}/${r.replace(/index\.html$/, "")}`);
} else {
  const { publishedCities } = await loadTS(join(ROOT, "src/data/cities.ts"));
  const { resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));
  const populated = populatedResourceTypes();
  const b = `${ORIGIN}${locales.AU_BASE}`;
  expected = [
    ...locales.AU_STATIC_PAGES.filter((p) => p !== "blog").map((p) => `${b}/${p ? `${p}/` : ""}`),
    ...resourceTypes.filter((t) => populated.has(t.id)).map((t) => `${b}${t.path}`),
    ...publishedCities.map((c) => `${b}/${c.slug}/`),
    ...publishedPosts().map((p) => `${b}/blog/${p.slug}/`),
  ];
}
let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
for (const u of expected) if (!have.has(u)) fail(`missing from sitemap: ${u}`);
for (const u of have) if (!expected.includes(u)) fail(`unexpected in sitemap: ${u}`);
if (/https:\/\/biteperk\.com\.au\b/.test(xml)) fail("sitemap names the retired .com.au host");
if (TARGET === "au") {
  for (const u of urls) {
    if (/\/solutions\/[a-z-]+\/$/.test(u.loc) && u.priority !== "0.9") fail(`${u.loc}: priority ${u.priority}, expected 0.9`);
    if (/\/blog\/[a-z0-9-]+\/$/.test(u.loc) && !u.lastmod) fail(`${u.loc}: no <lastmod>`);
  }
}
if (failed) { console.error(`\ncheck-sitemap (${TARGET}): ${failed} failure(s)`); process.exit(1); }
console.log(`check-sitemap (${TARGET}): ok — ${have.size} URLs, exactly the expected set`);
