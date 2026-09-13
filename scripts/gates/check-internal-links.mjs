#!/usr/bin/env node
/**
 * Internal-linking gate (AU) — the hub graph exists in BODY copy, not only
 * in the nav.
 *
 * On 13 Sep 2026 the eight solution pages had zero editorial inbound links:
 * reachable only through the mega-menu, which every crawler discounts. Nav,
 * header and footer markup is stripped before counting, so a link here is an
 * in-body link. Asserts:
 *   - every renderable solution page is linked in-body from ≥ MIN_INBOUND
 *     other pages
 *   - every published post links in-body to ≥1 solution page
 *   - every solution page links in-body to ≥1 guide and ≥1 other solution
 *   - the home and /products/ link /solutions/ in-body
 *
 * Fault-inject (LINKS_DIST → a copy): remove the "Built for" line from one
 * post, or the SolutionStrip from index.html.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";
import { publishedPosts } from "../build/content-index.mjs";
import { pages, html, bodyOnly } from "./_dist.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = process.env.LINKS_DIST ?? join(ROOT, "dist");
if (!existsSync(DIST)) { console.error("check-internal-links: dist/ not found — build first."); process.exit(1); }
const MIN_INBOUND = 2;

const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
const { AU_BASE } = await loadTS(join(ROOT, "src/data/locales.ts"));
const hrefs = (h) => new Set([...bodyOnly(h).matchAll(/href="([^"#?]*)/g)].map((m) => m[1].replace(/\/?$/, "/")));

// dist/ paths carry no base; the hrefs inside the pages do (/au-en/…).
const all = pages(DIST).map((p) => ({ ...p, route: `${AU_BASE}${p.route}`, links: hrefs(html(p.file)) }));
const byRoute = new Map(all.map((p) => [p.route, p]));
let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };

for (const s of renderableSolutions()) {
  const target = `${AU_BASE}/solutions/${s.slug}/`;
  const inbound = all.filter((p) => p.route !== target && p.links.has(target)).map((p) => p.route);
  if (inbound.length < MIN_INBOUND) fail(`${target}: only ${inbound.length} in-body inbound link(s) (${inbound.join(", ") || "none"})`);
  const page = byRoute.get(target);
  if (!page) { fail(`${target}: not built`); continue; }
  if (![...page.links].some((l) => l.startsWith(`${AU_BASE}/blog/`))) fail(`${target}: no in-body link to a guide`);
  if (![...page.links].some((l) => /\/solutions\/[a-z-]+\/$/.test(l) && l !== target)) fail(`${target}: no in-body link to a sibling solution`);
}
for (const p of publishedPosts()) {
  const page = byRoute.get(`${AU_BASE}/blog/${p.slug}/`);
  if (!page) { fail(`/blog/${p.slug}/: not built`); continue; }
  if (![...page.links].some((l) => /\/solutions\/[a-z-]+\/$/.test(l))) fail(`/blog/${p.slug}/: no in-body link to a solution`);
}
for (const r of [`${AU_BASE}/`, `${AU_BASE}/products/`]) {
  if (!byRoute.get(r)?.links.has(`${AU_BASE}/solutions/`)) fail(`${r}: no in-body link to /solutions/`);
}

if (failed) { console.error(`\ncheck-internal-links: ${failed} failure(s)`); process.exit(1); }
console.log(`check-internal-links: ok — ${renderableSolutions().length} solution pages each have ≥${MIN_INBOUND} in-body inbound links, every post links a solution, hubs link /solutions/`);
