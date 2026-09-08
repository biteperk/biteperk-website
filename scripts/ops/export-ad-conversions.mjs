#!/usr/bin/env node
/**
 * Export qualified, ad-attributed leads as a Google Ads OFFLINE CONVERSION
 * import CSV (click imports, joined on the gclid the contact forms capture).
 *
 * Why offline instead of trusting the web pixel: the pixel fires for anything
 * driving a real browser — including form spam — and consent mode loses the
 * rest. This export feeds Google only leads a first-party check calls real
 * (`quality: "ok"`, see functions/index.js), with zero new tracking on the
 * site. Upload the CSV in Google Ads → Goals → Conversions → Uploads against
 * a conversion action named EXACTLY like CONVERSION_NAME below (type: Import →
 * Clicks). Once uploads flow, make that action Primary and demote the two
 * pixel actions to Secondary — that is what stops spam poisoning bidding.
 *
 * Auth: Application Default Credentials (gcloud auth application-default
 * login as skalaliya@). The ADC file's quota project belongs to another
 * project on this machine — do NOT run set-quota-project (it would change
 * that project's attribution too); scope it per-run with the env var below.
 * The leads DB is the NAMED database `biteperk-leads` (australia-southeast1),
 * same binding functions/index.js uses — `(default)` is empty.
 *
 * Usage:
 *   GOOGLE_CLOUD_QUOTA_PROJECT=vocotable node scripts/ops/export-ad-conversions.mjs [--since=YYYY-MM-DD]
 *
 * Output: deliverables/ads/conversions-<date>.csv (gitignored — deliverables/
 * is local-only working material). Never writes an empty CSV: uploading a
 * header-only file in the Ads UI is a confusing no-op.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_DIR = join(ROOT, "deliverables", "ads");

const CONVERSION_NAME = "Qualified lead (offline)";
// The Ads account's reporting timezone. Times below are rendered NAIVE in
// this zone and the Parameters header tells Google how to read them — never
// emit per-row offsets alongside it (Sydney flips +10/+11 with DST).
const TIMEZONE = "Australia/Sydney";

// Internal identities whose submissions are tests, never conversions.
const INTERNAL_EMAILS = new Set(["skalaliya@gmail.com", "abhishekyadav01@gmail.com", "s@s.com"]);
const INTERNAL_NAMES = /deploy verification/i;
// Same link signature functions/index.js flags as "suspect" — repeated here
// as belt-and-braces for documents that predate the quality field.
const SPAM_LINKS = /https?:\/\/|t\.me\/|wa\.me\//i;

const sinceArg = process.argv.find((a) => a.startsWith("--since="));
const since = sinceArg ? new Date(`${sinceArg.slice("--since=".length)}T00:00:00Z`) : null;
if (sinceArg && Number.isNaN(since?.getTime())) {
  console.error(`export-ad-conversions: bad --since value "${sinceArg}" (want YYYY-MM-DD).`);
  process.exit(1);
}

// en-CA gives ISO-shaped Y-M-D; hour12:false + the parts join give Google's
// expected "yyyy-MM-dd HH:mm:ss".
const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false,
});
const sydneyLocal = (date) => {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  // Intl renders midnight as 24:00 in some ICU versions — normalise.
  const hour = p.hour === "24" ? "00" : p.hour;
  return `${p.year}-${p.month}-${p.day} ${hour}:${p.minute}:${p.second}`;
};

initializeApp({ projectId: "vocotable" });
const db = getFirestore("biteperk-leads");

let query = db.collection("contactSubmissions").where("attribution", "!=", null);
if (since) query = query.where("createdAt", ">=", since);
const snap = await query.get();

const rows = [];
const skipped = { noGclid: 0, quality: 0, internal: 0, spamLinks: 0, badJson: 0 };

for (const doc of snap.docs) {
  const d = doc.data();
  let attr;
  try {
    attr = JSON.parse(d.attribution);
  } catch {
    skipped.badJson++;
    continue;
  }
  const gclid = typeof attr?.gclid === "string" ? attr.gclid.trim() : "";
  if (!gclid) { skipped.noGclid++; continue; }
  if (d.quality != null && d.quality !== "ok") { skipped.quality++; continue; }
  if (INTERNAL_EMAILS.has((d.email || "").toLowerCase()) || INTERNAL_NAMES.test(d.name || "")) {
    skipped.internal++;
    continue;
  }
  if (SPAM_LINKS.test(d.message || "")) { skipped.spamLinks++; continue; }
  const created = d.createdAt?.toDate?.();
  if (!created) continue;
  rows.push({ gclid, time: sydneyLocal(created), orderId: d.leadRef || "" });
}

console.log(
  `export-ad-conversions: ${snap.size} attributed lead(s) scanned — ` +
    `${rows.length} qualified, skipped: ${JSON.stringify(skipped)}`,
);

if (rows.length === 0) {
  console.log("No qualified ad-attributed conversions to export — no CSV written.");
  process.exit(0);
}

const csvCell = (s) => (/[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);
const lines = [
  `Parameters:TimeZone=${TIMEZONE}`,
  "Google Click ID,Conversion Name,Conversion Time,Order ID",
  ...rows.map((r) => [r.gclid, CONVERSION_NAME, r.time, r.orderId].map(csvCell).join(",")),
];

mkdirSync(OUT_DIR, { recursive: true });
const out = join(OUT_DIR, `conversions-${new Date().toISOString().slice(0, 10)}.csv`);
writeFileSync(out, lines.join("\n") + "\n");
console.log(`Wrote ${rows.length} conversion(s) → ${out}`);
console.log(
  "Upload in Google Ads → Goals → Conversions → Uploads. The conversion " +
    `action must exist first and be named exactly: ${CONVERSION_NAME}`,
);
