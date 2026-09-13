/**
 * Planned-locale guard (Wave 7 / C1).
 *
 * A locale with `status: "planned"` exists in ALL_LOCALES so that everything
 * downstream can be TYPED for it (Market, compliance, city stubs) while
 * nothing is EMITTED for it: the exported `locales` array is the filter that
 * every routing, hreflang, sitemap, picker, OG and gate surface derives from.
 * These tests pin the contract at source level; scripts/gates/check-planned.mjs
 * pins it on the built artefacts.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const loc = await loadTS(join(ROOT, "src/data/locales.ts"));
const { compliance } = await loadTS(join(ROOT, "src/data/intl/compliance.ts"));
const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));

const planned = loc.plannedLocales();
const live = loc.locales;

test("planned locales exist, are typed, and are not live", () => {
  assert.ok(planned.length >= 2, "Canada (ca-en + ca-fr) is registered as planned");
  for (const p of planned) {
    assert.ok(!live.some((l) => l.base === p.base), `${p.base} leaked into the live locale list`);
    assert.ok(!loc.localesForTarget("global").some((l) => l.base === p.base), `${p.base} leaked into localesForTarget`);
    assert.equal(p.cctld, undefined, `${p.base}: a planned locale must not claim a ccTLD`);
    assert.ok(compliance[p.market], `${p.base}: no compliance entry for market ${p.market} — it must exist before the locale can ever flip`);
  }
  const bases = loc.ALL_LOCALES.map((l) => l.base);
  assert.equal(new Set(bases).size, bases.length, "ALL_LOCALES bases are unique");
});

test("Canada flips together: ca-en and ca-fr share one status (Québec Charter of the French Language)", () => {
  const ca = loc.ALL_LOCALES.filter((l) => l.market === "ca");
  assert.equal(ca.length, 2);
  assert.equal(new Set(ca.map((l) => l.status ?? "published")).size, 1, "ca-en and ca-fr must launch in the same release");
  assert.deepEqual(ca.map((l) => l.copyLang).sort(), ["en", "fr"]);
});

test("nothing derives a planned locale", () => {
  for (const p of planned) {
    const seg = p.base.replace(/^\//, "");
    assert.ok(!loc.pageRoutesForTarget("global").some((r) => r.startsWith(`${seg}/`)), `${p.base}: routes derived`);
    const { alternates, xDefault } = loc.buildHreflang("");
    assert.ok(!alternates.some((a) => p.hreflang.includes(a.hreflang) || a.href.includes(p.base + "/")), `${p.base}: in the home hreflang cluster`);
    assert.ok(!xDefault.includes(p.base + "/"));
    // A visitor on a planned path resolves to the x-default, never to the planned locale.
    assert.notEqual(loc.localeFromPath(`${p.base}/about/`).base, p.base);
  }
});

test("planned-market city stubs stay unpublished until their locale is live", () => {
  for (const p of planned) {
    for (const c of intlCities.filter((c) => c.base === p.base)) {
      assert.equal(c.published, false, `${c.base}/${c.slug}: published while its locale is planned`);
    }
  }
});
