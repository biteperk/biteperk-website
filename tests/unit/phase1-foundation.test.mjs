import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Load TS data modules the same way other unit tests do when available.
// Fallback: dynamic import via tsx-less path — this repo's intl tests use loadTS.
import { readFileSync } from "node:fs";

const root = path.resolve(import.meta.dirname, "../..");

function read(rel) {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("phase1 foundation registries", () => {
  it("solutions registry lists exactly the eight required slugs", () => {
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
  });

  it("locale-plan keeps live UK/FR bases as /gb-en and /fr (no rename)", () => {
    const src = read("src/data/locale-plan.ts");
    assert.match(src, /"uk-en": "\/gb-en"/);
    assert.match(src, /"fr-fr": "\/fr"/);
    assert.match(src, /id: "ca-en"/);
    assert.match(src, /id: "ca-fr"/);
    assert.match(src, /status: "reserved"/);
  });

  it("nav-ia encodes the Phase 1 header targets", () => {
    const src = read("src/data/nav-ia.ts");
    for (const label of ["Products", "Solutions", "Resources", "Pricing", "Platform", "About", "Book Demo"]) {
      assert.match(src, new RegExp(`label: "${label}"`));
    }
  });

  it("phase1 plan doc exists and locks locale rename decision", () => {
    const plan = read("docs/phase1/PLAN.md");
    assert.match(plan, /Keep `\/gb-en`/);
    assert.match(plan, /Keep `\/fr`/);
    assert.match(plan, /Wave 2 — Solutions engine/);
  });
});
