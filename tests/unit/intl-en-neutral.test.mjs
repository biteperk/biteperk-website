/**
 * /en is the x-default: the tree served to the United States and every region
 * no market tree claims. Its prose must read as neither European nor
 * Australian — market colour (UK pilots, "France and Belgium", GDPR as *the*
 * lawful basis) belongs in the market overrides. Until 13 Sep 2026 the EN core
 * carried all three, so a Toronto reader was told she was in Europe.
 *
 * Source-level twin of the check-truthful "European framing on the x-default"
 * rule (which reads dist-global/): this one runs without a build and names the
 * copy key, so a regression is found at `npm test` time, not after a build.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { resolveCopy, resolveRegions } = await loadTS(join(ROOT, "src/data/intl/index.ts"));
const { locales, localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));
const { complianceFor } = await loadTS(join(ROOT, "src/data/intl/compliance.ts"));

const en = locales.find((l) => l.base === "/en");
const EUROPEAN = /\bEurop(?:e|ean)\b|\bFrance and Belgium\b|\bthe UK\b|\bBritish\b|\bBelgian\b/;
// The legal bundles must name the GDPR/EU — they are the pages that say which law applies.
const LEGAL_KEYS = new Set(["privacy", "terms", "cookies", "companyDetails"]);

function leaves(node, path = []) {
  if (typeof node === "string") return [[path.join("."), node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => leaves(v, [...path, String(i)]));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => leaves(v, [...path, k]));
  return [];
}

test("/en: no European framing outside the legal pages", () => {
  const bundle = resolveCopy(en);
  const offenders = Object.entries(bundle)
    .filter(([k]) => !LEGAL_KEYS.has(k))
    .flatMap(([k, v]) => leaves(v, [k]))
    .filter(([, s]) => EUROPEAN.test(s));
  assert.deepEqual(offenders.map(([k, s]) => `${k}: ${s.slice(0, 80)}`), []);
});

test("/en: the compliance registry strings it renders (time-zone note, law) carry no European framing", () => {
  const c = complianceFor(en.market);
  for (const s of [c.timeZoneNote.en, c.timeZoneNote.fr, c.law.en]) assert.doesNotMatch(s, /\bEurop(?:e|ean|éen|éenne)s?\b|\beuropéen/i, s);
});

test("/en: the GDPR is named only as conditional ('where it applies'), never as the basis", () => {
  const bundle = resolveCopy(en);
  for (const [k, s] of Object.entries(bundle).filter(([k]) => !LEGAL_KEYS.has(k)).flatMap(([k, v]) => leaves(v, [k]))) {
    if (/\bGDPR\b/.test(s)) assert.match(s, /where (?:it|the GDPR) applies/i, `${k}: "${s.slice(0, 100)}"`);
  }
});

test("region router: only the x-default carries one, and it can reach every other launched tree", () => {
  for (const l of localesForTarget("global")) {
    const r = resolveRegions(l);
    if (l.base === "/en") {
      assert.ok(r?.eyebrow && r.heading && r.body, "/en carries the router copy");
      assert.doesNotMatch(`${r.eyebrow} ${r.heading} ${r.body}`, EUROPEAN);
    } else assert.equal(r, undefined, `${l.base}: only /en routes by region`);
  }
  // Every label is already in its own language — that is what the router renders.
  for (const l of locales) assert.ok(l.label.includes("—"), `${l.base}: label "${l.label}" is not "<Region> — <Language>"`);
});
