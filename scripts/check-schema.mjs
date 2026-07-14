#!/usr/bin/env node
/**
 * JSON-LD integrity gate over dist/. Asserts the stable @ids that anchor
 * Biteperk's knowledge graph never drift, and that every JSON-LD block on
 * key pages parses. Run after `astro build`: node scripts/check-schema.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://biteperk.com.au";

const blocks = (path) => {
  const html = readFileSync(join(ROOT, "dist", path), "utf8");
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (m) => JSON.parse(m[1]) // throws (fails the gate) on malformed JSON-LD
  );
};
const ids = (objs) => {
  const found = new Set();
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === "object") {
      if (typeof o["@id"] === "string") found.add(o["@id"]);
      Object.values(o).forEach(walk);
    }
  };
  walk(objs);
  return found;
};

let failed = 0;
const expect = (page, id) => {
  const has = ids(blocks(page)).has(id);
  console.log(`${has ? "PASS" : "FAIL"}  ${page} declares/references ${id}`);
  if (!has) failed++;
};

// Anchors that must never drift (v1 baseline: docs/v1-baseline/schema/).
expect("index.html", `${SITE}/#organization`);
expect("index.html", `${SITE}/#website`);
expect("products/index.html", `${SITE}/products/#voco`);
expect("sydney/index.html", `${SITE}/#organization`); // Service.provider link
expect("sydney/index.html", `${SITE}/sydney/#service`);
expect("melbourne/index.html", `${SITE}/melbourne/#service`);

// NAP must stay byte-identical to site.ts (local-pack anchor).
const org = blocks("index.html")
  .flatMap((b) => b["@graph"] ?? [b])
  .find((n) => n["@id"] === `${SITE}/#organization`);
const nap = org?.address;
if (nap?.streetAddress !== "Level 1, 477 Pitt Street" || nap?.addressLocality !== "Haymarket") {
  console.error(`FAIL  Organization NAP drifted: ${JSON.stringify(nap)}`);
  failed++;
} else {
  console.log("PASS  Organization NAP intact (Level 1, 477 Pitt Street, Haymarket)");
}

if (failed) {
  console.error(`\ncheck-schema: ${failed} failure(s).`);
  process.exit(1);
}
console.log("\ncheck-schema: all anchors intact.");
