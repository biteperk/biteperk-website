#!/usr/bin/env node
/**
 * UK statutory disclosure gate over the GLOBAL build (dist-global/gb-en/**).
 *
 * Biteperk Ltd (company 17379647, registered in England and Wales) is the
 * contracting party and data controller for UK customers. Two instruments
 * impose website-disclosure duties on it, and this gate is the enforcement:
 *
 *   SI 2015/17 reg 24-25 (Companies Act 2006 s.82) — registered name, the part
 *   of the UK it is registered in, its registered number and its registered
 *   office must be disclosed ON ITS WEBSITES. "Websites", not "a page": the
 *   footer is the only surface guaranteed on every page, so EVERY /gb-en page
 *   is checked, not just the legal ones.
 *
 *   E-Commerce Regulations 2002 reg 6 — the name, the geographic address of
 *   establishment, an ELECTRONIC MAIL ADDRESS allowing rapid and direct
 *   communication, and trade-register details must be "easily, directly and
 *   permanently accessible". A contact form does not satisfy reg 6(1)(c); that
 *   is why the email is asserted rather than assumed.
 *
 * This is a POSITIVE gate — it asserts things are present. Most gates in this
 * repo are negative (check-truthful, check-claims), and a positive one fails
 * differently: it can pass vacuously if the file list comes back empty. Hence
 * the explicit page-count floor at the bottom.
 *
 * Deliberately NOT part of check-truthful: that gate sweeps for AU facts
 * leaking into Europe and must stay a pure deny-list. Two of its rules are
 * load-bearing here and must never be relaxed to accommodate the UK entity —
 * the `+44` ban (no UK phone line exists; reg 6 wants an email, not a number)
 * and the "our London office/team/staff" ban (a registered office is not a
 * premises and not staff).
 *
 * Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-uk-disclosure.mjs
 * Fault-inject before trusting: UK_DIST points it at a fixture directory.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// resolve(), not join(), so an absolute UK_DIST override works for fixtures.
const DIST = resolve(ROOT, process.env.UK_DIST ?? "dist-global");
const TREE = join(DIST, "gb-en");

if (!existsSync(TREE)) {
  console.error(`check-uk-disclosure: ${TREE} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

const { entities, ukEmail } = await loadTS(join(ROOT, "src/data/site.ts"));
const uk = entities.uk;

function htmlFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

// Built HTML joins address parts with &nbsp; in places, so match tolerantly on
// whitespace — the same U+00A0 trap check-truthful documents.
const rx = (s) =>
  new RegExp(
    s
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("[\\s ]+"),
    "i",
  );

// Reg 25: required on EVERY page of the UK tree (it lives in the footer).
const EVERY_PAGE = [
  { label: "registered name", re: rx(uk.legalName) },
  { label: "place of registration", re: rx(uk.placeOfRegistration) },
  { label: "company number", re: rx(uk.registerNumber) },
  { label: "registered office street", re: rx(uk.office.street) },
  { label: "registered office postcode", re: rx(uk.office.postalCode) },
];

// Reg 6: required on the dedicated company-details page.
const DETAILS_PAGE = [
  { label: "electronic mail address (reg 6(1)(c))", re: rx(ukEmail.display) },
  { label: "trade register link (reg 6(1)(d))", re: rx(uk.registerUrl) },
  { label: "locality", re: rx(uk.office.locality) },
];

const pages = htmlFiles(TREE);
let failed = 0;

for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");
  for (const { label, re } of EVERY_PAGE) {
    if (!re.test(html)) {
      console.error(`FAIL  ${rel}: missing ${label}`);
      failed++;
    }
  }
  // No VAT number may be claimed: Biteperk Ltd is not VAT-registered, and reg
  // 6(1)(f) only requires one where the activity is VAT-liable. A fabricated or
  // stale VAT number is a worse disclosure than none.
  if (/\bVAT\s*(?:registration\s*)?(?:no\.?|number|reg\.?)\s*[:#]?\s*GB\s*\d/i.test(html)) {
    console.error(`FAIL  ${rel}: claims a VAT registration number (none exists)`);
    failed++;
  }
}

const detailsPage = join(TREE, "legal", "company-details", "index.html");
if (!existsSync(detailsPage)) {
  console.error("FAIL  gb-en/legal/company-details/index.html is missing");
  failed++;
} else {
  const html = readFileSync(detailsPage, "utf8");
  for (const { label, re } of DETAILS_PAGE) {
    if (!re.test(html)) {
      console.error(`FAIL  gb-en/legal/company-details: missing ${label}`);
      failed++;
    }
  }
}

// A positive gate that finds no pages passes vacuously. This repo has shipped
// gates that checked nothing; the floor makes that impossible here.
if (pages.length < 10) {
  console.error(`FAIL  check-uk-disclosure: only ${pages.length} page(s) found — the sweep is not covering the tree.`);
  failed++;
}

if (failed) {
  console.error(`\ncheck-uk-disclosure: ${failed} failure(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(
  `check-uk-disclosure: ${pages.length} /gb-en page(s) carry the reg 25 particulars; ` +
    `company-details carries the reg 6 contact and register details; no VAT number claimed.`,
);
