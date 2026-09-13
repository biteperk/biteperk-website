#!/usr/bin/env node
/**
 * Europe-truthful content sweep over the GLOBAL build (dist-global/).
 *
 * The prose half of the PLAN.md §8 rules — check-schema covers the structured
 * data (Organization-only, no NAP/geo/areaServed); THIS gate greps the built
 * HTML of every global-locale page for Australia-only facts that must never
 * appear on an international page:
 *
 *   - the published AU phone number (+61 2 5504 1140, any common formatting)
 *   - the print-only demo line ((02) 7501 1140)
 *   - the AU NAP (street or suburb) — BOTH addresses: current Surry Hills
 *     (a leak guard) and pre-Jul-2026 Haymarket (a stale-data guard).
 *     NB the character classes include U+00A0: built HTML joins address
 *     parts with &nbsp;, and a plain \s does not match it in all cases
 *   - the "$80" AU price (EU pricing is a pilot outcome, never quoted)
 *   - European claims that are true nowhere: EU/Paris hosting for the
 *     restaurant products, "human oversight", certifications, a named
 *     carrier as a tested forwarding path (FORBIDDEN_CLAIMS, 6 Sep 2026)
 *   - the AU CHROME's CSS (.megamenu*, .mm*, .nav*, .foot* selectors) — not
 *     a fact leak but a weight leak with the same root cause: Astro inlines
 *     the CSS of every component in a page's import graph, so an AU-only
 *     component imported from a shared layout ships its styles (and, via
 *     the footer, its NAP-bearing markup one refactor later) into every
 *     international page. ~20 KB of it rode on /fr/ until 6 Sep 2026.
 *
 * Domain mentions (biteperk.com.au) are deliberately NOT forbidden: the org
 * schema's sameAs, the "Australia site ↗" footer link and the hello@ contact
 * email all legitimately reference the AU property. What's forbidden is AU
 * *facts* presented to a European visitor.
 *
 * CLAUDE.md described this sweep before it existed — this file makes the
 * documented control real. Fault-inject before trusting: plant "$80" in a
 * built page, re-run, confirm exit 1.
 *
 * Run after `BUILD_TARGET=global npm run build`:
 *   node scripts/gates/check-truthful.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "../build/_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// TRUTHFUL_DIST points the gate at a fixture directory for fault injection
// (same convention as check-claims' CLAIMS_DIST). Never set in CI.
const DIST = process.env.TRUTHFUL_DIST ? join(ROOT, process.env.TRUTHFUL_DIST) : join(ROOT, "dist-global");

if (!existsSync(DIST)) {
  console.error(`check-truthful: ${DIST} not found — run BUILD_TARGET=global npm run build first.`);
  process.exit(1);
}

const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));

// Each entry: a human label + a regex tolerant of the formattings that have
// actually appeared in this repo's copy (spaces, non-breaking spaces, tel:
// hrefs with no spaces).
const FORBIDDEN = [
  { label: "AU phone +61 2 5504 1140", re: /\+?61[\s ]?2[\s ]?5504[\s ]?1140|61255041140|0?2[\s ]5504[\s ]1140/ },
  { label: "print-only demo line (02) 7501 1140", re: /7501[\s ]?1140/ },
  { label: "AU NAP (current or former)", re: /Haymarket|477[\s ]?Pitt|Surry[\s ]?Hills|457[\s ]?-[\s ]?459|Elizabeth[\s ]+Street/i },
  { label: "AU price $80", re: /\$[\s ]?80\b|80[\s ]?AUD/ },
  // PLAN.md §8 has forbidden this on EU pages since the intl build existed,
  // but nothing enforced it. "Data stays in Australia" is a trust line in the
  // AU market and a cross-border transfer problem under GDPR (there is no
  // adequacy decision for Australia) — it must never reach a European page,
  // in either language. Added before the market copy multiplies.
  {
    label: "AU data-residency claim (GDPR transfer problem)",
    re: /data\s+(?:stays|is\s+stored|resides|remains)\s+in\s+australia|(?:données|hébergées?)[^.]{0,40}en\s+australie/i,
  },

  // ── Unsubstantiated European claims ─────────────────────────────────────
  // Everything above is an AU fact that must not appear in Europe. These are
  // the mirror image: European claims that are not true anywhere.
  //
  // This closes a real gap. Until the market trees were differentiated, the
  // only guard on invented local claims was a unit test covering the hero pill
  // alone — "our London team", "works with OpenTable" or a plausible-looking
  // +44 number passed every gate in the repo. Now that four markets carry
  // market-flavoured prose, that blind spot is where a well-meaning edit will
  // land. Note "Sydney" and "Australia" remain deliberately allowed: the
  // company really is Australian and the testimonial really is from Sydney.
  {
    // A premises we do not have. The market pill is separately guarded in
    // tests/unit/intl-merge.test.mjs; this covers body copy.
    label: "invented European presence (no office or staff exists in Europe)",
    // The city alternation must cover every city with a market page — "our
    // Manchester team" is the same lie as "our London team". Extend it when
    // intl/cities.ts gains a market's cities.
    re: /\bour\s+(?:London|Manchester|Birmingham|Edinburgh|Glasgow|Leeds|Bristol|Liverpool|Paris|Brussels|Bruxelles|UK|British|French|Belgian|European)\s+(?:team|office|staff|crew)\b|notre\s+(?:bureau|équipe)\s+(?:à|de|en)\s+(?:Londres|Paris|Bruxelles|Belgique|France)/i,
  },
  {
    // No booking or POS integration ships in Europe. Naming one implies it
    // does. When one genuinely ships, remove it from this list in the same
    // commit that ships it — that is the point of the list.
    label: "unshipped third-party integration named",
    re: /\b(?:OpenTable|TheFork|LaFourchette|Zenchef|SevenRooms|Guestonline|Formitable|Resy|Toast\s+POS|Lightspeed)\b/i,
  },
  {
    // The hotel-side twin of the rule above, for VoxStay copy. Deliberately a
    // SEPARATE, CASE-SENSITIVE entry rather than more alternatives on the
    // case-insensitive one: "mews" is an ordinary London street word that a UK
    // city page could legitimately use, and "Opera" collides with the Opera
    // House on the AU tree. Same removal rule — drop a name here in the commit
    // that actually ships the integration.
    label: "unshipped hotel PMS / channel / OTA integration named",
    re: /\b(?:D-EDGE|Apaleo|Mews|Opera\s+(?:PMS|Cloud)|Cloudbeds|Booking\.com|Expedia|SiteMinder|Guestline|RoomRaccoon)\b/,
  },
  {
    // No European number exists until the Twilio regulatory bundles land, so
    // any +44/+33/+32 in the built HTML is fabricated.
    //
    // Match the country code then SEVEN OR MORE digits with arbitrary
    // separators, rather than a fixed grouping. The first version of this
    // assumed a rigid \d\d\d shape and silently missed "+44 20 7946 0958" —
    // caught by fault-injecting it, which is the entire reason we do that
    // before trusting a gate. Real numbers group differently per country
    // (2-4-4 in London, 1-2-2-2-2 in Paris), so shape must not be assumed.
    label: "fabricated European phone number",
    re: /\+\s?(?:44|33|32)(?:[\s.\-()]*\d){7,}/,
  },
  {
    // AU chrome leaking through the import graph (see header). Selector-shaped
    // on purpose: `.megamenu{`, `.mm-panel{`, `.nav-inner{`, `.foot-abn{` are
    // what Astro emits; the intl tree's own classes are all `.intl-*`. The
    // trailing character class keeps `.navigation-…` or prose like "the
    // .mm file" from matching — this is CSS, not text.
    label: "AU chrome CSS (Nav/Footer/MobileMenu/megamenu reached the global tree — import AuBase only from AU pages)",
    re: /\.(?:megamenu|mm|nav|foot)(?:-[a-z0-9-]+)?[\s{,:>\[]/,
  },
];

/**
 * European claims that are not true anywhere (rev. 6 Sep 2026, with the trust
 * module). Text-pass rules — they hinge on words, not markup. `unless` is a
 * path regex that exempts a page: VoxStay's product page carries the ONE
 * sentence allowed to mention EU hosting, and only as future-tense design
 * intent ("designed so … hosted in the EU (Paris region)").
 */
const FORBIDDEN_CLAIMS = [
  {
    // Facts about which law applies belong on the legal pages; "we are GDPR
    // compliant" is a claim, not a fact, and nowhere else may make it. The
    // compliance registry (intl/compliance.ts) names authorities and laws —
    // it never asserts compliance.
    label: "compliance claim outside a legal page",
    re: /\b(?:GDPR|RGPD|PECR|UK GDPR)[- ]?(?:compliant|compliance)\b|\bcompliant with (?:the )?(?:GDPR|RGPD|UK GDPR|PECR)|\bconforme (?:au|à la|aux) (?:RGPD|loi)/i,
    unless: /\/legal\//,
  },
  {
    // Records are in Australia and live calls are processed in the United
    // States — the privacy notice says so. A "regional cloud boundary" badge
    // for the restaurant products would be exactly the false claim this repo's
    // gates exist to stop.
    label: "EU / Paris hosting claim (only VoxStay's design-intent sentence may say it, on its own page)",
    re: /europe-west\d|hosted\s+(?:in|on)\s+(?:Paris|the\s+EU|Europe|European\s+(?:soil|servers?))|héberg\w*\s+(?:à\s+Paris|dans\s+l['’]UE|en\s+Europe)/i,
    unless: /\/products\/voxstay\//,
  },
  {
    // There is no European staff. The hand-off is to the VENUE's phone; say
    // that, never "human oversight" / "supervision humaine".
    label: "human-oversight claim (no European staff exists; the hand-off is to the venue)",
    re: /human\s+(?:oversight|supervision|monitoring)|supervision\s+humaine|surveillance\s+humaine|humain\s+en\s+permanence/i,
  },
  {
    // /en is the x-default: it serves the United States and every region no
    // market tree claims, so it must read as neither European nor Australian.
    // Until 13 Sep 2026 its core said "European pilots", "France and Belgium"
    // and GDPR as *the* lawful basis — a worldwide tree that told a Toronto
    // or Singapore reader it was somewhere else. European colour belongs in
    // the gb-en/be-en/fr/be-fr overrides; the legal pages may still name the
    // GDPR (they must), and the region router names the market sites by label.
    label: "European framing on the x-default (/en is worldwide — market colour lives in the market overrides)",
    re: /\bEurop(?:e|ean)\b|\bFrance and Belgium\b|\bthe UK\b/,
    only: /^en\//, // rel is "en/index.html" — no leading slash
    // Legal pages must name the GDPR/EU. VoxStay's own page states its EU-first
    // design — a product fact, not a claim about where the READER is.
    unless: /\/legal\/|\/products\/voxstay\//,
    // The one VoxStay sentence the products overview renders. It is a fact
    // about that product (its first pilot hotels are being sought in the EU)
    // and it is pinned by the filed 7 Sep French review, so it is allowed
    // verbatim rather than reworded — a reworded copy would fail fr-review.test.
    allow: [/Built for hotels; in development, with the first pilots in Europe\./],
  },
  {
    label: "certification / accreditation claim (none exists)",
    re: /\b(?:certified|certification|accredited|certifié(?:e|s|es)?|accrédité(?:e|s|es)?)\b/i,
  },
  {
    // Naming a carrier next to forwarding vocabulary reads as a tested
    // compatibility claim. Case-sensitive: "orange" and "free" are words.
    label: "telecom carrier presented as a tested forwarding path",
    re: /\b(?:BT|EE|O2|Gamma|Vodafone|Orange|Proximus|Bouygues|SFR|Telenet)\b[^.!?]{0,60}\b(?:forward|divert|renvoi|transf[eé]r)|\b(?:forward|divert|renvoi|transf[eé]r)\w*[^.!?]{0,60}\b(?:BT|EE|O2|Gamma|Vodafone|Orange|Proximus|Bouygues|SFR|Telenet)\b/,
  },
];

/**
 * Rules scanned against TAG-STRIPPED TEXT rather than raw HTML.
 *
 * Everything in FORBIDDEN above is deliberately matched against raw HTML: a
 * phone number inside `href="tel:…"` is a leak, and stripping tags would hide
 * it. These rules are the opposite case — they need prose, because they hinge
 * on capitalisation and on neighbouring words, and markup between the brand and
 * its context word would break the proximity window.
 *
 * Do NOT reuse `visibleText` from _similarity.mjs here. That helper also strips
 * <header>, <footer>, <nav> and the consent block, which is right when
 * measuring how similar two pages are and wrong when asking whether a page
 * makes a false claim — a fabricated integration in the footer is still a
 * fabricated integration.
 */
const textOf = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// Words that turn a brand mention into an integration CLAIM.
const INTEGRATION_CTX = String.raw`(?:[Ii]ntegrat\w*|[Cc]onnects?\b|[Cc]onnected\b|[Ss]yncs?\b|[Ss]yncing\b|[Ww]orks\s+with|[Cc]ompatible|[Pp]lugs?\s+into|POS\b|[Pp]oint[-\s]of[-\s]sale|[Bb]ooking\s+(?:system|platform)|[Ii]ntégr\w*|[Ss]e\s+connecte|[Cc]ompatible\s+avec|[Ll]ogiciel\s+de\s+caisse)`;

// Toast and Square are real POS vendors AND ordinary English words. Three
// things keep this from firing on honest copy:
//   1. case-sensitivity      → "avocado toast", "60 square metres" cannot match
//   2. the lookbehind        → "Trafalgar Square", "Leicester Square" cannot
//      match, which matters because the GB tree is London copy
//   3. the proximity window  → a capitalised Square must sit within ~60 chars
//      of an integration word, without crossing a sentence boundary
const AMBIGUOUS_BRAND = String.raw`(?<![A-Z][a-zà-ÿ]{2,}\s)\b(?:Toast|Square)\b`;

const FORBIDDEN_IN_TEXT = [
  {
    label: "ambiguous integration brand claimed (Toast/Square)",
    // Both orders are real phrasings: "works with Square" and "Square integration".
    re: new RegExp(
      `${AMBIGUOUS_BRAND}[^.!?]{0,60}${INTEGRATION_CTX}|${INTEGRATION_CTX}[^.!?]{0,60}${AMBIGUOUS_BRAND}`,
    ),
  },
];

function htmlFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, acc);
    else if (e.name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const pages = localesForTarget("global").flatMap((l) =>
  htmlFiles(join(DIST, l.base.replace(/^\//, ""))),
);

let failed = 0;
for (const file of pages) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");
  for (const { label, re } of FORBIDDEN) {
    const m = html.match(re);
    if (m) {
      failed++;
      console.error(`FAIL  ${rel}: contains ${label} — "…${m[0]}…"`);
    }
  }
  // Prose-only rules — see the note on textOf above for why these cannot share
  // the raw-HTML pass, and why that pass must not be moved onto stripped text.
  const text = textOf(html);
  for (const { label, re } of FORBIDDEN_IN_TEXT) {
    const m = text.match(re);
    if (m) {
      failed++;
      console.error(`FAIL  ${rel}: contains ${label} — "…${m[0]}…"`);
    }
  }
  for (const { label, re, only, unless, allow } of FORBIDDEN_CLAIMS) {
    if (only && !only.test(rel)) continue;
    if (unless && unless.test(rel)) continue;
    const scanned = (allow ?? []).reduce((t, a) => t.replace(a, ""), text);
    const m = scanned.match(re);
    if (m) {
      failed++;
      console.error(`FAIL  ${rel}: contains ${label} — "…${m[0]}…"`);
    }
  }
}

if (!pages.length) {
  console.error("FAIL  check-truthful: no global-locale pages found in dist-global");
  process.exit(1);
}

if (failed) {
  console.error(`\ncheck-truthful: ${failed} AU-fact leak(s) across ${pages.length} page(s).`);
  process.exit(1);
}
console.log(`check-truthful: ${pages.length} global page(s) carry no AU phone, NAP, price, AU chrome CSS or unsubstantiated European claim.`);
