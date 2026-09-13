#!/usr/bin/env node
/**
 * Conversion gate — every commercial page on the AU tree exposes what the
 * conversion SSOT says it must.
 *
 * Why this exists: src/data/conversion.ts declared CONVERSION_PAGE_REQUIREMENTS
 * as a "soft checklist … unit-tested", and docs/phase1/PLAN.md ticked it as
 * done. Nothing imported it. This gate is the checklist made real: it READS
 * that constant, so a requirement added there is enforced here, and a page
 * that drops its Book Demo CTA, phone link or FAQ fails the build instead of
 * quietly converting worse.
 *
 * Commercial pages (derived, never listed): every /solutions/** page, every
 * /products/** page, every published city, the resources hub and its
 * populated categories. Blog posts and legal/about pages are not commercial
 * pages and are not gated.
 *
 * Requirement → assertion (over built HTML in dist/):
 *   book-demo-cta            a[data-cta="book-demo"] whose href carries intent=demo
 *   contact-phone            a[href^="tel:"] with the published line
 *   trust-indicator          the ConversionTrust line or the nav phone control
 *   faq                      a FAQ accordion (details.faq-item) — solutions,
 *                            products, cities only (resources pages list, not answer)
 *   customer-story-when-data a rendered proof block on every solution page that
 *                            declares `proof` in the registry (no proof, no block)
 *
 * Fault-inject before trusting (CONVERSION_DIST points it at a copy of dist/):
 *   strip data-cta="book-demo" from one solution page → exit 1.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";
import { populatedResourceTypes } from "../build/content-index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = process.env.CONVERSION_DIST ?? join(ROOT, "dist");
if (!existsSync(DIST)) {
  console.error(`check-conversion: ${DIST} not found — run npm run build first.`);
  process.exit(1);
}

const { CONVERSION_PAGE_REQUIREMENTS } = await loadTS(join(ROOT, "src/data/conversion.ts"));
const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
const { PRODUCT_SLUGS } = await loadTS(join(ROOT, "src/data/product-slugs.ts"));
const { getProduct } = await loadTS(join(ROOT, "src/data/products.ts"));
const { publishedCities } = await loadTS(join(ROOT, "src/data/cities.ts"));
const { resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));
const { site } = await loadTS(join(ROOT, "src/data/site.ts"));

const populated = populatedResourceTypes();
const pages = [
  { path: "solutions", faq: false, solution: null },
  ...renderableSolutions().map((s) => ({ path: `solutions/${s.slug}`, faq: true, solution: s })),
  { path: "products", faq: true, solution: null },
  // A FAQ is required on LIVE product pages. In-development / concept pages
  // deliberately answer nothing they cannot yet stand behind (truthfulness),
  // so the requirement does not apply there — the same rule that keeps their
  // structured data free of offers.
  ...PRODUCT_SLUGS.map((s) => ({ path: `products/${s}`, faq: getProduct(s)?.status === "live", solution: null })),
  ...publishedCities.map((c) => ({ path: c.slug, faq: true, solution: null })),
  { path: "resources", faq: false, solution: null },
  ...resourceTypes.filter((t) => populated.has(t.id)).map((t) => ({ path: t.path.replace(/^\/|\/$/g, ""), faq: false, solution: null })),
];

const telHref = site.phone.href;
// Astro escapes text nodes; "Camilo & Mauro" is "Camilo &amp; Mauro" in the built page.
const escapeHtml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CHECKS = {
  "book-demo-cta": (html) => /<a[^>]*data-cta="book-demo"[^>]*href="[^"]*intent=demo[^"]*"|<a[^>]*href="[^"]*intent=demo[^"]*"[^>]*data-cta="book-demo"/.test(html),
  "contact-phone": (html) => html.includes(`href="${telHref}"`),
  "trust-indicator": (html) => /class="conv-trust|class="[^"]*nav-phone|data-trust/.test(html),
  faq: (html, page) => !page.faq || /<details class="faq-item"/.test(html),
  "customer-story-when-data": (html, page) =>
    !page.solution?.page?.proof || (html.includes('id="proof"') && html.includes(escapeHtml(page.solution.page.proof.author))),
};

const unknown = CONVERSION_PAGE_REQUIREMENTS.filter((r) => !(r in CHECKS));
if (unknown.length) {
  console.error(`check-conversion: CONVERSION_PAGE_REQUIREMENTS names requirement(s) this gate cannot assert: ${unknown.join(", ")} — add a check before adding the requirement`);
  process.exit(1);
}

let failed = 0;
for (const page of pages) {
  const file = join(DIST, page.path, "index.html");
  if (!existsSync(file)) { console.error(`FAIL  ${page.path}/: not built`); failed++; continue; }
  const html = readFileSync(file, "utf8");
  const missing = CONVERSION_PAGE_REQUIREMENTS.filter((r) => !CHECKS[r](html, page));
  if (missing.length) { failed++; console.error(`FAIL  ${page.path}/: missing ${missing.join(", ")}`); }
}
if (failed) { console.error(`\ncheck-conversion: ${failed} of ${pages.length} commercial pages fail the conversion contract`); process.exit(1); }
console.log(`check-conversion: ok — ${pages.length} commercial pages carry ${CONVERSION_PAGE_REQUIREMENTS.join(", ")}`);
