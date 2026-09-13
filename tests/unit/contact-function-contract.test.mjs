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

// ---------------------------------------------------------------------------
// Audience-aware responses (functions/pages.js) — EXECUTED, not grepped.
//
// check-truthful sweeps every built global page for AU facts (the AU phone,
// NAP, the .com.au mailbox, /au-en links) but a function response is not a
// built page. Until 13 Sep 2026 a French visitor whose submit fell back to
// no-JS got an en-AU page saying "Back to biteperk.com.au" with the Australian
// address. These tests hold that line where the gate cannot.
// ---------------------------------------------------------------------------
import { createRequire } from "node:module";
import { loadTS } from "../../scripts/build/_load-ts.mjs";
const pages = createRequire(import.meta.url)(join(ROOT, "functions/pages.js"));

const AU_FACTS = [/en-AU/, /\/au-en/, /biteperk\.com\.au/, /AEST/];

test("pages.js: LOCALE_BASES equals the published bases in locales.ts", async () => {
  const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
  const published = [...locales.localesForTarget("au"), ...locales.localesForTarget("global")].map((l) => l.base).sort();
  assert.deepEqual([...pages.LOCALE_BASES].sort(), published);
});

test("pages.js: global thank-you / error pages carry no AU fact and link the visitor's own tree", () => {
  for (const locale of ["/en", "/gb-en", "/fr", "/be-en", "/be-fr"]) {
    const ctx = { audience: "global", locale };
    for (const html of [pages.thankYouHtml(ctx), pages.errorHtml({ error: "Please try again.", ...ctx })]) {
      for (const re of AU_FACTS) assert.doesNotMatch(html, re, `${locale}: global page leaks ${re}`);
      assert.match(html, new RegExp(`href="https://biteperk\\.com${locale}/"`), `${locale}: back-link must be the visitor's tree`);
      assert.match(html, /sales@biteperk\.com|Back to biteperk\.com/, `${locale}: wrong mailbox or back-link`);
    }
    const lang = locale === "/fr" || locale === "/be-fr" ? "fr" : "en";
    assert.match(pages.thankYouHtml(ctx), new RegExp(`<html lang="${lang}">`));
  }
});

test("pages.js: the AU page keeps the AU mailbox, AU back-link and en-AU", () => {
  const html = pages.errorHtml({ error: "x", audience: "au", locale: "/au-en" });
  assert.match(html, /<html lang="en-AU">/);
  assert.match(html, /href="https:\/\/biteperk\.com\/au-en\/"/);
  assert.match(html, /hello@biteperk\.com\.au/);
  assert.doesNotMatch(html, /sales@biteperk\.com/);
});

test("pages.js: audience derives from crmForm first, then a non-AU locale; unknown locale is not trusted", () => {
  assert.equal(pages.audienceOf({ crmForm: "zoho-global", locale: null }), "global");
  assert.equal(pages.audienceOf({ crmForm: "", locale: "/fr" }), "global");
  assert.equal(pages.audienceOf({ crmForm: "", locale: "/au-en" }), "au");
  assert.equal(pages.audienceOf({ crmForm: "", locale: "/evil" }), "au");
  assert.equal(pages.homeFor({ audience: "global", locale: "/nope" }), "https://biteperk.com/en/");
  assert.equal(pages.escapeHtml(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
});

test("contactForm: the lead stores its locale, the rate limit runs after validation, previews are allowed origins", () => {
  assert.match(leadWrite, /\n\s*locale,\n/, "lead write must persist `locale`");
  const validation = code.indexOf("!EMAIL_RE.test(email)");
  const limiter = code.indexOf("await rateLimited(clientIp)");
  assert.ok(validation > -1 && limiter > validation, "rateLimited() must run after the validation block");
  assert.match(code, /PREVIEW_ORIGIN = \/\^https:\\\/\\\/biteperk-global--\[a-z0-9-\]\+\\\.web\\\.app\$\//);
  // The SMTP sender/notification constants legitimately name the AU mailbox
  // (it is where notifications go); nothing user-facing may.
  const userFacing = code.split("\n").filter((l) => !/const MAIL_(FROM|FROM_FALLBACK|TO) = /.test(l)).join("\n");
  assert.doesNotMatch(userFacing, /hello@biteperk\.com\.au/, "no hardcoded AU mailbox in index.js — pages.js chooses by audience");
});
