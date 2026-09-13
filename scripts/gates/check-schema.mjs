#!/usr/bin/env node
/**
 * JSON-LD integrity gate. Per BUILD_TARGET:
 *   au     → dist/:        the AU anchors (#organization, #website, #vox,
 *            per-city #service) + byte-exact Surry Hills NAP.
 *   global → dist-global/: the SHARED org @id (AU-anchored, merges the two
 *            properties into one entity), the per-host #website, and the
 *            ABSENCE of LocalBusiness / NAP / geo / areaServed (those are AU's).
 * Run after a build: node scripts/gates/check-schema.mjs
 * (set BUILD_TARGET=global for the global pass).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
// Single-domain rev.3: the AU entity anchors to biteperk.com/au-en (the AU
// home), shared across both builds so Google merges the properties.
const AU = "https://biteperk.com/au-en";
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

// Owned social profiles, from the SSOT. EVERY profile must be in the org's
// sameAs on both targets — including ones deliberately not rendered in the
// footer (`visible: false`). sameAs is the entity-consolidation signal and is
// independent of what the page shows; the two got wired to the same array once
// and a profile silently vanished from search when its icon was pulled.
const { site } = await import("../build/_load-ts.mjs").then((m) =>
  m.loadTS(join(ROOT, "src/data/site.ts")),
);
const expectSameAs = (page, orgId) => {
  const org = graphOf(page).find((n) => n["@id"] === orgId);
  const sameAs = [].concat(org?.sameAs ?? []);
  const missing = site.social.map((s) => s.url).filter((u) => !sameAs.includes(u));
  if (missing.length) {
    console.error(`FAIL  ${page}: org sameAs is missing ${missing.join(", ")}`);
    failed++;
  } else {
    console.log(`PASS  ${page}: org sameAs carries all ${site.social.length} social profile(s)`);
  }
};

if (TARGET === "global") {
  // Every global locale home (derived from locales.ts — hardcoding en/fr here
  // would leave new locales unchecked): shared AU-anchored org @id (entity
  // merge) + Organization-only with NO local-business signals. This is the
  // structured-data half of the Europe-truthful rules, per market.
  const { localesForTarget } = await import("../build/_load-ts.mjs").then((m) =>
    m.loadTS(join(ROOT, "src/data/locales.ts")),
  );
  for (const l of localesForTarget("global")) {
    const page = `${l.base.replace(/^\//, "")}/index.html`;
    expect(page, `${AU}/#organization`);

    const org = graphOf(page).find((n) => n["@id"] === `${AU}/#organization`);
    const types = [].concat(org?.["@type"] ?? []);
    if (types.includes("LocalBusiness")) {
      console.error(`FAIL  ${page}: global org is a LocalBusiness (must be Organization only)`);
      failed++;
    } else {
      console.log(`PASS  ${page}: org is Organization-only`);
    }
    const leaks = ["address", "geo", "areaServed"].filter((k) => org && k in org);
    if (leaks.length) {
      console.error(`FAIL  ${page}: global org carries AU-local signals: ${leaks.join(", ")}`);
      failed++;
    } else {
      console.log(`PASS  ${page}: org carries no NAP / geo / areaServed`);
    }
    expectSameAs(page, `${AU}/#organization`);

    // Biteperk Ltd, the UK subsidiary — asserted on /gb-en and asserted ABSENT
    // everywhere else. Both halves matter:
    //
    //   present on /gb-en, as its OWN node — the check just above (no address on
    //   the AU-anchored org) guards the shared entity and must keep its teeth,
    //   so the UK address lives on a separate @id linked by parentOrganization.
    //
    //   absent elsewhere — a London postal address on /fr or /be-* would be true
    //   and still wrong. The Europe-truthful rule is that a market page carries
    //   no presence signal for a country there is no presence in, and structured
    //   data is part of the page.
    const uk = graphOf(page).find((n) => n["@id"] === `${GLOBAL}/#uk`);
    if (l.market !== "gb") {
      if (uk) {
        console.error(`FAIL  ${page}: carries the UK entity node outside the UK tree`);
        failed++;
      } else {
        console.log(`PASS  ${page}: no UK entity node (correct — not the UK tree)`);
      }
    } else if (!uk) {
      console.error(`FAIL  ${page}: missing UK subsidiary node ${GLOBAL}/#uk`);
      failed++;
    } else {
      const a = uk.address ?? {};
      const wrong =
        a.streetAddress !== "124 City Road" ||
        a.addressLocality !== "London" ||
        a.postalCode !== "EC1V 2NX" ||
        a.addressCountry !== "GB";
      if (wrong) {
        console.error(`FAIL  ${page}: UK registered office drifted: ${JSON.stringify(a)}`);
        failed++;
      } else {
        console.log(`PASS  ${page}: UK registered office intact (124 City Road, London EC1V 2NX)`);
      }
      if ("telephone" in uk) {
        console.error(`FAIL  ${page}: UK node carries a telephone (no UK line exists)`);
        failed++;
      }
      if (uk.parentOrganization?.["@id"] !== `${AU}/#organization`) {
        console.error(`FAIL  ${page}: UK node is not linked to the parent org`);
        failed++;
      }
    }
  }
  // Per-host WebSite node (one spot-check on the x-default home).
  expect("en/index.html", `${GLOBAL}/#website`);

  // Market city pages (derived from intl/cities.ts): each published city must
  // declare its #service, link it to the AU-anchored org via provider, and —
  // the structured-data half of the no-fake-presence rule — carry NONE of
  // offers / areaServed / geo / address on that node. The AU city Service has
  // all four; copying it here is the exact failure this guards against.
  const { intlCities } = await import("../build/_load-ts.mjs").then((m) =>
    m.loadTS(join(ROOT, "src/data/intl/cities.ts")),
  );
  for (const c of intlCities.filter((x) => x.published)) {
    const page = `${c.base.replace(/^\//, "")}/${c.slug}/index.html`;
    const serviceId = `${GLOBAL}${c.base}/${c.slug}/#service`;
    expect(page, serviceId);
    expect(page, `${AU}/#organization`); // Service.provider entity link

    const svc = graphOf(page).find((n) => n["@id"] === serviceId);
    const leaks = ["offers", "areaServed", "geo", "address", "telephone"].filter(
      (k) => svc && k in svc,
    );
    if (leaks.length) {
      console.error(`FAIL  ${page}: city Service carries AU-only signals: ${leaks.join(", ")}`);
      failed++;
    } else {
      console.log(`PASS  ${page}: city Service is presence-free (no offers/areaServed/geo/address)`);
    }
  }
} else {
  // Every AU page except the home carries EXACTLY ONE BreadcrumbList, and its
  // length equals the rendered trail. Added 13 Sep 2026 after a truncated
  // Breadcrumbs.astro shipped a build with no breadcrumbs — visual or
  // structured — on any page, and nothing noticed: check-routes saw pages,
  // axe saw no violation, and this gate asserted six @ids on four pages.
  {
    const { readdirSync, statSync } = await import("node:fs");
    const walk = (dir) => readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p) : n === "index.html" ? [p] : [];
    });
    let crumbPages = 0;
    for (const file of walk(join(ROOT, DIST))) {
      const rel = file.slice(join(ROOT, DIST).length + 1);
      if (rel === "index.html" || rel.startsWith("kitchen-sink") || rel.startsWith("404")) continue;
      const html = readFileSync(file, "utf8");
      const lists = graphOf(rel).filter((n) => n["@type"] === "BreadcrumbList");
      const rendered = (html.match(/<nav class="crumbs"[\s\S]*?<\/nav>/)?.[0].match(/<li>/g) ?? []).length;
      if (lists.length !== 1) { console.error(`FAIL  ${rel}: ${lists.length} BreadcrumbList nodes (expected 1)`); failed++; continue; }
      if (lists[0].itemListElement.length !== rendered) {
        console.error(`FAIL  ${rel}: BreadcrumbList has ${lists[0].itemListElement.length} items, the rendered trail has ${rendered}`);
        failed++;
      } else crumbPages++;
    }
    console.log(`PASS  ${crumbPages} pages carry one BreadcrumbList matching the rendered trail`);
  }
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
  if (nap?.streetAddress !== "Level 1/457-459 Elizabeth Street" || nap?.addressLocality !== "Surry Hills") {
    console.error(`FAIL  Organization NAP drifted: ${JSON.stringify(nap)}`);
    failed++;
  } else {
    console.log("PASS  Organization NAP intact (Level 1/457-459 Elizabeth Street, Surry Hills)");
  }
  expectSameAs("index.html", `${AU}/#organization`);
}

if (failed) {
  console.error(`\ncheck-schema (${TARGET}): ${failed} failure(s).`);
  process.exit(1);
}
console.log(`\ncheck-schema (${TARGET}): all anchors intact.`);
