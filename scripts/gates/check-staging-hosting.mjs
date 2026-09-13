#!/usr/bin/env node
/**
 * Staging-hosting drift gate (config-only; no dist needed).
 *
 * Asserts that firebase.json's `staging` block is exactly what
 * scripts/build/sync-staging-hosting.mjs would generate from the
 * `biteperk-global` block — same public dir, cleanUrls, redirects, rewrites
 * and headers, plus the one deliberate delta (X-Robots-Tag noindex) and the
 * target name. Also asserts .firebaserc maps the target to biteperk-staging,
 * because `firebase deploy --only hosting:staging` with no mapping fails at
 * deploy time, not in CI.
 *
 * A failure here means a serving rule changed on production and not on
 * staging (or vice versa). The fix is never a hand edit:
 *   node scripts/build/sync-staging-hosting.mjs && git add firebase.json
 *
 * Fault-inject before trusting (FIREBASE_JSON points it at a copy): change a
 * Cache-Control value in the staging block only; drop the X-Robots-Tag rule;
 * delete the staging block; remove the .firebaserc mapping.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stagingBlockFrom, STAGING_TARGET } from "../build/sync-staging-hosting.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FILE = process.env.FIREBASE_JSON ?? join(ROOT, "firebase.json");
const RC = process.env.FIREBASERC ?? join(ROOT, ".firebaserc");

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };

const cfg = JSON.parse(readFileSync(FILE, "utf8"));
const prod = cfg.hosting.find((h) => h.target === "biteperk-global");
const staging = cfg.hosting.find((h) => h.target === STAGING_TARGET);
if (!prod) fail("no biteperk-global hosting block");
if (!staging) fail("no staging hosting block — run node scripts/build/sync-staging-hosting.mjs");

if (prod && staging) {
  const expected = JSON.stringify(stagingBlockFrom(prod));
  const actual = JSON.stringify(staging);
  if (expected !== actual) {
    // Name the first differing top-level key so the failure is actionable.
    const e = stagingBlockFrom(prod);
    const key = Object.keys({ ...e, ...staging }).find((k) => JSON.stringify(e[k]) !== JSON.stringify(staging[k])) ?? "(unknown)";
    fail(`staging block has drifted from biteperk-global at "${key}" — run node scripts/build/sync-staging-hosting.mjs`);
  }
  const noindex = (staging.headers ?? []).some((r) => r.source === "**" && (r.headers ?? []).some((h) => /^x-robots-tag$/i.test(h.key) && /noindex/.test(h.value)));
  if (!noindex) fail("staging block carries no X-Robots-Tag noindex on ** — a second indexable copy of the site");
  const prodNoindex = (prod.headers ?? []).some((r) => (r.headers ?? []).some((h) => /^x-robots-tag$/i.test(h.key)));
  if (prodNoindex) fail("biteperk-global block carries an X-Robots-Tag — that would de-index PRODUCTION");
}

const rc = JSON.parse(readFileSync(RC, "utf8"));
const mapped = rc.targets?.vocotable?.hosting?.[STAGING_TARGET];
if (!Array.isArray(mapped) || mapped[0] !== "biteperk-staging") fail(`.firebaserc does not map hosting target "${STAGING_TARGET}" to biteperk-staging (got ${JSON.stringify(mapped)})`);

if (failed) { console.error(`\ncheck-staging-hosting: ${failed} failure(s)`); process.exit(1); }
console.log("check-staging-hosting: ok — staging block equals biteperk-global + noindex; target mapped to biteperk-staging");
