/**
 * Page-kind parity between the Australian master tree and every international
 * tree. "Build once, reuse everywhere" is only true if a page KIND added to
 * the AU tree reaches the engine — until Sep 2026 Solutions and Resources were
 * AU-only for a week with nothing to say so. This test derives both sides
 * from the registries and fails loudly on any AU kind absent from every global
 * tree unless it is on the explicit, explained allowlist.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { AU_STATIC_PAGES, localesForTarget, pagesForLocale } = await loadTS(join(ROOT, "src/data/locales.ts"));

/** AU page → the global page that is its equivalent, or null for an intentional gap. */
const EQUIVALENT = {
  "": "",
  technology: "how-it-works",     // same page kind, different slug on the engine
  blog: "resources",              // the AU guides index maps to the resources hub
  legal: null,                    // the AU legal index has no engine counterpart (three legal pages link from the footer)
  platform: null,                 // the dashboard story is AU-only until the pilot programme has one to show
};
const kindOf = (p) => p.replace(/\/[^/]+$/, (m) => (/^\/(products|solutions|resources)$/.test(p.replace(m, "")) ? "/*" : m));

test("every AU page kind exists on at least one global tree, or is an explained gap", () => {
  const globalKinds = new Set(localesForTarget("global").flatMap((l) => pagesForLocale(l)).map(kindOf));
  const gaps = [];
  for (const p of AU_STATIC_PAGES) {
    const mapped = p in EQUIVALENT ? EQUIVALENT[p] : p;
    if (mapped === null) continue;
    if (!globalKinds.has(kindOf(mapped))) gaps.push(p);
  }
  assert.deepEqual(gaps, [], `AU page kinds missing from every international tree (port them or add them to EQUIVALENT with a reason): ${gaps.join(", ")}`);
});

test("the allowlist names only pages that still exist on the AU tree", () => {
  for (const p of Object.keys(EQUIVALENT)) assert.ok(AU_STATIC_PAGES.includes(p), `EQUIVALENT lists "${p}", which the AU tree no longer emits`);
});

test("every global tree carries the core commercial kinds: home, contact, products, solutions", () => {
  for (const l of localesForTarget("global")) {
    const pages = pagesForLocale(l);
    for (const k of ["", "contact", "products", "solutions"]) assert.ok(pages.includes(k), `${l.base}: missing ${k || "home"}`);
  }
});
