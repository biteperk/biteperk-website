#!/usr/bin/env node
/**
 * FAQ uniqueness gate (AU tree).
 *
 * The site emits an FAQPage per product, solution, city, home, technology and
 * platform page, plus — now — standalone FAQ articles under /blog/. ~250 Q&A
 * pairs already ship, and one data-residency ANSWER is already verbatim on
 * three URLs. Nothing checked for it. A standalone FAQ hub that restates a
 * question or answer already published elsewhere is doorway-shaped: it splits
 * the ranking signal and trains AI answerers on a duplicate. check-schema only
 * asserts an FAQPage is PRESENT; check-cities measures intro/aiLocal prose, not
 * faqs. So this gate is the only thing standing between the FAQ section and a
 * seventh copy of an existing Q&A.
 *
 * For every /blog/ page that carries an FAQPage, this asserts:
 *   1. the page carries at most ONE FAQPage node (two is a rendering bug);
 *   2. each question NAME is unique site-wide — it may not also appear on any
 *      other built URL (another /blog/ page included), except the small
 *      BASELINE set of questions that predate this gate;
 *   3. each ANSWER is < THRESHOLD containment-similar to every answer on every
 *      other URL (reuses scripts/gates/_similarity.mjs — the same shingle/
 *      overlap method as the city gates, never re-inlined);
 *   4. each question NAME is present in the page's own visible text — Google
 *      requires FAQ rich-result markup to match on-page content.
 * And a positive-gate floor: it must find at least MIN_FAQ_POSTS /blog/ FAQ
 * pages, so an empty or mis-globbed dist can't pass vacuously.
 *
 * Fault-inject before trusting: FAQ_DIST → a copy of dist with a question
 * duplicated onto a second page, or an answer pasted from /technology/ into a
 * blog FAQ; both must FAIL.
 */
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pages, html } from "./_dist.mjs";
import { shingles, overlap, visibleText } from "./_similarity.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = process.env.FAQ_DIST ?? join(ROOT, "dist");
if (!existsSync(DIST)) {
  console.error(`check-faq-unique: ${DIST} not found — build first.`);
  process.exit(1);
}

/** Answer-similarity ceiling and the minimum FAQ articles we expect to exist. */
const THRESHOLD = 0.8;
const MIN_FAQ_POSTS = 10;

/**
 * Questions that predate this gate and are knowingly shared across pages
 * (different answers per page, so they survive the anti-doorway city gate).
 * A new /blog/ FAQ must NOT reuse one — the allowlist only stops the gate from
 * flagging the pre-existing non-blog duplication it is not this gate's job to
 * unwind. Keep it minimal; add only with a reason.
 */
const BASELINE = new Set([
  "is bella an ai receptionist or just an answering service?",
]);

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

// Pull every FAQPage node out of a built page's JSON-LD.
function faqNodes(pageHtml) {
  const out = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(pageHtml))) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      continue;
    }
    for (const node of Array.isArray(data) ? data : [data]) {
      if (node && node["@type"] === "FAQPage" && Array.isArray(node.mainEntity)) out.push(node);
    }
  }
  return out;
}

const all = pages(DIST); // [{ file, route }]
let failed = 0;
const fail = (msg) => {
  console.error(`FAIL  ${msg}`);
  failed++;
};

// Index every answer site-wide so a blog answer can be compared to all others.
// [{ route, q, a, aShingles }]
const answers = [];
const questionRoutes = new Map(); // normalised question -> Set(route)
let blogFaqPages = 0;

for (const { file, route } of all) {
  const pageHtml = html(file);
  const nodes = faqNodes(pageHtml);
  if (nodes.length === 0) continue;
  const isBlog = /\/blog\//.test(route);
  if (isBlog && nodes.length > 1) fail(`${route}: ${nodes.length} FAQPage nodes — a page must carry exactly one.`);
  if (isBlog) blogFaqPages++;

  const visible = isBlog ? norm(visibleText(pageHtml)) : null;
  for (const node of nodes) {
    for (const item of node.mainEntity) {
      const q = norm(item.name ?? "");
      const a = item.acceptedAnswer?.text ?? "";
      if (!q) continue;
      if (!questionRoutes.has(q)) questionRoutes.set(q, new Set());
      questionRoutes.get(q).add(route);
      answers.push({ route, q, a, isBlog, aShingles: shingles(a) });
      // (4) on-page presence for blog FAQs.
      if (isBlog && visible && !visible.includes(norm(item.name)))
        fail(`${route}: FAQ question not visible on the page — "${item.name}"`);
    }
  }
}

// (2) question-name uniqueness for blog FAQs.
for (const { route, q, isBlog } of answers) {
  if (!isBlog || BASELINE.has(q)) continue;
  const routes = [...questionRoutes.get(q)].filter((r) => r !== route);
  if (routes.length > 0) fail(`${route}: FAQ question also appears on ${routes[0]} — "${q}"`);
}

// (3) answer similarity: each blog answer vs every OTHER url's answers.
for (const a of answers) {
  if (!a.isBlog || a.aShingles.size === 0) continue;
  for (const b of answers) {
    if (b.route === a.route) continue;
    const sim = overlap(a.aShingles, b.aShingles);
    if (sim >= THRESHOLD) {
      fail(`${a.route}: FAQ answer ${Math.round(sim * 100)}% similar to one on ${b.route} — "${a.q}"`);
      break;
    }
  }
}

// Positive-gate floor.
if (blogFaqPages < MIN_FAQ_POSTS) fail(`only ${blogFaqPages} /blog/ FAQ page(s) found — expected ≥ ${MIN_FAQ_POSTS} (mis-globbed dist?).`);

if (failed) {
  console.error(`\ncheck-faq-unique: ${failed} failure(s).`);
  process.exit(1);
}
console.log(`check-faq-unique: ${blogFaqPages} blog FAQ page(s), ${answers.length} Q&A pairs — all questions unique, no answer ≥ ${THRESHOLD * 100}% similar.`);
