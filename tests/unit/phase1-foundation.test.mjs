import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
function read(rel) {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("phase1 foundation registries", () => {
  it("solutions registry lists exactly the eight required slugs with page copy", () => {
    const src = read("src/data/solutions.ts");
    for (const slug of [
      "restaurants",
      "hotels",
      "cafes",
      "takeaway",
      "drive-thru",
      "medical",
      "professional-services",
      "enterprise",
    ]) {
      assert.match(src, new RegExp(`slug: "${slug}"`));
    }
    assert.match(src, /readonly proof\?:/); // approved-quote slot; the dead SOLUTION_PAGE_SECTIONS constant is gone
    assert.match(src, /status: "live"/);
    assert.match(src, /page:\s*\{/);
  });

  it("locale-plan keeps live UK/FR bases as /gb-en and /fr (no rename)", () => {
    const src = read("src/data/locale-plan.ts");
    assert.match(src, /"uk-en": "\/gb-en"/);
    assert.match(src, /"fr-fr": "\/fr"/);
    assert.match(src, /id: "ca-en"/);
    assert.match(src, /status: "reserved"/);
  });

  it("nav-ia encodes the Phase 1 header targets", () => {
    const src = read("src/data/nav-ia.ts");
    for (const label of ["Products", "Solutions", "Resources", "Pricing", "Platform", "About", "Book Demo"]) {
      assert.match(src, new RegExp(`label: "${label}"`));
    }
  });

  it("AU static pages include solutions routes", () => {
    const src = read("src/data/locales.ts");
    assert.match(src, /SOLUTION_SLUGS/);
    assert.match(src, /"solutions"/);
    assert.match(src, /solutions\/\$\{s\}/);
  });

  it("solutions pages and layout exist", () => {
    assert.equal(read("src/pages/solutions/index.astro").includes("Industry solutions"), true);
    assert.equal(read("src/pages/solutions/[slug].astro").includes("business-problem"), true);
    assert.equal(read("src/layouts/SolutionLayout.astro").includes("CTA_LABELS.bookDemo"), true);
  });

  it("phase1 plan doc exists and locks locale rename decision", () => {
    const plan = read("docs/phase1/PLAN.md");
    assert.match(plan, /Keep `\/gb-en`/);
    assert.match(plan, /Keep `\/fr`/);
  });
});

describe("phase1 resources hub", () => {
  it("resource types and segments are defined", () => {
    const src = read("src/data/resources.ts");
    for (const path of [
      "/resources/guides/",
      "/resources/comparisons/",
      "/resources/case-studies/",
      "/resources/faq/",
      "/resources/product-updates/",
      "/resources/industry-reports/",
    ]) {
      assert.match(src, new RegExp(path.replaceAll("/", "\/")));
    }
    assert.match(src, /id: "guide"/);
    assert.match(src, /id: "comparison"/);
    assert.match(src, /RESOURCE_SEGMENTS/);
  });

  it("AU static pages include resources routes", () => {
    const src = read("src/data/locales.ts");
    assert.match(src, /RESOURCE_SEGMENTS/);
    assert.match(src, /"resources"/);
  });

  it("prune-global removes resources from global dist", () => {
    assert.match(read("scripts/build/prune-global.mjs"), /"resources"/);
  });

  it("comparison post is typed", () => {
    assert.match(
      read("src/content/blog/ai-receptionist-vs-answering-service-vs-voicemail.md"),
      /type: comparison/,
    );
  });
});

describe("phase1 conversion system", () => {
  it("conversion SSOT exports Book Demo hierarchy", () => {
    const src = read("src/data/conversion.ts");
    assert.match(src, /intent: "demo"/);
    assert.match(src, /bookDemo: "Book Demo"/);
    assert.match(src, /howItWorks: "See How It Works"/);
    assert.match(src, /function bookDemoHref/);
    assert.match(src, /function defaultCtaActions/);
  });

  it("Cta defaults use conversion SSOT", () => {
    const src = read("src/components/Cta.astro");
    assert.match(src, /defaultCtaActions/);
    assert.match(src, /Book a demo/);
  });

  it("SolutionLayout and ProductLayout wire conversion helpers", () => {
    assert.match(read("src/layouts/SolutionLayout.astro"), /bookDemoHref/);
    assert.match(read("src/layouts/SolutionLayout.astro"), /ConversionTrust/);
    assert.match(read("src/layouts/ProductLayout.astro"), /defaultCtaActions/);
  });
});
