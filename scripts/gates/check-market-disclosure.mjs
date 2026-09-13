#!/usr/bin/env node
/**
 * Market-disclosure gate — every locale tree carries the facts its market's
 * compliance entry (src/data/intl/compliance.ts) says it must, and nothing
 * another market's entry says.
 *
 * Generalises the UK statutory gate (check-uk-disclosure.mjs, which stays:
 * reg 25 / reg 6 are UK-specific and byte-exact). Per market, over
 * dist-global/<base>/**:
 *   - every page carries the market's contact mailbox (footer/aside)
 *   - the privacy page names the market's supervisory authority (name or URL)
 *     — and NO page names another market's authority
 *   - the home and contact pages carry the team-location sentence
 * Positive gate → page-count floor per tree, so it cannot pass vacuously.
 *
 * Fault-inject (MARKET_DIST → a copy): remove the authority row from one home.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = resolve(ROOT, process.env.MARKET_DIST ?? "dist-global");
if (!existsSync(DIST)) { console.error(`check-market-disclosure: ${DIST} not found — run BUILD_TARGET=global npm run build first.`); process.exit(1); }

const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));
const { compliance } = await loadTS(join(ROOT, "src/data/intl/compliance.ts"));
const files = (dir, acc = []) => { for (const n of readdirSync(dir)) { const p = join(dir, n); statSync(p).isDirectory() ? files(p, acc) : n === "index.html" && acc.push(p); } return acc; };
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
const allAuthorities = Object.values(compliance).filter((c) => c.authority).map((c) => c.authority);

for (const l of localesForTarget("global")) {
  const mc = compliance[l.market];
  const tree = join(DIST, l.base.replace(/^\//, ""));
  const pages = files(tree);
  if (pages.length < 10) fail(`${l.base}: only ${pages.length} page(s) — the sweep is not covering the tree`);
  for (const f of pages) {
    const rel = f.slice(DIST.length + 1);
    const raw = readFileSync(f, "utf8");
    const t = text(raw);
    if (!t.includes(mc.contactEmail)) fail(`${rel}: does not carry the market mailbox ${mc.contactEmail}`);
    for (const a of allAuthorities) {
      if (mc.authority && a.short === mc.authority.short) continue;
      if (raw.includes(a.url) || t.includes(a.name.en) || t.includes(a.name.fr)) fail(`${rel}: names another market's authority (${a.short})`);
    }
  }
  const privacy = join(tree, "legal", "privacy", "index.html");
  if (mc.authority && existsSync(privacy)) {
    const raw = readFileSync(privacy, "utf8");
    const t = text(raw);
    const named = raw.includes(mc.authority.url) || t.includes(mc.authority.name[l.copyLang]) || t.includes(mc.authority.short.split("/")[0]);
    if (!named) fail(`${l.base}/legal/privacy/: does not name ${mc.authority.short}`);
  }
  for (const page of ["", "contact"]) {
    const f = join(tree, page, "index.html");
    if (!existsSync(f)) continue;
    const raw = readFileSync(f, "utf8");
    const t = text(raw);
    if (!t.includes(mc.timeZoneNote[l.copyLang])) fail(`${l.base}/${page ? page + "/" : ""}: missing the team-location sentence`);
    if (mc.authority && page === "" && !raw.includes(mc.authority.url)) fail(`${l.base}/: home trust strip does not link ${mc.authority.short}`);
  }
  console.log(`ok    ${l.base}: ${pages.length} pages carry ${mc.contactEmail}; authority ${mc.authority?.short ?? "none (x-default)"}`);
}
if (failed) { console.error(`\ncheck-market-disclosure: ${failed} failure(s)`); process.exit(1); }
console.log("check-market-disclosure: ok");
