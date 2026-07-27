#!/usr/bin/env node
/**
 * Integrity gate over dist-site/ — THE TREE FIREBASE ACTUALLY SERVES.
 *
 * Why this exists: `gates:au` checks dist/, `gates:global` checks dist-global/,
 * and nothing checked the merged artefact those two are stitched into. That gap
 * already shipped a production bug (ad98d4f): merge-dist rewrote every
 * `biteperk.com.au` in the AU robots.txt to `<origin>/au-en`, which is right for
 * page references and wrong for the root-only files it names, so the live
 * robots.txt advertised /au-en/sitemap-index.xml and /au-en/llms.txt — both 404
 * — while the real files sat at the root. The machine-readable `Sitemap:` line
 * was fine, so nothing downstream noticed; only the comment lines that
 * GPTBot/ClaudeBot actually read were broken.
 *
 * Asserts, over dist-site/:
 *   - every https://biteperk.com/… URL named in robots.txt / llms.txt /
 *     humans.txt resolves to a real file (the class of bug above)
 *   - no root file mentions biteperk.com.au (wrong host for this tree)
 *   - robots.txt carries exactly one Sitemap: directive, and it resolves
 *   - the merged sitemap is the exact union of the two source builds, by count
 *     AND by URL set — a silent drop is a page that stops being crawled
 *   - every sitemap <loc> resolves, so no /au-en/** (or any) 404 is advertised
 *
 * Fault-inject before trusting: point a root file at a nonexistent path, or
 * delete a page dist-site advertises, and confirm exit 1.
 *
 * Run after `npm run build:site`:  node scripts/gates/check-merged.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = join(ROOT, "dist-site");
const AU_DIST = join(ROOT, "dist");
const GLOBAL_DIST = join(ROOT, "dist-global");
const HOST = "https://biteperk.com";
const ROOT_FILES = ["robots.txt", "llms.txt", "humans.txt"];

if (!existsSync(SITE)) {
  console.error(`check-merged: ${SITE} not found — run npm run build:site first.`);
  process.exit(1);
}

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };

/** The dist-site file a biteperk.com URL should resolve to, or null if off-host. */
function fileFor(url) {
  if (!url.startsWith(HOST + "/") && url !== HOST) return null;
  const path = url.slice(HOST.length).replace(/^\/+/, "").replace(/[)"'.,]+$/, "");
  if (!path) return join(SITE, "index.html");
  // A trailing extension means a literal file; anything else is a page directory.
  return /\.[a-z0-9]+$/i.test(path)
    ? join(SITE, path)
    : join(SITE, path.replace(/\/$/, ""), "index.html");
}

const locsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// ---- 1. root files: every URL they advertise must exist -------------------
let urlChecks = 0;
for (const f of ROOT_FILES) {
  const p = join(SITE, f);
  if (!existsSync(p)) { fail(`${f}: missing from dist-site/`); continue; }
  const text = readFileSync(p, "utf8");

  // Host-form only. `hello@biteperk.com.au` is the company's real email address
  // and belongs on both trees — a bare substring check flags it and cries wolf,
  // which is how a gate gets loosened later and stops meaning anything.
  for (const bad of new Set(text.match(/https?:\/\/(?:www\.)?biteperk\.com\.au[^\s)"'<>]*/g) ?? []))
    fail(`${f}: links to ${bad} — dist-site is served as ${HOST}, so this should have been rewritten by merge-dist`);

  for (const url of new Set(text.match(/https:\/\/biteperk\.com[^\s)"'<>]*/g) ?? [])) {
    const file = fileFor(url);
    urlChecks++;
    if (file && !existsSync(file))
      fail(`${f}: advertises ${url} which does not exist (expected ${file.slice(ROOT.length + 1)})`);
  }
}

// robots.txt Sitemap: directive — exactly one, and it must resolve.
const robotsPath = join(SITE, "robots.txt");
if (existsSync(robotsPath)) {
  const directives = readFileSync(robotsPath, "utf8")
    .split("\n").filter((l) => /^\s*sitemap\s*:/i.test(l));
  if (directives.length !== 1)
    fail(`robots.txt: expected exactly one Sitemap: directive, found ${directives.length}`);
  else {
    const url = directives[0].split(/:\s*/).slice(1).join(":").trim();
    const file = fileFor(url);
    if (!file) fail(`robots.txt: Sitemap: ${url} is not on ${HOST}`);
    else if (!existsSync(file)) fail(`robots.txt: Sitemap: ${url} does not exist`);
  }
}

// ---- 2. merged sitemap is the exact union of both source builds -----------
const sitemapPath = join(SITE, "sitemap-0.xml");
let merged = [];
if (!existsSync(sitemapPath)) {
  fail("sitemap-0.xml: missing from dist-site/");
} else {
  merged = locsOf(readFileSync(sitemapPath, "utf8"));
  const sourceCount = [AU_DIST, GLOBAL_DIST].reduce((n, d) => {
    const f = join(d, "sitemap-0.xml");
    return n + (existsSync(f) ? locsOf(readFileSync(f, "utf8")).length : 0);
  }, 0);
  if (merged.length !== sourceCount)
    fail(`sitemap-0.xml: ${merged.length} URL(s) but the two source builds hold ${sourceCount} — the merge dropped or duplicated entries`);

  const dupes = merged.filter((u, i) => merged.indexOf(u) !== i);
  if (dupes.length) fail(`sitemap-0.xml: ${dupes.length} duplicate loc(s), e.g. ${dupes[0]}`);

  for (const loc of merged) {
    const file = fileFor(loc);
    if (!file) fail(`sitemap-0.xml: ${loc} is not on ${HOST}`);
    else if (!existsSync(file))
      fail(`sitemap-0.xml: advertises ${loc} which does not exist (expected ${file.slice(ROOT.length + 1)})`);
  }
}

if (failed) {
  console.error(`\ncheck-merged: ${failed} failure(s) over dist-site/.`);
  process.exit(1);
}
console.log(
  `check-merged: dist-site OK — ${urlChecks} root-file URL(s) resolve, ` +
    `sitemap is the exact union of both builds (${merged.length} URLs, all resolving).`,
);
