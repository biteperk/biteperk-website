/**
 * TrustPanel + consent copy (rev. 6 Sep 2026).
 *
 * The parity tests in intl-merge.test.mjs prove the SHAPE of every bundle and
 * that French is not English. They cannot prove that the facts strip tells the
 * truth. These can:
 *
 *   - the strip says where data goes in words that match the privacy notice
 *     (Australia for records, the United States for live calls) — on EVERY
 *     tree, in that tree's language;
 *   - only /gb-en cites UK GDPR, and it does;
 *   - none of the new copy makes a claim check-truthful bans (EU hosting,
 *     human oversight, certification) — the gate reads dist-global, this reads
 *     the source, so a bad edit fails before a build exists;
 *   - the consent notice differs between the two languages and covers the
 *     same category ids consent.ts declares.
 *
 * Run: node --test tests/unit/intl-trust.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const intl = await loadTS(join(ROOT, "src/data/intl/index.ts"));
const loc = await loadTS(join(ROOT, "src/data/locales.ts"));
const consent = await loadTS(join(ROOT, "src/data/consent.ts"));

const globalLocales = () => loc.localesForTarget("global");

const BANNED = [
  /europe-west\d/i,
  /hosted\s+in\s+(?:Paris|the\s+EU|Europe)/i,
  /héberg\w*\s+(?:à\s+Paris|dans\s+l['’]UE|en\s+Europe)/i,
  /human\s+oversight|supervision\s+humaine/i,
  /\bcertified\b|\bcertifié/i,
  /\+\s?(?:44|33|32)\s?\d/,
];

function leaves(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object") Object.values(value).forEach((v) => leaves(v, out));
  return out;
}

test("trustFacts: every tree names both data locations in its own language", () => {
  for (const l of globalLocales()) {
    const tf = intl.resolveCopy(l).trustFacts;
    for (const [k, v] of Object.entries(tf)) {
      assert.ok(typeof v === "string" && v.trim().length > 0, `${l.base} trustFacts.${k} is empty`);
    }
    const au = l.copyLang === "fr" ? /Australie/ : /Australia/;
    const us = l.copyLang === "fr" ? /États-Unis/ : /United States/;
    assert.match(tf.records, au, `${l.base}: records must say where records are stored`);
    assert.match(tf.records, us, `${l.base}: records must say where live calls are processed`);
  }
});

test("trustFacts: only /gb-en cites UK GDPR", () => {
  for (const l of globalLocales()) {
    const basis = intl.resolveCopy(l).trustFacts.basis;
    if (l.market === "gb") assert.match(basis, /UK GDPR/, "the UK tree must cite its own statute");
    else assert.doesNotMatch(basis, /UK GDPR/, `${l.base} must not cite UK GDPR`);
  }
});

test("trustFacts + consent: no banned European claim in the source", () => {
  for (const l of globalLocales()) {
    const c = intl.resolveCopy(l);
    for (const s of [...leaves(c.trustFacts), ...leaves(c.chrome.consent)]) {
      for (const re of BANNED) assert.doesNotMatch(s, re, `${l.base}: "${s.slice(0, 60)}…"`);
    }
  }
});

test("consent copy: French is not English, and category ids match consent.ts", () => {
  const en = intl.resolveCopy(globalLocales().find((l) => l.base === "/en")).chrome.consent;
  const fr = intl.resolveCopy(globalLocales().find((l) => l.base === "/fr")).chrome.consent;
  for (const k of ["body", "accept", "reject", "settings", "modalTitle", "modalLede", "save"]) {
    assert.notEqual(fr[k], en[k], `consent.${k} is still English on the French trees`);
  }
  const ids = consent.categories.map((c) => c.id).sort();
  assert.deepEqual(Object.keys(en.categories).sort(), ids);
  assert.deepEqual(Object.keys(fr.categories).sort(), ids);
  // English titles/bodies are consent.ts's own — one source, no drift.
  for (const c of consent.categories) {
    assert.equal(en.categories[c.id].title, c.title);
    assert.equal(en.categories[c.id].body, c.body);
  }
});
