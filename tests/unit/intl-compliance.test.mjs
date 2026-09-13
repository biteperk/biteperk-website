import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { compliance } = await loadTS(join(ROOT, "src/data/intl/compliance.ts"));
const { locales } = await loadTS(join(ROOT, "src/data/locales.ts"));

test("compliance registry: every locale's market has an entry with both languages, an https authority (or none for the x-default), and the audience mailbox", () => {
  for (const l of locales) {
    const c = compliance[l.market];
    assert.ok(c, `${l.base}: no compliance entry for market ${l.market}`);
    for (const lang of ["en", "fr"]) {
      assert.ok(c.law[lang]?.trim(), `${l.market}: law.${lang}`);
      assert.ok(c.timeZoneNote[lang]?.trim(), `${l.market}: timeZoneNote.${lang}`);
    }
    if (l.market === "int") assert.equal(c.authority, null, "x-default claims no single authority");
    else { assert.ok(c.authority, `${l.market}: authority`); assert.match(c.authority.url, /^https:\/\//); }
    if (l.market === "au") assert.match(c.contactEmail, /@biteperk\.com\.au$/);
    else assert.match(c.contactEmail, /@biteperk\.com$/, `${l.market}: international mailbox lives on @biteperk.com`);
    assert.equal(c.controller, l.market === "gb" ? "uk" : "au");
    for (const s of Object.values(c).flatMap((v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).filter((x) => typeof x === "string") : []))) {
      assert.doesNotMatch(s, /compliant|certified|conforme au/i, `${l.market}: the registry states facts, never compliance`);
    }
  }
});
