/**
 * Contract tests for functions/index.js — the contact-form backend.
 *
 * These pin the privacy position the international privacy notices state
 * (src/data/intl/copy.ts, markets.ts) to what the function actually does, so
 * the two cannot drift apart silently:
 *
 *   - no Google reCAPTCHA (removed 3 Sep 2026: it loaded before any consent on
 *     every EU/UK contact page and sent visitor IPs to Google)
 *   - no personal mailbox on the notification (was a Gmail CC — an undisclosed
 *     transfer of every lead's full details to Google US)
 *   - no IP address or user agent persisted on the lead
 *   - every lead carries `expireAt` (the 24-month TTL the notices promise)
 *   - the rate-limit counter is keyed by a hash, never the raw IP
 *
 * The function can't be imported here (firebase-admin initialises at load),
 * so these are source-level assertions — the same idiom as the truthfulness
 * gates. Each was fault-injected once before being trusted.
 *
 * Run: node --test tests/unit/  (wired into gates:global)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const src = readFileSync(join(ROOT, "functions/index.js"), "utf8");

/**
 * Code only — comments are allowed to say "reCAPTCHA was removed" (and
 * should: that history is worth keeping next to the rate limiter). Strips
 * block and line comments; good enough for this file, which has no `//`
 * inside string literals other than URLs, which are kept by the lookbehind.
 */
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<!:)\/\/.*$/gm, "");

// The lead write is the block passed to contactSubmissions.add({ ... }).
const leadWrite = (() => {
  const start = src.indexOf('collection("contactSubmissions").add({');
  assert.ok(start > -1, "lead write not found");
  const end = src.indexOf("});", start);
  return src.slice(start, end);
})();

test("contactForm: no Google reCAPTCHA anywhere in the function's code", () => {
  assert.doesNotMatch(code, /recaptcha/i);
  assert.doesNotMatch(code, /g-recaptcha-response/);
  assert.doesNotMatch(code, /siteverify/i);
});

test("contactForm: notification never goes to a personal / non-company mailbox", () => {
  assert.doesNotMatch(src, /gmail\.com|outlook\.com|hotmail\.com|yahoo\.com|icloud\.com/i);
  const cc = src.match(/const MAIL_CC = "([^"]+)"/);
  assert.ok(cc, "MAIL_CC constant not found");
  assert.match(cc[1], /@biteperk\.com(\.au)?$/, `MAIL_CC must be a company mailbox, got ${cc[1]}`);
});

test("contactForm: lead document carries no IP address or user agent", () => {
  assert.doesNotMatch(leadWrite, /\bip:/);
  assert.doesNotMatch(leadWrite, /userAgent:/);
  assert.doesNotMatch(leadWrite, /user-agent/i);
});

test("contactForm: every lead carries expireAt for the 24-month TTL policy", () => {
  assert.match(leadWrite, /expireAt:\s*Timestamp\.fromMillis\(Date\.now\(\)\s*\+\s*LEAD_RETENTION_MS\)/);
  assert.match(src, /const LEAD_RETENTION_MS = 24 \* 30 \* 24 \* 60 \* 60 \* 1000/);
});

test("rate limiter: keyed by a hash of the IP, never the raw address, and expires", () => {
  const fn = src.slice(src.indexOf("async function rateLimited("));
  assert.ok(fn.length > 0, "rateLimited not found");
  assert.match(fn, /createHash\("sha256"\)\.update\(ip\)/);
  assert.match(fn, /collection\("rateLimits"\)\.doc\(id\)/);
  assert.match(fn, /expireAt:\s*Timestamp\.fromMillis/);
  // The raw IP must not be written into the document body.
  const setBlock = fn.slice(fn.indexOf("tx.set(ref, {"), fn.indexOf("});", fn.indexOf("tx.set(ref, {")));
  assert.doesNotMatch(setBlock, /\bip\b/);
});

test("firestore.indexes.json: the TTL policy is declared for both collections", () => {
  const idx = JSON.parse(readFileSync(join(ROOT, "firestore.indexes.json"), "utf8"));
  const ttl = new Set(
    (idx.fieldOverrides ?? [])
      .filter((f) => f.ttl === true && f.fieldPath === "expireAt")
      .map((f) => f.collectionGroup),
  );
  assert.ok(ttl.has("contactSubmissions"), "contactSubmissions.expireAt needs a TTL override");
  assert.ok(ttl.has("rateLimits"), "rateLimits.expireAt needs a TTL override");
});
