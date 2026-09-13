/**
 * Call-simulation guard for the market homes (Wave 6.75 / L3).
 *
 * The Belgian trees carry the one demo only Belgium can run — a transcript in
 * which the caller changes language mid-call. Two things must hold for it to
 * be honest and accessible: every line spoken in the OTHER language carries a
 * BCP 47 `lang` tag (a screen reader on /be-en must not read French with
 * English phonemes), and the disclaimer frames it as design intent, because
 * the same home's FAQ says switching is what a Belgian pilot PROVES.
 * The non-Belgian transcripts must stay monolingual and untagged.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { resolveCopy, resolveShowCallSim } = await loadTS(join(ROOT, "src/data/intl/index.ts"));
const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));

const FRENCH = /\b(?:bonsoir|vous|je|nous|trois|noté|regarde)\b/i;
const ENGLISH = /\b(?:evening|the|you|three|booked|check)\b/i;

for (const l of localesForTarget("global")) {
  const cs = resolveCopy(l).callSim;
  test(`${l.base}: call-sim transcript shape and language tagging`, () => {
    assert.equal(cs.lines.length, 7, "seven lines, like the cores (bundle parity)");
    assert.ok(cs.lines[0].role === "bella" && cs.lines.at(-1).role === "bella", "Bella opens and closes");
    const pageLang = l.copyLang;
    for (const line of cs.lines) {
      const other = pageLang === "fr" ? ENGLISH : FRENCH;
      const isOther = other.test(line.text) && !(pageLang === "fr" ? FRENCH : ENGLISH).test(line.text);
      if (isOther) assert.ok(line.lang && line.lang !== pageLang, `${l.base}: untagged ${pageLang === "fr" ? "English" : "French"} line: "${line.text.slice(0, 50)}"`);
      if (line.lang) assert.notEqual(line.lang, pageLang, `${l.base}: a line tagged with the page's own language`);
    }
    if (l.market === "be") {
      assert.ok(cs.lines.some((x) => x.lang), `${l.base}: the Belgian transcript must switch language`);
      assert.ok(resolveShowCallSim(l), `${l.base}: the bilingual demo must be switched on`);
      assert.match(cs.disclaimer, /pilot|pilote/i, `${l.base}: disclaimer frames switching as what a pilot proves`);
    } else {
      assert.ok(!cs.lines.some((x) => x.lang), `${l.base}: a non-Belgian transcript is monolingual`);
    }
  });
}
