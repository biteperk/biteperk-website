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
    // `cookies` was absent from this list while legal/cookies was already a
    // core page — the bundle key it depends on was untested.
    for (const k of ["chrome", "home", "howItWorks", "about", "contact", "privacy", "terms", "cookies"]) {
      assert.ok(c[k], `${l.base} missing bundle key ${k}`);
    }
    assert.ok(c.home.h1.length > 0, `${l.base} home.h1 empty`);
    assert.ok(c.home.pilot.points.length >= 3, `${l.base} pilot points suspiciously short`);
  }
});

test("resolveHero: every global locale has a hero, and no pill claims a premises", () => {
  // Before Jul 2026 the intl heroes were text-only and /en had no imagery at
  // all — on the x-default. A locale added without a hero would silently
  // reintroduce that, so require one rather than letting it default away.
  for (const l of loc.localesForTarget("global")) {
    const h = intl.resolveHero(l);
    assert.ok(h, `${l.base} has no hero image`);
    assert.ok(h.slug && h.alt, `${l.base} hero missing slug or alt`);
    // Alt text is per-language: the French trees must not ship English alts.
    if (l.copyLang === "fr") {
      assert.match(h.alt, /[àâçéèêëîïôùûü]/i, `${l.base} hero alt is not French: "${h.alt}"`);
    }
    // The pill names a MARKET, never an office. "Sydney, Australia" is legal on
    // the AU tree because that address is real; nothing equivalent is true in
    // Europe, and check-truthful only sweeps the AU phone/NAP/price strings —
    // it would not catch an invented European city here.
    if (h.pill) {
      assert.doesNotMatch(
        h.pill,
        /\b(London|Paris|Brussels|Bruxelles|Manchester|Lyon|Antwerp|Anvers)\b/i,
        `${l.base} pill names a city, which reads as a local office: "${h.pill}"`,
      );
    }
  }
  // /en is the neutral x-default: it must carry no market pill.
  const en = loc.locales.find((l) => l.base === "/en");
  assert.equal(intl.resolveHero(en).pill, undefined, "/en must stay market-neutral");
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

/* ------------------------------------------------------------------------
 * Bundle parity (B6).
 *
 * TypeScript already guarantees KEY parity: `Record<Lang, ChromeCopy>` and
 * friends make a missing key a compile error. What it cannot see is the copy
 * DRIFTING while still type-checking — and `merge()` makes that easy, because
 * arrays replace wholesale, so a market override with two proof points where
 * every other tree has four is perfectly well-typed and silently ships a
 * thinner page to one market.
 * ---------------------------------------------------------------------- */

/** Structural fingerprint: every leaf path + type, and every array's length. */
function shapeOf(value, path = "", out = []) {
  if (Array.isArray(value)) {
    out.push(`${path}[]=${value.length}`);
    value.forEach((v, i) => shapeOf(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const k of Object.keys(value).sort()) shapeOf(value[k], path ? `${path}.${k}` : k, out);
  } else {
    out.push(`${path}:${typeof value}`);
  }
  return out;
}

/** Every leaf value, keyed by its path. */
function leavesOf(value, path = "", out = new Map()) {
  if (Array.isArray(value)) value.forEach((v, i) => leavesOf(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const k of Object.keys(value)) leavesOf(value[k], path ? `${path}.${k}` : k, out);
  } else out.set(path, value);
  return out;
}

const globalLocales = () => loc.localesForTarget("global");

/**
 * Paths where ONE tree is allowed to carry MORE than the reference tree.
 *
 * The rule this test enforces is "a market must not silently render less".
 * Equality was the right way to express that while every tree had the same
 * obligations. /gb-en no longer does: Biteperk Ltd (company 17379647) is
 * registered in England and Wales and is the contracting party and data
 * controller for UK customers, so its privacy notice has to carry controller
 * identity, lawful basis, a UK-transfer safeguard and the ICO complaint route,
 * and its terms have to name the contracting entity and governing law. None of
 * that is true on /fr or /be-*, where there is no local entity — putting it
 * there to satisfy a shape check would be inventing a presence.
 *
 * So EXTRA entries are tolerated here, and MISSING ones still fail. That keeps
 * the test's actual purpose (catching a shortened list) intact. This mirrors
 * how the repo already handled uneven trees elsewhere: `pagesForLocale` and
 * `buildHreflang` were made subset-aware rather than the content being
 * flattened to fit the gate.
 */
const MAY_EXCEED_REFERENCE = [/^privacy\.sections/, /^terms\.sections/];
const mayExceed = (locale, path) =>
  locale.base === "/gb-en" && MAY_EXCEED_REFERENCE.some((re) => re.test(path));

test("bundle parity: all five trees resolve the same SHAPE, only different words", () => {
  const [first, ...rest] = globalLocales();
  const reference = shapeOf(intl.resolveCopy(first));
  for (const l of rest) {
    const mine = shapeOf(intl.resolveCopy(l));
    const refSet = new Set(reference);
    const mineSet = new Set(mine);
    // `missing` stays strict even on an exceeding path: /gb-en may add sections,
    // but it may never drop one the other trees have.
    const missing = reference.filter((x) => !mineSet.has(x) && !mayExceed(l, x));
    const extra = mine.filter((x) => !refSet.has(x) && !mayExceed(l, x));
    assert.deepEqual(
      { missing, extra },
      { missing: [], extra: [] },
      `${l.base} differs in shape from ${first.base} — a market override changed the ` +
        `structure, not just the words. Arrays replace wholesale, so a shortened ` +
        `list here means that market renders fewer items than every other tree.`,
    );
  }
});

test("bundle parity: /gb-en legal pages never shrink below the shared trees", () => {
  // MAY_EXCEED_REFERENCE necessarily blinds the shape check to the whole
  // privacy.sections / terms.sections subtree on /gb-en, which would otherwise
  // let those two pages be shortened unnoticed — the exact failure the parity
  // test exists to catch. This restores the floor from the other direction:
  // the UK tree may add sections, never drop below what every other tree ships.
  const ref = globalLocales().find((l) => l.base === "/en");
  const gb = globalLocales().find((l) => l.base === "/gb-en");
  const refCopy = intl.resolveCopy(ref);
  const gbCopy = intl.resolveCopy(gb);
  for (const page of ["privacy", "terms"]) {
    assert.ok(
      gbCopy[page].sections.length >= refCopy[page].sections.length,
      `/gb-en ${page} has ${gbCopy[page].sections.length} section(s), fewer than ` +
        `/en's ${refCopy[page].sections.length}. The UK tree carries a statutory ` +
        `disclosure the others do not; it must never render less than they do.`,
    );
    for (const s of gbCopy[page].sections) {
      assert.ok(s.heading.trim() && s.body.length > 0, `/gb-en ${page} has an empty section`);
    }
  }
});

test("bundle parity: no empty or whitespace-only copy on any tree", () => {
  // An empty string type-checks perfectly and renders as a blank heading.
  for (const l of globalLocales()) {
    for (const [path, v] of leavesOf(intl.resolveCopy(l))) {
      if (typeof v !== "string") continue;
      assert.ok(v.trim().length > 0, `${l.base} has empty copy at ${path}`);
    }
  }
});

/**
 * Leaf paths where the French bundles legitimately match the English one:
 * words that are identical in both languages, plus proper nouns and the
 * shared address. Everything else matching English means a bundle was
 * copy-pasted and never translated. Adding to this list is a deliberate act —
 * check the value really is French before you do.
 */
const FR_SHARED_WITH_EN = new Set([
  "chrome.nav.contact",       // "Contact"
  "chrome.consent.categories.marketing.title", // "Marketing"
  "chrome.menu",              // "Menu" is the same word in French
  "chrome.cookies",           // "Cookies"
  "chrome.email",             // shared mailbox
  "home.testimonial.author",  // a person's name
  "callSim.whoBella",         // the persona is named Bella in every language
  "callSim.lines[5].text",    // "Ellis." — the caller's name, same in both
  "contact.eyebrow",          // "Contact"
  "chrome.notFound.contact",  // "Contact"
  "terms.sections[3].heading",
  "cookies.sections[2].heading", // "Marketing"
]);

/**
 * Paths that are STRUCTURE, not prose, and so can never be "untranslated".
 *
 * `callSim.lines[n].role` is the "bella" | "caller" discriminator the
 * component switches on to pick a speaker label and bubble side. Translating
 * it would break the render. Listing all seven in the set above would also
 * work and would be seven lines of noise that grow with the transcript.
 */
const STRUCTURAL = /\.role$/;

test("bundle parity: the French trees carry no untranslated English", () => {
  const en = leavesOf(intl.resolveCopy(globalLocales().find((l) => l.base === "/en")));
  for (const l of globalLocales().filter((x) => x.copyLang === "fr")) {
    const offenders = [];
    for (const [path, v] of leavesOf(intl.resolveCopy(l))) {
      if (typeof v !== "string" || v.length <= 3) continue;
      if (FR_SHARED_WITH_EN.has(path) || STRUCTURAL.test(path)) continue;
      if (en.get(path) === v) offenders.push(`${path} = ${JSON.stringify(v.slice(0, 70))}`);
    }
    assert.deepEqual(
      offenders,
      [],
      `${l.base} repeats the English copy verbatim at these paths — either translate ` +
        `them or, if the value really is French too, add the path to FR_SHARED_WITH_EN.`,
    );
  }
});

/* ------------------------------------------------------------------------
 * Absolute floors the parity tests above cannot express.
 *
 * Shape parity compares each tree to a reference tree, so it only ever catches
 * RELATIVE drift. If every tree loses the same thing at once, it stays silent —
 * which is exactly the failure mode for content that is supposed to be present
 * everywhere.
 * ---------------------------------------------------------------------- */

test("every market ships a real FAQ — at least 5 items on every tree", () => {
  // Load-bearing for check-intl-similarity, not just for the reader. The
  // metric is CONTAINMENT (hits / min(|a|,|b|)), so a thin tree cannot be
  // rescued by its sibling growing — both sides have to carry their own copy.
  // Shape parity would not catch all five trees dropping to two items.
  for (const l of globalLocales()) {
    const items = intl.resolveCopy(l).home.faq.items;
    assert.ok(
      items.length >= 5,
      `${l.base} home.faq has ${items.length} item(s); the floor is 5`,
    );
  }
});

test("no two markets share a home h1", () => {
  // Scoped to home.h1 ON PURPOSE. howItWorks/contact/legal h1s are legitimately
  // identical across markets ("Privacy notice" on all three English trees), so
  // a generalised "no page shares an h1" rule would fail instantly and get
  // deleted. The home h1 is the market's actual argument — two trees sharing it
  // means one was never written.
  //
  // The untranslated-English test above only compares FRENCH trees to /en, so
  // two English trees colliding is the case nothing else covers.
  const seen = new Map();
  for (const l of globalLocales()) {
    const key = intl.resolveCopy(l).home.h1.trim().replace(/\s+/g, " ").toLowerCase();
    seen.set(key, [...(seen.get(key) ?? []), l.base]);
  }
  const collisions = [...seen.entries()]
    .filter(([, bases]) => bases.length > 1)
    .map(([h1, bases]) => `${bases.join(" + ")} share: ${JSON.stringify(h1.slice(0, 60))}`);
  assert.deepEqual(collisions, [], `markets share a home h1:\n  ${collisions.join("\n  ")}`);
});
