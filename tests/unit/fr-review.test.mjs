/**
 * Contract tests for the French review generators (scripts/build/).
 *
 * Why this file exists: the first versions of these two scripts were written to
 * a session scratchpad on 7 Sep 2026, never committed, and were gone the same
 * day — hours after the review they produced had been sent to Ludovic. That
 * review is the only record of which 117 lines his VERBAL pass covered, and it
 * could not be regenerated. The scripts are committed now; this test is what
 * keeps them able to do the job they were rebuilt for.
 *
 * The load-bearing assertion is the first one: the extractor must reproduce the
 * filed 7 Sep review byte for byte. That proves two things at once — the tool
 * still works, and the French in src/ has not moved since he approved it. When
 * it fails because copy changed, that is CORRECT and the fix is a new dated
 * review, never editing the filed one.
 *
 * Run: node --test tests/unit/  (wired into gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { buildReview, collectClusters, get, frChangesSince } from "../../scripts/build/extract-fr-review.mjs";
import { buildPage } from "../../scripts/build/build-review-page.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FILED = join(ROOT, "docs/ops-records/2026-09-07-french-review-ludovic.md");

/** Drop the evidence preamble and the trailing row-count comment. */
const body = (s) => {
  const i = s.indexOf("# French copy review");
  return (i === -1 ? s : s.slice(i)).replace(/\n<!-- \d+ rows -->\n?$/, "").trimEnd();
};

test("the extractor reproduces the filed 7 Sep review exactly", async () => {
  assert.ok(existsSync(FILED), `${FILED} is missing — it is cited evidence, restore it`);
  assert.equal(
    body(await buildReview()),
    body(readFileSync(FILED, "utf8")),
    "Regenerated review differs from the filed one. If the French legitimately " +
      "changed, file a NEW dated review under docs/ops-records/ and point this " +
      "test at it — do not edit the filed document, it records what was approved.",
  );
});

test("every row carries both languages and they differ", async () => {
  const clusters = await collectClusters();
  const total = clusters.reduce((n, c) => n + c.data.length, 0);
  assert.equal(total, 117, "the filed batch is 117 rows");

  for (const c of clusters) {
    assert.ok(c.data.length > 0, `cluster ${c.n} extracted no rows`);
    for (const r of c.data) {
      assert.equal(typeof r.en, "string", `cluster ${c.n}: ${r.key} has no English`);
      assert.equal(typeof r.fr, "string", `cluster ${c.n}: ${r.key} has no French`);
      assert.ok(r.fr.trim(), `cluster ${c.n}: ${r.key} French is empty`);
      // Proper nouns and shared words legitimately match ("Menu", "Contact",
      // "ABN", the transcript's role markers), so this only flags long strings —
      // where identical text means English leaked into the French bundle.
      if (r.fr.length > 60) {
        assert.notEqual(r.fr, r.en, `cluster ${c.n}: ${r.key} is English in the French column`);
      }
    }
  }
});

test("get() fails loudly on a bad path rather than emitting an empty row", () => {
  assert.throws(() => get({ a: { b: "x" } }, "a.nope.c"), /broke at "nope"/);
  assert.throws(() => get({ a: { b: 7 } }, "a.b"), /expected string/);
  assert.equal(get({ a: [{ b: "y" }] }, "a[0].b"), "y");
});

test("the page satisfies the Artifact publishing contract", async () => {
  const html = await buildPage();
  assert.match(html, /^<title>/, "must open with <title> — the publisher scans the head for it");
  for (const tag of ["<!doctype", "<html", "<body", "</html>"]) {
    assert.ok(!html.toLowerCase().includes(tag), `page must not carry its own ${tag} — it is wrapped at publish time`);
  }
  // The CSP allows stylesheets only from fonts.googleapis.com; anything else
  // fails silently in the viewer, which is the worst possible failure mode.
  for (const href of html.match(/<link[^>]+href="([^"]+)"/g) ?? []) {
    assert.match(href, /fonts\.(googleapis|gstatic)\.com/, `disallowed external resource: ${href}`);
  }
  assert.ok(!/<script/i.test(html), "the review page needs no JS; a script would be a new failure mode");
});

test("the page renders every extracted row, with the blocker marked", async () => {
  const [html, clusters] = await Promise.all([buildPage(), collectClusters()]);
  const total = clusters.reduce((n, c) => n + c.data.length, 0);
  assert.equal((html.match(/class="row"/g) ?? []).length, total);
  assert.equal((html.match(/class="key"/g) ?? []).length, total);
  assert.equal((html.match(/class="badge"/g) ?? []).length, 1, "exactly one blocking badge");
  assert.match(html, /class="cluster is-blocking"/);
});

/* ---------------------------------------------------------------- discovery */

test("--since finds no change when diffed against the current tree", async () => {
  // The strongest invariant available without pinning a ref: the tool must
  // agree with itself. A non-empty result here means the historical checkout
  // is being loaded differently from the working tree — which is exactly the
  // bug that made every string in copy.ts and markets.ts look new, because
  // git archive shipped src/ without the tsconfig.json their "@/" alias needs.
  const { added, changed, now } = await frChangesSince("HEAD");
  assert.deepEqual(added, [], "self-diff reported new French");
  assert.deepEqual(changed, [], "self-diff reported changed French");
  assert.ok(now.size > 400, `only ${now.size} French leaves found — a module failed to load`);
});

test("--since walks all three copy modules, not just the ones that load easily", async () => {
  const { now } = await frChangesSince("HEAD");
  for (const file of ["copy.ts", "products.ts", "markets.ts"]) {
    const n = [...now.keys()].filter((k) => k.startsWith(`${file}:`)).length;
    assert.ok(n > 0, `no French leaves collected from ${file}`);
  }
  // markets.ts is market-scoped: both French trees must be walked.
  for (const base of ["/fr", "/be-fr"]) {
    assert.ok(
      [...now.keys()].some((k) => k.startsWith(`markets.ts:${base}.`)),
      `markets.ts ${base} subtree not walked`,
    );
  }
});
