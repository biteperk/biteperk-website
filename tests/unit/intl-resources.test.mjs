/**
 * Contract tests for the international resources collection
 * (src/content/intl-resources/<lang>/*.md) and its furniture (intl/resources.ts).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../../scripts/build/_load-ts.mjs";
import { intlResourcePosts } from "../../scripts/build/content-index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { localesForTarget, intlResourcePaths } = await loadTS(join(ROOT, "src/data/locales.ts"));
const { liveSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
const { RESOURCE_TYPES } = await loadTS(join(ROOT, "src/data/resources.ts"));
const { intlResources } = await loadTS(join(ROOT, "src/data/intl/resources.ts"));
const bases = localesForTarget("global").map((l) => l.base);

test("intl resources: every article has a valid type, a language matching its folder, real markets, live solutions", () => {
  const posts = intlResourcePosts();
  assert.ok(posts.length >= 1, "at least one article");
  for (const p of posts) {
    assert.ok(RESOURCE_TYPES.includes(p.type), `${p.lang}/${p.slug}: type ${p.type}`);
    assert.ok(["en", "fr"].includes(p.lang), `${p.lang}/${p.slug}: lang`);
    assert.ok(p.markets.length >= 1, `${p.lang}/${p.slug}: no markets`);
    for (const m of p.markets) assert.ok(bases.includes(m), `${p.lang}/${p.slug}: market ${m} is not a global base`);
    const langOfBase = (b) => localesForTarget("global").find((l) => l.base === b).copyLang;
    for (const m of p.markets) assert.equal(langOfBase(m), p.lang, `${p.lang}/${p.slug}: market ${m} serves ${langOfBase(m)}, article is ${p.lang}`);
    assert.ok(p.relatedSolutions.length >= 1, `${p.lang}/${p.slug}: no relatedSolutions`);
    for (const s of p.relatedSolutions) assert.ok(liveSolutions().some((x) => x.slug === s), `${p.lang}/${p.slug}: "${s}" is not a live solution`);
  }
});

test("intl resources: routes derive per base — hub + populated categories + articles, nothing on a tree without articles", () => {
  for (const b of bases) {
    const paths = intlResourcePaths(b);
    const posts = intlResourcePosts().filter((p) => !p.draft && p.markets.includes(b));
    if (posts.length === 0) assert.deepEqual(paths, [], `${b}: no articles → no resources routes`);
    else {
      assert.ok(paths.includes("resources"), `${b}: hub`);
      assert.equal(paths.filter((x) => x.split("/").length === 3).length, posts.length, `${b}: one route per article`);
    }
  }
});

test("intl resources furniture: every type labelled in both languages; French is not English", () => {
  for (const lang of ["en", "fr"]) for (const t of RESOURCE_TYPES) assert.ok(intlResources[lang].types[t]?.plural, `${lang}: ${t}`);
  assert.notEqual(intlResources.fr.h1, intlResources.en.h1);
  assert.notEqual(intlResources.fr.lede, intlResources.en.lede);
});
