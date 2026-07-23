#!/usr/bin/env node
/**
 * JSON-LD integrity gate. Per BUILD_TARGET:
 *   au     → dist/:        the AU anchors (#organization, #website, #vox,
 *            per-city #service) + byte-exact Haymarket NAP.
 *   global → dist-global/: the SHARED org @id (AU-anchored, merges the two
 *            properties into one entity), the per-host #website, and the
 *            ABSENCE of LocalBusiness / NAP / geo / areaServed (those are AU's).
 * Run after a build: node scripts/check-schema.mjs
 * (set BUILD_TARGET=global for the global pass).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const AU = "https://biteperk.com.au";
const GLOBAL = "https://biteperk.com";
const DIST = TARGET === "global" ? "dist-global" : "dist";

const blocks = (path) => {
  const html = readFileSync(join(ROOT, DIST, path), "utf8");
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
    (m) => JSON.parse(m[1]) // throws (fails the gate) on malformed JSON-LD
  );
};
const graphOf = (path) => blocks(path).flatMap((b) => b["@graph"] ?? [b]);
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

if (TARGET === "global") {
  // Shared, AU-anchored org @id (entity merge) present on both locale homes.
  expect("en/index.html", `${AU}/#organization`);
  expect("fr/index.html", `${AU}/#organization`);
  // Per-host WebSite node.
  expect("en/index.html", `${GLOBAL}/#website`);

  // The global org must be Organization-only with NO local-business signals.
  const org = graphOf("en/index.html").find((n) => n["@id"] === `${AU}/#organization`);
  const types = [].concat(org?.["@type"] ?? []);
  if (types.includes("LocalBusiness")) {
    console.error("FAIL  global org is a LocalBusiness (must be Organization only)");
    failed++;
  } else {
    console.log("PASS  global org is Organization-only (no LocalBusiness)");
  }
  const leaks = ["address", "geo", "areaServed"].filter((k) => org && k in org);
  if (leaks.length) {
    console.error(`FAIL  global org carries AU-local signals: ${leaks.join(", ")}`);
    failed++;
  } else {
    console.log("PASS  global org carries no NAP / geo / areaServed");
  }

  // AU facts must not leak into ANY international page (PLAN.md §8): the AU
  // phone numbers, the Haymarket NAP, and the AUD price are Australia's. This
  // sweeps every built HTML file, so a future page/component can't reintroduce
  // them unnoticed.
  const FORBIDDEN = ["5504 1140", "7501 1140", "Pitt Street", "Haymarket", "$80"];
  const allHtml = (function walk(dir, acc = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, acc);
      else if (e.name.endsWith(".html")) acc.push(p);
    }
    return acc;
  })(join(ROOT, DIST));
  let leaked = 0;
  for (const f of allHtml) {
    const html = readFileSync(f, "utf8");
    for (const s of FORBIDDEN) {
      if (html.includes(s)) {
        console.error(`FAIL  AU-only string "${s}" leaked into ${f.slice(join(ROOT, DIST).length + 1)}`);
        failed++;
        leaked++;
      }
    }
  }
  if (!leaked) console.log(`PASS  no AU phone / NAP / price in any of ${allHtml.length} global pages`);
} else {
  // Anchors that must never drift (v1 baseline: docs/v1-baseline/schema/).
  expect("index.html", `${AU}/#organization`);
  expect("index.html", `${AU}/#website`);
  expect("products/index.html", `${AU}/products/#vox`);
  expect("sydney/index.html", `${AU}/#organization`); // Service.provider link
  expect("sydney/index.html", `${AU}/sydney/#service`);
  expect("melbourne/index.html", `${AU}/melbourne/#service`);

  // NAP must stay byte-identical to site.ts (local-pack anchor).
  const org = graphOf("index.html").find((n) => n["@id"] === `${AU}/#organization`);
  const nap = org?.address;
  if (nap?.streetAddress !== "Level 1, 477 Pitt Street" || nap?.addressLocality !== "Haymarket") {
    console.error(`FAIL  Organization NAP drifted: ${JSON.stringify(nap)}`);
    failed++;
  } else {
    console.log("PASS  Organization NAP intact (Level 1, 477 Pitt Street, Haymarket)");
  }
}

if (failed) {
  console.error(`\ncheck-schema (${TARGET}): ${failed} failure(s).`);
  process.exit(1);
}
console.log(`\ncheck-schema (${TARGET}): all anchors intact.`);
