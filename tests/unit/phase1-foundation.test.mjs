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
    assert.match(src, /SOLUTION_PAGE_SECTIONS/);
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
    assert.equal(read("src/layouts/SolutionLayout.astro").includes("Book Demo"), true);
  });

  it("phase1 plan doc exists and locks locale rename decision", () => {
    const plan = read("docs/phase1/PLAN.md");
    assert.match(plan, /Keep `\/gb-en`/);
    assert.match(plan, /Keep `\/fr`/);
  });
});
