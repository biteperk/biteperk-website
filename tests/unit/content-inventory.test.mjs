/**
 * The filed inventory must be what the generator produces from the current
 * collections — the tracker is derived, never hand-kept. And the lint rules
 * that decide "blocked" must fire on the shapes they exist for.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildInventory, lintPost, loadPosts } from "../../scripts/build/content-inventory.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FILED = join(ROOT, "docs/phase1/CONTENT-INVENTORY.md");

test("docs/phase1/CONTENT-INVENTORY.md is current", async () => {
  assert.equal(readFileSync(FILED, "utf8"), await buildInventory(), "stale — run: node scripts/build/content-inventory.mjs --out docs/phase1/CONTENT-INVENTORY.md");
});

test("lintPost: a case study without an approved customer is BLOCKED; with one it passes", () => {
  const base = { title: "Short title", description: "x".repeat(140), relatedSolutions: ["restaurants"], words: 800, type: "case-study" };
  const sol = new Set(["restaurants"]);
  assert.ok(lintPost(base, sol).some((i) => i.startsWith("BLOCKED: case study")));
  assert.ok(lintPost({ ...base, customer: { name: "A", venue: "B", approved: false } }, sol).some((i) => i.startsWith("BLOCKED")));
  assert.deepEqual(lintPost({ ...base, customer: { name: "A", venue: "B", approved: true } }, sol), []);
});

test("lintPost: an industry report needs sources; thin, over-long and unlinked posts are named", () => {
  const sol = new Set(["restaurants"]);
  assert.ok(lintPost({ title: "t", description: "x".repeat(140), relatedSolutions: ["restaurants"], words: 900, type: "industry-report", sources: [] }, sol).some((i) => i.includes("without sources")));
  const bad = lintPost({ title: "A".repeat(70), description: "short", relatedSolutions: ["nope"], words: 100, type: "guide" }, sol);
  assert.ok(bad.some((i) => i.includes("no shorter seoTitle")));
  assert.ok(bad.some((i) => i.includes("description 5 chars")));
  assert.ok(bad.some((i) => i.includes('"nope" is not a solution')));
  assert.ok(bad.some((i) => i.includes("thin")));
});

test("no PUBLISHED post is blocked (the build would refuse it; the inventory must agree)", () => {
  const { au, intl } = loadPosts();
  for (const p of [...au, ...intl].filter((p) => !p.draft)) {
    assert.ok(!lintPost(p, new Set(p.relatedSolutions ?? [])).some((i) => i.startsWith("BLOCKED")), `${p.slug} is published and blocked`);
  }
});
