/**
 * Phase 1 registries — asserted by IMPORTING them, not by grepping source.
 *
 * The first version of this file matched regexes against file text
 * (`assert.match(src, /slug: "restaurants"/)`). That passes against a file of
 * commented-out code and cannot see empty copy, a missing FAQ, a product slug
 * that does not exist, or a nav that disagrees with itself — all of which the
 * 13 Sep 2026 audit found while these tests were green.
 *
 * Run: node --test tests/unit/  (gates:au and gates:global)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ts = (rel) => loadTS(join(ROOT, rel));

const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
/** Every prose string a solution page renders (SEO title/description excluded). */
function bodyWords(page) {
  const parts = [
    page.hero.eyebrow, page.hero.headline, page.hero.sub,
    page.problem.title, page.problem.body,
    page.lostRevenue.title, page.lostRevenue.body, ...page.lostRevenue.points,
    page.howWeSolve.title, page.howWeSolve.body, ...page.howWeSolve.steps.flatMap((s) => [s.title, s.body]),
    ...page.features.flatMap((f) => [f.title, f.body]),
    ...page.benefits,
    page.story.title, page.story.body,
    ...page.faq.flatMap((f) => [f.q, f.a]),
  ];
  return parts.reduce((n, p) => n + words(p), 0);
}

describe("solutions registry", async () => {
  const { solutions, SOLUTION_SLUGS, renderableSolutions, RENDERABLE_SOLUTION_SLUGS, liveSolutions } = await ts("src/data/solutions.ts");
  const { getProduct } = await ts("src/data/products.ts");
  const { PRODUCT_SLUGS } = await ts("src/data/product-slugs.ts");

  it("exactly the eight required verticals, each with a real product behind it", () => {
    assert.deepEqual([...SOLUTION_SLUGS].sort(), ["cafes", "drive-thru", "enterprise", "hotels", "medical", "professional-services", "restaurants", "takeaway"]);
    assert.equal(solutions.length, 8);
    for (const s of solutions) {
      assert.ok(PRODUCT_SLUGS.includes(s.primaryProduct), `${s.slug}: primaryProduct ${s.primaryProduct} is not in products.ts`);
      assert.ok(getProduct(s.primaryProduct), `${s.slug}: getProduct(${s.primaryProduct}) is undefined`);
    }
  });

  it("every renderable page has enough copy to be a page, and at least two FAQs", () => {
    for (const s of renderableSolutions()) {
      const n = bodyWords(s.page);
      assert.ok(n >= 250, `${s.slug}: ${n} body words — under the 250 floor`);
      assert.ok(s.page.faq.length >= 2, `${s.slug}: ${s.page.faq.length} FAQ(s)`);
      for (const f of s.page.faq) assert.ok(words(f.a) >= 8, `${s.slug}: FAQ "${f.q}" has a one-line answer`);
    }
  });

  it("proof is only ever an attributed quote from a named venue", () => {
    let withProof = 0;
    for (const s of solutions) {
      if (!s.page.proof) continue;
      withProof++;
      assert.ok(words(s.page.proof.quote) >= 8, `${s.slug}: proof quote too short`);
      assert.ok(s.page.proof.author && s.page.proof.role, `${s.slug}: proof must name who said it and where`);
      assert.match(s.page.proof.role, /·/, `${s.slug}: role must name the venue ("Owner · Venue, City")`);
    }
    assert.ok(withProof >= 1, "at least one vertical carries the approved founding-venue quotes");
  });

  it("the route predicate and the nav predicate agree with the registry", () => {
    assert.deepEqual(RENDERABLE_SOLUTION_SLUGS, renderableSolutions().map((s) => s.slug));
    for (const s of liveSolutions()) assert.ok(RENDERABLE_SOLUTION_SLUGS.includes(s.slug), `${s.slug} is live but not renderable`);
  });
});

describe("internal-linking graph", async () => {
  const { solutions, SOLUTION_SLUGS, liveSolutions, solutionsForProduct } = await ts("src/data/solutions.ts");
  const { blogPosts } = await import("../../scripts/build/content-index.mjs");
  const { readFileSync } = await import("node:fs");
  const slugs = new Set(blogPosts().map((p) => p.slug));

  it("every solution links real guides and real, live sibling solutions", () => {
    for (const s of solutions) {
      assert.ok(s.relatedGuides.length >= 2, `${s.slug}: fewer than 2 related guides`);
      for (const g of s.relatedGuides) assert.ok(slugs.has(g), `${s.slug}: guide "${g}" does not exist`);
      assert.ok(s.relatedSolutions.length >= 1, `${s.slug}: no sibling solution`);
      for (const r of s.relatedSolutions) {
        assert.ok(SOLUTION_SLUGS.includes(r), `${s.slug}: sibling "${r}" is not a solution`);
        assert.notEqual(r, s.slug, `${s.slug}: links to itself`);
      }
    }
  });

  it("every published post declares at least one live solution it is built for", () => {
    for (const p of blogPosts().filter((p) => !p.draft)) {
      const fm = readFileSync(join(ROOT, `src/content/blog/${p.slug}.md`), "utf8").match(/^relatedSolutions:\s*\[([^\]]*)\]/m);
      assert.ok(fm, `${p.slug}: no relatedSolutions frontmatter`);
      const list = fm[1].split(",").map((x) => x.trim().replace(/^"|"$/g, "")).filter(Boolean);
      assert.ok(list.length >= 1, `${p.slug}: empty relatedSolutions`);
      for (const r of list) assert.ok(liveSolutions().some((s) => s.slug === r), `${p.slug}: "${r}" is not a live solution`);
    }
  });

  it("every live solution is reachable from its product page (derived back-reference)", () => {
    for (const s of liveSolutions()) assert.ok(solutionsForProduct(s.primaryProduct).some((x) => x.slug === s.slug));
  });
});

describe("AU static pages derive from the registries", async () => {
  const { AU_STATIC_PAGES } = await ts("src/data/locales.ts");
  const { RENDERABLE_SOLUTION_SLUGS } = await ts("src/data/solutions.ts");
  const { PRODUCT_SLUGS } = await ts("src/data/product-slugs.ts");

  it("every renderable solution and product has a static page entry; resources hub present; no category page listed", () => {
    for (const s of RENDERABLE_SOLUTION_SLUGS) assert.ok(AU_STATIC_PAGES.includes(`solutions/${s}`), `solutions/${s} missing`);
    for (const p of PRODUCT_SLUGS) assert.ok(AU_STATIC_PAGES.includes(`products/${p}`), `products/${p} missing`);
    assert.ok(AU_STATIC_PAGES.includes("solutions") && AU_STATIC_PAGES.includes("resources"));
    assert.equal(AU_STATIC_PAGES.filter((p) => p.startsWith("resources/")).length, 0, "category pages are content-derived, never listed");
  });
});

describe("resources registry", async () => {
  const { RESOURCE_TYPES, resourceTypes, RESOURCE_SEGMENTS, RESOURCE_TYPE_BY_SEGMENT, resourceTypeFromSegment } = await ts("src/data/resources.ts");

  it("six types, each with a path under /resources/ and a segment that maps back to it", () => {
    assert.equal(RESOURCE_TYPES.length, 6);
    assert.equal(resourceTypes.length, 6);
    for (const t of resourceTypes) {
      assert.match(t.path, /^\/resources\/[a-z-]+\/$/, `${t.id}: path ${t.path}`);
      const seg = t.path.replace(/^\/resources\/|\/$/g, "");
      assert.ok(RESOURCE_SEGMENTS.includes(seg), `${t.id}: segment ${seg} unmapped`);
      assert.equal(RESOURCE_TYPE_BY_SEGMENT[seg], t.id);
      assert.equal(resourceTypeFromSegment(seg)?.id, t.id);
      assert.ok(t.label && t.plural && t.description);
    }
  });
});

describe("conversion SSOT", async () => {
  const { bookDemoHref, defaultCtaActions, CTA_LABELS, CONVERSION_PAGE_REQUIREMENTS, CONVERSION_TRUST } = await ts("src/data/conversion.ts");
  const { site } = await ts("src/data/site.ts");

  it("Book Demo carries intent and product, on the AU base", () => {
    assert.equal(bookDemoHref(), "/au-en/contact/?intent=demo");
    assert.equal(bookDemoHref({ product: "voxtable" }), "/au-en/contact/?intent=demo&product=voxtable");
    const a = defaultCtaActions({ product: "voxorder" });
    assert.equal(a.primary.label, CTA_LABELS.bookDemo);
    assert.match(a.primary.href, /intent=demo&product=voxorder$/);
    assert.equal(a.secondary.label, CTA_LABELS.howItWorks);
    assert.equal(a.secondary.href, "/au-en/technology/");
    assert.equal(CTA_LABELS.seeProduct("VoxTable"), "See VoxTable");
  });

  it("the requirements list is the gate's contract, and the trust line uses the published phone", () => {
    assert.deepEqual([...CONVERSION_PAGE_REQUIREMENTS], ["book-demo-cta", "contact-phone", "trust-indicator", "faq", "customer-story-when-data"]);
    assert.equal(CONVERSION_TRUST.phone.href, site.phone.href);
  });
});

describe("navigation", async () => {
  const { headerNav } = await ts("src/data/nav.ts");

  it("nav.ts is the only header definition and carries the Phase 1 order", () => {
    assert.equal(existsSync(join(ROOT, "src/data/nav-ia.ts")), false, "nav-ia.ts must not come back — two nav definitions drift");
    const desktop = headerNav.filter((l) => l.desktop !== false).map((l) => l.label);
    assert.deepEqual(desktop, ["Resources", "Pricing", "Platform", "About"]);
    for (const l of headerNav) assert.match(l.href, /^\/au-en\//, `${l.label}: href must carry the AU base`);
  });
});

describe("phase 1 plan", async () => {
  const { readFileSync } = await import("node:fs");
  it("locks the locale rename decision", () => {
    const plan = readFileSync(join(ROOT, "docs/phase1/PLAN.md"), "utf8");
    assert.match(plan, /Keep `\/gb-en`/);
    assert.match(plan, /Keep `\/fr`/);
  });
});
