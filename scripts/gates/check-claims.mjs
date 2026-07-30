#!/usr/bin/env node
/**
 * Claims-accuracy sweep over the AU build (dist/).
 *
 * The counterpart to check-truthful.mjs (which guards the GLOBAL tree against
 * AU facts). THIS gate guards the AU tree against ONE specific class of false
 * claim: that live call audio is *processed* in Australia.
 *
 * It is not. Booking/order/call-summary RECORDS are stored in Australia
 * (Sydney) and call recordings auto-delete after 30 days — but the voice-AI
 * platform that handles a live call runs in the United States (under written
 * data-protection terms; see the privacy policy). So "processed onshore",
 * "call audio stays in Australia" and "never leaves the country" are all
 * inaccurate, and the "train outside models / outside Biteperk" hedge implies
 * models are trained *somewhere*, just not there — the honest promise is the
 * unqualified "never used to train AI models".
 *
 * Why a gate, and why over dist/ not src/:
 *   On 30 Jul 2026 a first pass corrected these claims in src/ but missed six
 *   live instances — two card *titles* (context lines a diff-driven edit skips),
 *   an About card, two blog posts, and public/llms.txt. The llms.txt miss is the
 *   worst: it is a public/ passthrough (never under src/), and it is the file AI
 *   crawlers treat as the canonical self-description. A src/-scoped grep cannot
 *   see it; a gate over the BUILT output can, and also covers generated pages.
 *
 * What is DELIBERATELY allowed (do not "fix" the regexes to catch these):
 *   - "records stored in Australia", "records kept onshore", "records stay in
 *     Australia" — records really are onshore. The bans target audio/voice/
 *     data/processing, never records.
 *   - "calls are answered in our telephony provider's Australian region" — the
 *     telephony leg really is AU; only the AI *processing* is US.
 *   - "processed in real time … in the United States" — the truthful disclosure.
 *     The processing rule matches a location only AFTER the verb, so "stored in
 *     Australia (Sydney); live calls are processed … in the US" cannot trip it.
 *
 * Fault-inject before trusting (this repo has shipped vacuous gates): plant
 * "processed onshore" in a built page, re-run, confirm exit 1. tests/gates or
 * the commit that added this ran that check; re-run it if you touch the rules.
 *
 * Run after `npm run build`:
 *   node scripts/gates/check-claims.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// Defaults to dist/; CLAIMS_DIST overrides (absolute, or relative to the repo
// root) — used by the fault-injection self-test to point at a fixture dir.
const DIST = resolve(ROOT, process.env.CLAIMS_DIST || "dist");

if (!existsSync(DIST)) {
  console.error(`check-claims: ${DIST} not found — run npm run build first.`);
  process.exit(1);
}

// Matched against tag-stripped, entity-decoded text (see textOf). Prose rules,
// not href rules — claims live in visible copy, headings and llms.txt, and a
// card TITLE split across markup must still match, so we never scan raw HTML.
const BANNED = [
  {
    label: "AI-processing located in Australia (live calls are processed in the US)",
    // Location AFTER the processing verb only. The truthful line puts
    // "in Australia" (records) BEFORE the verb and "United States" after it,
    // so a reverse-direction rule would false-positive on honest copy.
    // Catches: "processed onshore", "processed in Australia", "processed and
    // stored in Australia", "Processed and kept in Australia".
    re: /\bprocess(?:ed|ing|es)?\b[^.!?]{0,40}\b(?:onshore|in\s+australia)\b/i,
  },
  {
    label: "call audio located in Australia (the US platform handles live audio)",
    // ONLY the live call audio is US-processed. Stored data — records, guest
    // booking details, call summaries — genuinely IS onshore, so this rule is
    // deliberately narrow: subject "call audio"/"audio" next to an onshore/
    // stays-in-Australia claim. "guest details staying in Australia" is true
    // (those are stored records) and must NOT match. The processing verb is
    // covered by the rule above regardless of subject.
    re: /\b(?:call\s+)?audio\b[^.!?]{0,60}\b(?:onshore|stays?\s+in\s+australia|staying\s+in\s+australia|kept\s+in\s+australia)\b/i,
  },
  {
    label: "'data stays in Australia' — say 'records', not 'data'",
    re: /\bdata\s+(?:stays?|staying|remains?|resides?)\s+(?:in\s+australia|onshore)\b/i,
  },
  {
    label: "'never leaves the country/Australia' overclaim",
    re: /\bnever\s+leaves?\s+(?:the\s+country|australia)\b/i,
  },
  {
    label: "training hedge ('outside/external models', 'outside Biteperk')",
    re: /\btrain(?:ed|ing)?\b[^.!?]{0,25}\b(?:outside|external|someone)\b|\b(?:outside|external)\s+(?:models|training)\b|\bmodels\s+(?:outside|external)\b|\boutside\s+biteperk\b|\bsomeone\s+else'?s\s+models\b/i,
  },
];

// "onshore" is truthful ONLY about stored records. Any other use is a
// processing/residency claim. Allow the word when "record" sits within a small
// window on either side ("records stored onshore", "records, kept onshore");
// flag everything else ("Onshore, and yours", "onshore data", "processed
// onshore"). The BANNED rules above already catch the processing forms — this
// is the backstop for standalone uses a phrase list would miss.
const ONSHORE = /\bonshore\b/gi;
const RECORDS_NEAR = 40;

const textOf = (content) =>
  content
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function scanFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scanFiles(p, acc);
    else if (e.name.endsWith(".html") || e.name.endsWith(".txt")) acc.push(p);
  }
  return acc;
}

const files = scanFiles(DIST);
let failed = 0;

for (const file of files) {
  const rel = file.slice(DIST.length + 1);
  const text = textOf(readFileSync(file, "utf8"));

  for (const { label, re } of BANNED) {
    const m = text.match(re);
    if (m) {
      failed++;
      console.error(`FAIL  ${rel}: ${label} — "…${m[0].trim()}…"`);
    }
  }

  for (const m of text.matchAll(ONSHORE)) {
    const from = Math.max(0, m.index - RECORDS_NEAR);
    const window = text.slice(from, m.index + m[0].length + RECORDS_NEAR);
    if (!/record/i.test(window)) {
      failed++;
      console.error(`FAIL  ${rel}: 'onshore' not scoped to records — "…${window.trim()}…"`);
    }
  }
}

if (!files.length) {
  console.error("FAIL  check-claims: no built pages found in dist/");
  process.exit(1);
}
if (failed) {
  console.error(`\ncheck-claims: ${failed} inaccurate data-claim(s) across ${files.length} built file(s).`);
  process.exit(1);
}
console.log(`check-claims: ${files.length} built file(s) make no onshore-processing or training-hedge claim.`);
