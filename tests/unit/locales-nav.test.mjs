/**
 * Navigation between trees is HOST-RELATIVE; only things that name the
 * canonical host are absolute. Pinned here because the two halves live in the
 * same module and a well-meant "make it absolute" on the wrong side sent every
 * region switch on staging to production (13 Sep 2026).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const loc = await loadTS(join(ROOT, "src/data/locales.ts"));
const by = (b) => loc.locales.find((l) => l.base === b);

test("localeSwitchUrl and localeHomePath are host-relative, page-carrying, and fall back to the target's home", () => {
  assert.equal(loc.localeSwitchUrl("/gb-en/about/", by("/fr")), "/fr/about/");
  assert.equal(loc.localeSwitchUrl("/fr/products/voxtable/", by("/au-en")), "/au-en/products/voxtable/");
  assert.equal(loc.localeSwitchUrl("/au-en/sydney/", by("/fr")), "/fr/"); // AU-only page → home
  for (const l of loc.locales) {
    const home = loc.localeHomePath(l);
    assert.ok(home.startsWith(l.base) && home.endsWith("/"), `${l.base}: ${home}`);
    for (const from of loc.locales) {
      const href = loc.localeSwitchUrl(`${from.base}/contact/`, l);
      assert.doesNotMatch(href, /^https?:/, `${from.base}→${l.base}: ${href} must not carry a host`);
      assert.ok(href.startsWith(l.base + "/"), `${from.base}→${l.base}: ${href}`);
    }
  }
});

test("the canonical-host side did not move: hreflang, localeHome and abs stay absolute", () => {
  const { alternates, xDefault } = loc.buildHreflang("");
  for (const a of alternates) assert.match(a.href, /^https:\/\/biteperk\.com\//, a.href);
  assert.match(xDefault, /^https:\/\/biteperk\.com\//);
  for (const l of loc.locales) assert.equal(loc.localeHome(l), `https://biteperk.com${l.base}/`);
  assert.match(loc.AU_HOME, /^https:\/\/biteperk\.com\/au-en$/);
});
