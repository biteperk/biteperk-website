#!/usr/bin/env node
/**
 * hreflang integrity gate over the GLOBAL build (dist-global/).
 *
 * For every global-locale page (all bases derived from locales.ts) asserts:
 *   - EXACTLY the cluster of hreflang codes that locales.ts says should be
 *     there — no missing code, and no code for a locale that doesn't emit the
 *     page. It used to demand the complete set on every page, which was right
 *     only while every tree was identical; with uneven market depth
 *     (/gb-en/london/ is UK-only; be-en + be-fr "brussels" are a true pair) that
 *     rule would have forced four 404 alternates onto every UK city page.
 *     (Never write a glob ending in star-slash inside a block comment — it
 *     closes the comment. It cost a CI round in global.css the same day.)
 *     Missing AND extra are both failures — the extra half is the one that
 *     catches an alternate pointing at a page that was never built.
 *   - exactly one x-default, and it is a member of the page's own cluster
 *   - every href is absolute (https://biteperk.com/…) and resolves to a built
 *     page in dist-global (never a redirect target / 404)
 *   - self-referencing (the page's own canonical is one of its alternates)
 *   - reciprocal (paired pages — same path across locales — list the same set),
 *     INCLUDING the AU half in dist/: its alternate set is read and compared,
 *     not merely existsSync'd, so a dist/ built without INTL_LAUNCHED cannot
 *     ship one-way hreflang past a green gate.
 *
 * Fault-inject before trusting: break one href in a built file, re-run, confirm
 * exit 1. Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-hreflang.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
const HOST = "https://biteperk.com";

if (!existsSync(DIST)) {
  console.error(`check-hreflang: ${DIST} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

// locales.ts is the single source of truth — loadTS (bundling) rather than a
// raw transform + data URL, so the gate keeps working if locales.ts ever
// grows a relative import (a data: URL has no base to resolve one against).
const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const globals = locales.localesForTarget("global");

const AU_DIST_EARLY = join(ROOT, "dist");

/**
 * The launch flag is read from THE BUILD STAMP, never from this process's env.
 *
 * INTL_LAUNCHED is resolved per process at module load, so a build-with /
 * gate-without mismatch used to be possible — and because this gate fails on
 * EXTRA codes as well as missing ones, it surfaced as a confusing gate failure
 * that invites loosening the assertion rather than fixing the build. Reading
 * the stamp makes the two structurally incapable of disagreeing.
 */
function readStamp(dir, label) {
  const f = join(dir, ".build-meta.json");
  if (!existsSync(f)) {
    console.error(
      `check-hreflang: ${label} has no .build-meta.json — rebuild with the current ` +
        `package.json scripts (they stamp it). Refusing to guess the launch flag.`,
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(f, "utf8"));
}

const globalStamp = readStamp(DIST, "dist-global");
const LAUNCHED = globalStamp.intlLaunched === true;

if (LAUNCHED) {
  if (!existsSync(AU_DIST_EARLY)) {
    console.error(
      "check-hreflang: the global build is stamped intlLaunched=true, so every " +
        "cluster includes the AU half — but dist/ is missing. Run the AU build too " +
        "(INTL_LAUNCHED=true npm run build:site).",
    );
    process.exit(1);
  }
  const auStamp = readStamp(AU_DIST_EARLY, "dist");
  if (auStamp.intlLaunched !== globalStamp.intlLaunched) {
    console.error(
      `check-hreflang: BUILD MISMATCH — dist-global was built with ` +
        `INTL_LAUNCHED=${globalStamp.intlLaunched} (raw ${JSON.stringify(globalStamp.intlLaunchedRaw)}) ` +
        `but dist/ with INTL_LAUNCHED=${auStamp.intlLaunched} (raw ${JSON.stringify(auStamp.intlLaunchedRaw)}). ` +
        `Shipping this pair means one-way hreflang, which Google discards wholesale. ` +
        `Rebuild both with the same value.`,
    );
    process.exit(1);
  }
}

/**
 * The hreflang codes a given page path SHOULD carry — derived from the same
 * pageExistsInLocale() the renderer uses, so the gate and the page cannot
 * disagree about which locales are in a cluster.
 *
 * `baseLess` is the path with the locale segment stripped ("/" or "/london/").
 * Pre-launch only global locales cluster; once the flag flips, AU joins on the
 * shared pages and its hrefs live in dist/, not dist-global/ — see
 * resolvesInDist. The flag comes from the BUILD STAMP, not this process's env.
 */
const AU = locales.locales.filter((l) => l.target === "au");
const clusterFor = (baseLess) =>
  [...globals, ...(LAUNCHED ? AU : [])].filter((l) =>
    locales.pageExistsInLocale(baseLess, l),
  );
// Reciprocity key: strip the LOCALE SEGMENT (derived, longest-first so
// "be-en" wins over any prefix). A hardcoded (en|fr) here silently skipped
// every page of a new locale — the check "passed" by never comparing them.
const SEG_ALT = globals
  .map((l) => l.base.replace(/^\//, ""))
  .sort((a, b) => b.length - a.length)
  .join("|");
const SEG_RE = new RegExp(`^(${SEG_ALT})/`);

function htmlFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}
const pages = globals.flatMap((l) => htmlFiles(join(DIST, l.base.replace(/^\//, ""))));

function alternatesOf(html) {
  const out = [];
  // One bounded quantifier per tag keeps the scan linear on whole HTML files;
  // the attribute tests run on the short matched tag, not the document.
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = m[0];
    if (!tag.includes('rel="alternate"')) continue;
    const hl = tag.match(/hreflang="([^"]+)"/);
    const hf = tag.match(/href="([^"]+)"/);
    if (hl && hf) out.push({ hreflang: hl[1], href: hf[1] });
  }
  return out;
}
const canonicalOf = (html) => {
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    if (m[0].includes('rel="canonical"')) return m[0].match(/href="([^"]+)"/)?.[1] ?? null;
  }
  return null;
};

const AU_BASE = AU[0]?.base.replace(/^\//, "") ?? "au-en";
const AU_DIST = join(ROOT, "dist");

/**
 * The dist/ file backing an AU href, or null if the href is not an AU one.
 * Same base-vs-output-dir subtlety as resolvesInDist: Astro's `base` shapes the
 * URL, not the directory, so /au-en/about/ lives at dist/about/index.html.
 */
function auFileFor(href) {
  if (!href.startsWith(HOST + "/")) return null;
  const path = href.slice(HOST.length).replace(/^\/+/, "").replace(/\/$/, "");
  if (path !== AU_BASE && !path.startsWith(AU_BASE + "/")) return null;
  const rest = path.slice(AU_BASE.length).replace(/^\/+/, "");
  return rest ? join(AU_DIST, rest, "index.html") : join(AU_DIST, "index.html");
}

function resolvesInDist(href) {
  if (!href.startsWith(HOST + "/")) return false;
  const path = href.slice(HOST.length).replace(/^\/+/, "").replace(/\/$/, "");
  // AU alternates (only present once INTL_LAUNCHED) belong to the OTHER build:
  // Astro's `base` shapes the URL, not the output dir, so /au-en/about/ lives
  // at dist/about/index.html. Without this the launch build would fail the
  // gate on hrefs that are perfectly correct in the merged tree.
  if (path === AU_BASE || path.startsWith(AU_BASE + "/")) {
    const rest = path.slice(AU_BASE.length).replace(/^\/+/, "");
    return existsSync(rest ? join(AU_DIST, rest, "index.html") : join(AU_DIST, "index.html"));
  }
  const file = path ? join(DIST, path, "index.html") : join(DIST, "index.html");
  return existsSync(file);
}

let failed = 0;
const fail = (m) => { failed++; console.error(`FAIL  ${m}`); };
const setsByPath = new Map();

for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");
  const alts = alternatesOf(html);
  const canonical = canonicalOf(html);

  // The locale segment stripped off ("gb-en/london/index.html" → "/london/",
  // "fr/index.html" → "/"): the key both the cluster lookup and the
  // reciprocity check are computed from.
  const key = rel.replace(SEG_RE, "").replace(/index\.html$/, "");
  const baseLess = key ? `/${key}` : "/";
  const cluster = clusterFor(baseLess);

  const xdef = alts.filter((a) => a.hreflang === "x-default");
  if (xdef.length !== 1) fail(`${rel}: expected exactly one x-default, found ${xdef.length}`);
  else if (!alts.some((a) => a.hreflang !== "x-default" && a.href === xdef[0].href))
    fail(`${rel}: x-default ${xdef[0].href} is not one of the page's own alternates`);

  const codes = new Set(alts.filter((a) => a.hreflang !== "x-default").map((a) => a.hreflang));
  const expected = new Set(cluster.flatMap((l) => l.hreflang));
  for (const c of expected) if (!codes.has(c)) fail(`${rel}: missing hreflang="${c}"`);
  for (const c of codes)
    if (!expected.has(c))
      fail(`${rel}: unexpected hreflang="${c}" — no locale in this page's cluster emits "${baseLess}"`);

  for (const a of alts) {
    if (!a.href.startsWith(HOST + "/")) fail(`${rel}: hreflang ${a.hreflang} href not absolute on ${HOST}: ${a.href}`);
    else if (!resolvesInDist(a.href)) fail(`${rel}: hreflang ${a.hreflang} href does not resolve in dist-global: ${a.href}`);
  }

  if (canonical && !alts.some((a) => a.href === canonical))
    fail(`${rel}: not self-referencing (canonical ${canonical} absent from its alternates)`);

  const hrefSet = [...new Set(alts.filter((a) => a.hreflang !== "x-default").map((a) => a.href))].sort().join("|");

  // The AU half of the cluster. resolvesInDist() only existsSync's these files,
  // so before this check a dist/ built WITHOUT INTL_LAUNCHED shipped one-way
  // hreflang — global pages pointing at AU, AU pointing nowhere — and every
  // gate passed. Google discards a non-reciprocal cluster wholesale, so that
  // silent failure cost the entire annotation. Open the file and compare.
  const auAlt = alts.find((a) => a.hreflang !== "x-default" && auFileFor(a.href));
  if (auAlt) {
    const auFile = auFileFor(auAlt.href);
    if (!existsSync(auFile)) {
      fail(`${rel}: AU counterpart ${auAlt.href} has no built file at ${auFile.slice(ROOT.length + 1)}`);
    } else {
      const auAlts = alternatesOf(readFileSync(auFile, "utf8"));
      const auSet = [...new Set(auAlts.filter((a) => a.hreflang !== "x-default").map((a) => a.href))].sort().join("|");
      if (auSet !== hrefSet) {
        fail(
          `${rel}: AU counterpart ${auAlt.href} is not reciprocal — ` +
            `it carries ${auAlts.length} alternate(s), this page expects the set [${hrefSet}]` +
            (auAlts.length === 0 ? " (dist/ almost certainly built without INTL_LAUNCHED=true)" : ` but AU has [${auSet}]`),
        );
      }
    }
  }

  const prev = setsByPath.get(key);
  if (prev && prev !== hrefSet) fail(`${rel}: hreflang set not reciprocal with its "${key}" sibling`);
  else setsByPath.set(key, hrefSet);
}

if (!pages.length) fail("no global-locale pages found in dist-global");

if (failed) {
  console.error(`\ncheck-hreflang: ${failed} failure(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(`check-hreflang: ${pages.length} page(s) OK — complete cluster, reciprocal, absolute, resolving; one x-default each.`);
