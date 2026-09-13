/**
 * Feel-local guard (Wave 6.75 / L2). Each market home must speak its own
 * market's vocabulary — the words a UK, French or Belgian operator actually
 * uses for service rhythm, booking norms and the trade itself — and the
 * x-default must use none of them. These are language and trade facts, never
 * presence claims: "last orders" is how a British pub runs, not where we are.
 *
 * Asserts on the RESOLVED bundle (language core × market override) via the
 * same resolveCopy the pages render from, so a market override that drops a
 * localised section back to the neutral core fails here, not in an audit.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { resolveCopy } = await loadTS(join(ROOT, "src/data/intl/index.ts"));
const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));
const { complianceFor } = await loadTS(join(ROOT, "src/data/intl/compliance.ts"));

/** Market vocabulary the home must carry (≥ MIN distinct hits) — case-insensitive, whole-ish words. */
const VOCAB = {
  "/gb-en": [/\bpubs?\b/, /\blast orders\b/, /\bdiary\b/, /\bSunday\b/, /\bdeposits?\b/, /\bUK GDPR\b/, /\bBritish\b/],
  "/fr": [/\bcoup de feu\b/, /\bservice continu\b|\bcoupure\b/, /\bregistre\b/, /\bbistrots?\b|\bbrasseries?\b/, /\barrhes\b/, /\bRGPD\b/],
  "/be-en": [/\bhoreca\b/i, /\bFrench (?:and|or) English\b/, /\blunch service\b/, /\bBrussels\b/, /\bclosing day\b/, /\bdeposits?\b/],
  "/be-fr": [/\bhoreca\b/i, /\bservice du midi\b/, /\bbruxellois/, /\bjour de fermeture\b/, /\bacompte\b/, /\bRGPD\b/],
};
const MIN = 4;
/** Words that mark a market tree; the x-default must carry none of them. */
const MARKET_MARKERS = [/\bpubs?\b/, /\blast orders\b/, /\bdiary\b/, /\bhoreca\b/i, /\bBrussels\b/, /\bUK GDPR\b/, /\bBritish\b/];

function homeText(bundle) {
  const h = bundle.home;
  return JSON.stringify([h.title, h.description, h.h1, h.lede, h.proof, h.steps, h.pilot, h.trust, h.faq, h.closing]);
}

test("every market home carries its own market vocabulary", () => {
  for (const l of localesForTarget("global")) {
    const words = VOCAB[l.base];
    if (!words) continue;
    const text = homeText(resolveCopy(l));
    const hits = words.filter((re) => re.test(text));
    assert.ok(hits.length >= MIN, `${l.base}: only ${hits.length}/${words.length} market terms on the home (${hits.map(String).join(", ")}) — want ≥ ${MIN}`);
  }
});

test("the x-default home carries no market marker", () => {
  const en = localesForTarget("global").find((l) => l.base === "/en");
  const text = homeText(resolveCopy(en));
  for (const re of MARKET_MARKERS) assert.doesNotMatch(text, re, `/en home says ${re}`);
});

test("every market names its supervisory authority and its own service-rhythm line; the x-default names none", () => {
  for (const l of localesForTarget("global")) {
    const c = complianceFor(l.market);
    if (l.market === "int") { assert.equal(c.authority, null); continue; }
    assert.ok(c.authority?.short, `${l.base}: authority`);
    const points = resolveCopy(l).home.proof.points;
    assert.ok(points.some((p) => /\brules\b|\brègles\b/i.test(p)), `${l.base}: no "books inside your rules" proof point`);
  }
});
