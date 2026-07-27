/**
 * Contract tests for the intl copy merge (src/data/intl/index.ts).
 *
 * The one rule that must never regress: ARRAYS REPLACE WHOLESALE. If an
 * override deep-merged arrays element-wise, a market override that shortens
 * a list (e.g. 3 pilot points over a 4-point core) would leave stale core
 * items dangling off the end — exactly the subtle copy corruption this file
 * exists to catch.
 *
 * Run: node --test tests/unit/  (wired into gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const intl = await loadTS(join(ROOT, "src/data/intl/index.ts"));
const loc = await loadTS(join(ROOT, "src/data/locales.ts"));

test("merge: arrays replace wholesale — a shorter override leaves no stale tail", () => {
  const base = { pilot: { points: ["a", "b", "c", "d"], cta: "go" } };
  const out = intl.merge(base, { pilot: { points: ["x", "y"] } });
  assert.deepEqual(out.pilot.points, ["x", "y"]);
  assert.equal(out.pilot.cta, "go"); // untouched sibling survives
});

test("merge: nested objects recurse; primitives replace; base is not mutated", () => {
  const base = { a: { b: 1, c: 2 }, d: "keep" };
  const out = intl.merge(base, { a: { b: 9 } });
  assert.deepEqual(out, { a: { b: 9, c: 2 }, d: "keep" });
  assert.deepEqual(base, { a: { b: 1, c: 2 }, d: "keep" });
});

test("merge: undefined override returns base unchanged", () => {
  const base = { a: 1 };
  assert.equal(intl.merge(base, undefined), base);
});

test("resolveCopy: every global locale resolves a complete bundle in its language", () => {
  for (const l of loc.localesForTarget("global")) {
    const c = intl.resolveCopy(l);
    for (const k of ["chrome", "home", "howItWorks", "about", "contact", "privacy", "terms"]) {
      assert.ok(c[k], `${l.base} missing bundle key ${k}`);
    }
    assert.ok(c.home.h1.length > 0, `${l.base} home.h1 empty`);
    assert.ok(c.home.pilot.points.length >= 3, `${l.base} pilot points suspiciously short`);
  }
});

test("resolveCopy: market overrides land (gb-en pilot is UK, be-fr stays French)", () => {
  const g = loc.locales.find((l) => l.base === "/gb-en");
  const bf = loc.locales.find((l) => l.base === "/be-fr");
  const f = loc.locales.find((l) => l.base === "/fr");
  assert.match(intl.resolveCopy(g).home.pilot.eyebrow, /UK/);
  assert.match(intl.resolveCopy(bf).home.pilot.eyebrow, /Belgique/);
  // France touches must NOT leak into be-fr (core stays market-neutral).
  assert.doesNotMatch(intl.resolveCopy(bf).home.title, /France/);
  assert.match(intl.resolveCopy(f).home.pilot.eyebrow, /France/);
});

test("localeSwitchUrl: global→global carries every intl page; AU-only pages fall back", () => {
  const fr = loc.locales.find((l) => l.base === "/fr");
  const au = loc.locales.find((l) => l.base === "/au-en");
  // The F3 case: how-it-works exists in all global locales…
  assert.equal(
    loc.localeSwitchUrl("/gb-en/how-it-works/", fr),
    "https://biteperk.com/fr/how-it-works/",
  );
  // …but not in AU → falls back to the AU home.
  assert.equal(loc.localeSwitchUrl("/gb-en/how-it-works/", au), "https://biteperk.com/au-en/");
  // Cross-target shared page still carries.
  assert.equal(loc.localeSwitchUrl("/au-en/contact/", fr), "https://biteperk.com/fr/contact/");
  // Product pages exist on BOTH trees, so a switch carries — in both
  // directions. The FR→AU half is the one that regressed silently when the
  // intl product pages landed: the page existed on /au-en all along, but
  // SHARED_PAGE_PATHS didn't list it, so the picker dropped you on the AU home.
  assert.equal(
    loc.localeSwitchUrl("/au-en/products/voxtable/", fr),
    "https://biteperk.com/fr/products/voxtable/",
  );
  assert.equal(
    loc.localeSwitchUrl("/fr/products/voxtable/", au),
    "https://biteperk.com/au-en/products/voxtable/",
  );

  // A genuinely AU-only page still falls back to the target's home.
  assert.equal(loc.localeSwitchUrl("/au-en/sydney/", fr), "https://biteperk.com/fr/");
  assert.equal(loc.localeSwitchUrl("/au-en/blog/", fr), "https://biteperk.com/fr/");
});
