/**
 * Build the French review document a native speaker marks up.
 *
 * WHY THIS EXISTS AS A COMMITTED SCRIPT: the first version of this tool was
 * written to a session scratchpad on 7 Sep 2026, never committed, and was gone
 * the same day — hours after the review it produced had been sent. That review
 * is the ONLY record of which 117 lines Ludovic's verbal pass covered (it is
 * filed at docs/ops-records/2026-09-07-french-review-ludovic.md), and it could
 * not be regenerated. Anything that produces cited evidence gets committed.
 *
 * The French is read out of the real modules through _load-ts.mjs, never
 * retyped, so the document cannot drift from what ships. English and French are
 * pulled from the same key paths and paired, so a missing translation surfaces
 * as an error rather than a silently absent row.
 *
 * ADDING A BATCH: edit CLUSTERS below — that is the whole interface. Each entry
 * names where the copy lives and which key paths are in scope. Everything else
 * (the summary table, row counts, the blocking callout) is derived.
 *
 * Usage: node scripts/build/extract-fr-review.mjs [--out <path>] [--check <path>]
 *                                                  [--since <git-ref>]
 *   --out    write the document here (default: stdout)
 *   --since  report French that is new or changed since a git ref — use this to
 *            find what a NEW batch must cover, rather than trusting memory
 *   --check  regenerate and diff against an existing document; exit 1 if the
 *            body differs. This is how the filed 7 Sep review is regression-
 *            tested — see tests/unit/fr-review.test.mjs.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFileSync, readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { loadTS } from "./_load-ts.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const INTL = (f) => resolve(ROOT, "src/data/intl", f);

/* ------------------------------------------------------------------ config */

export const META = {
  preparedFor: "Ludovic",
  date: "7 September 2026",
  requestedBy: "Sam Kalaliya",
  /** The pass that this batch is measured against — everything written since. */
  sincePass: "26 and 27 July 2026",
};

/**
 * One entry per cluster. `keys` is an ordered list of paths into the objects
 * returned by `pick`; `[n]` indexes arrays. Order is the reading order in the
 * document, so group related keys together deliberately.
 *
 * `rows` (cluster 7) is the escape hatch for copy that is market-scoped rather
 * than language-scoped: there is no EN counterpart to pair against, so the
 * English column is a hand-written gloss and only the French is read live.
 */
export const CLUSTERS = [
  {
    n: "1",
    title: "chrome: nav, footer and menu labels",
    summaryTitle: "Chrome — nav, footer, menu labels",
    where: "Every French page",
    source: "copy.ts",
    pick: (m) => [m.copy.chrome.en, m.copy.chrome.fr],
    keys: [
      "nav.home", "nav.products", "nav.howItWorks", "nav.about", "nav.contact",
      "auSite", "regionTitle", "cities", "citiesTitle",
      "footerExplore", "footerRegions", "footerProducts", "footerLegal", "footerFollow",
      "menu", "menuClose", "suggest", "suggestDismiss",
    ],
  },
  {
    n: "2",
    title: "cookie banner and settings modal",
    summaryTitle: "Cookie banner + settings modal",
    where: "Every French page (consent must be *understood* to be valid)",
    source: "copy.ts",
    pick: (m) => [m.copy.chrome.en, m.copy.chrome.fr],
    keys: [
      "consent.region", "consent.body", "consent.policy", "consent.settings",
      "consent.reject", "consent.accept", "consent.modalTitle", "consent.modalLede",
      "consent.alwaysOn", "consent.saved", "consent.cancel", "consent.save",
      "consent.categories.necessary.title", "consent.categories.necessary.body",
      "consent.categories.analytics.title", "consent.categories.analytics.body",
      "consent.categories.marketing.title", "consent.categories.marketing.body",
    ],
  },
  {
    n: "3",
    title: "the call transcript",
    summaryTitle: "Call transcript",
    where: "`/fr` and `/be-fr` home pages",
    source: "copy.ts",
    pick: (m) => [m.copy.callSim.en, m.copy.callSim.fr],
    keys: [
      "eyebrow", "headingLead", "headingAccent", "lede", "note", "ctaLabel",
      "status", "badge", "whoBella", "whoCaller", "written", "replay", "disclaimer",
      ...Array.from({ length: 7 }, (_, i) => [`lines[${i}].role`, `lines[${i}].text`]).flat(),
    ],
  },
  {
    n: "4",
    title: "the trust strip",
    summaryTitle: "Trust strip",
    where: "French home + contact pages",
    source: "copy.ts",
    pick: (m) => [m.copy.trustFacts.en, m.copy.trustFacts.fr],
    keys: [
      "heading", "entityLabel", "registerUk", "registerAu",
      "transparencyLabel", "transparency", "recordsLabel", "records",
      "basisLabel", "basis", "privacyLink",
    ],
  },
  {
    n: "5",
    title: "city-page furniture ⚠️ BLOCKING",
    summaryTitle: "**City-page furniture**",
    where: "Every future French city page",
    blocking: "**Yes — gates Paris and Brussels-FR**",
    // Rendered by build-review-page.mjs only — the markdown a reviewer marks up
    // stays plain, and this would sit between the heading and the table.
    note: "Nothing French can launch in a city until this cluster is signed off. If you only have time for one section, this is the one.",
    source: "copy.ts",
    pick: (m) => [m.copy.cityPage.en, m.copy.cityPage.fr],
    keys: [
      "storyEyebrow", "storyHeading", "scenariosEyebrow", "scenariosHeading",
      "aiEyebrow", "aiHeading", "districtsEyebrow", "districtsHeading", "districtsNote",
      "faqEyebrow", "faqHeading", "othersEyebrow", "othersHeading",
      "closingHeading", "closingBody",
    ],
  },
  {
    n: "6a",
    title: "VoxStay, product page",
    summaryTitle: "VoxStay (hotels)",
    summaryN: "6",
    where: "`/fr` and `/be-fr` product pages",
    blocking: "No, but see the note below",
    source: "products.ts",
    prefix: "voxstay.",
    pick: (m) => [m.products.intlProducts.en, m.products.intlProducts.fr],
    keys: [
      "voxstay.featuresHeading", "voxstay.faqHeading", "voxstay.ctaHeading", "voxstay.ctaLabel",
      "voxstay.title", "voxstay.description", "voxstay.eyebrow", "voxstay.h1", "voxstay.lede",
      "voxstay.statusLabel", "voxstay.statusNote",
      ...Array.from({ length: 3 }, (_, i) => [`voxstay.features[${i}].title`, `voxstay.features[${i}].body`]).flat(),
      ...Array.from({ length: 3 }, (_, i) => [`voxstay.faqs[${i}].q`, `voxstay.faqs[${i}].a`]).flat(),
    ],
  },
  {
    n: "6b",
    title: "VoxStay, products overview",
    where: "`/fr` and `/be-fr` product pages",
    source: "products.ts",
    skipSummary: true,
    pick: (m) => [m.products.intlProductsOverview.en, m.products.intlProductsOverview.fr],
    keys: ["capabilities.voxstay.outcome", "capabilities.voxstay.body"],
  },
  {
    n: "7",
    title: "two market lines",
    summaryTitle: "Two market lines",
    where: "`/fr` about page; FR/BE trust cards",
    source: "markets.ts",
    whereHeader: "Where",
    englishHeader: "English (reference / gloss)",
    rows: (m) => {
      const at = (base, path) => get(m.markets.marketContent[base], path);
      return [
        {
          key: "`/fr` about page, intro",
          en: "We're a small Sydney shop with one product and no wish to turn it into a suite. Vox came from an unglamorous observation: the missed call is what costs a dining room most, and nobody had built the tool that simply picks up.",
          fr: at("/fr", "copy.about.intro"),
        },
        {
          key: "`/fr` trust card — AI Act citation clause (new, 7 Sep)",
          en: "…falls under the transparency duties of the EU AI Act (Article 50, Regulation (EU) 2024/1689).",
          fr: at("/fr", "copy.home.trust.items[1].body"),
        },
        {
          key: "`/be-fr` trust card — same clause, deliberately worded differently",
          en: "(Same meaning; the wording differs from `/fr` on purpose — an automated gate measures how similar the two French pages are, so they must not converge.)",
          fr: at("/be-fr", "copy.home.trust.items[1].body"),
        },
      ];
    },
  },
];

/* ------------------------------------------------------------------ helpers */

/** Resolve "a.b[0].c" against an object. Throws with the full path on a miss. */
export function get(obj, path) {
  let cur = obj;
  // Test BEFORE descending, so the error names the segment that is actually
  // missing rather than the one after it.
  for (const seg of path.replace(/\[(\d+)\]/g, ".$1").split(".")) {
    if (cur == null || !(seg in Object(cur))) {
      throw new Error(`extract-fr-review: path "${path}" broke at "${seg}"`);
    }
    cur = cur[seg];
  }
  if (typeof cur !== "string") {
    throw new Error(`extract-fr-review: path "${path}" is ${typeof cur}, expected string`);
  }
  return cur;
}

/** Markdown table cells cannot contain a raw pipe or newline. */
const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ").trim();

function rowsFor(cluster, mods) {
  if (cluster.rows) return cluster.rows(mods);
  const [en, fr] = cluster.pick(mods);
  return cluster.keys.map((k) => ({ key: `\`${k}\``, en: get(en, k), fr: get(fr, k) }));
}

/* --------------------------------------------------------------- discovery */

/**
 * Which French a batch could possibly need to cover.
 *
 * The CLUSTERS above are hand-declared, which reproduces a past batch exactly
 * but cannot NOTICE new French — that is how the AI Act citation clauses were
 * written and shipped on the morning of 7 Sep 2026 without appearing in any
 * cluster until someone remembered them. `--since <ref>` closes that: it diffs
 * every French leaf string against a git ref and reports what is new or changed,
 * which is the real definition of "needs a native pass".
 *
 * Language-scoped modules expose `{ en, fr }`; markets.ts is market-scoped, so
 * the whole /fr and /be-fr subtrees are French by construction.
 */
const FR_ROOTS = {
  "copy.ts": (m) =>
    Object.entries(m)
      .filter(([, v]) => v && typeof v === "object" && typeof v.fr === "object" && v.en)
      .map(([name, v]) => [name, v.fr]),
  "products.ts": (m) =>
    Object.entries(m)
      .filter(([, v]) => v && typeof v === "object" && typeof v.fr === "object" && v.en)
      .map(([name, v]) => [name, v.fr]),
  "markets.ts": (m) =>
    ["/fr", "/be-fr"].map((base) => [base, m.marketContent?.[base] ?? {}]),
};

/** Flatten an object to Map("root.a.b[0]" → string). Non-strings are ignored. */
function leaves(root, prefix, into = new Map()) {
  const walk = (node, path) => {
    if (typeof node === "string") { into.set(path, node); return; }
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(root, prefix);
  return into;
}

async function frLeavesAt(dir) {
  const out = new Map();
  for (const [file, pick] of Object.entries(FR_ROOTS)) {
    const abs = resolve(dir, "src/data/intl", file);
    // A module that genuinely did not exist at an older ref is fine — there is
    // nothing to compare. A module that EXISTS but fails to build is a bug, and
    // must not be swallowed: silently skipping it reports its every string as
    // "new", which is exactly the false alarm this tool exists to avoid.
    if (!existsSync(abs)) continue;
    let mod;
    try {
      mod = await loadTS(abs);
    } catch (err) {
      throw new Error(
        `extract-fr-review: could not load ${file} from ${dir}.\n` +
          `  If this is a historical ref, the checkout is probably incomplete — ` +
          `copy.ts and markets.ts import via the "@/" alias, which esbuild only ` +
          `resolves with tsconfig.json alongside src/.\n  ${err.message.split("\n")[0]}`,
        { cause: err },
      );
    }
    for (const [name, root] of pick(mod)) leaves(root, `${file}:${name}`, out);
  }
  return out;
}

/** Materialise `src/` at a ref in a temp dir so its modules can be imported. */
async function frLeavesAtRef(ref) {
  const dir = mkdtempSync(resolve(tmpdir(), "fr-review-"));
  try {
    execSync(`git archive ${JSON.stringify(ref)} src tsconfig.json | tar -x -C ${JSON.stringify(dir)}`, {
      cwd: ROOT, stdio: ["ignore", "ignore", "pipe"],
    });
    return await frLeavesAt(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** @returns {Promise<{added: string[], changed: string[], covered: Set<string>}>} */
export async function frChangesSince(ref) {
  const [now, then] = await Promise.all([frLeavesAt(ROOT), frLeavesAtRef(ref)]);
  const added = [], changed = [];
  for (const [path, text] of now) {
    if (!then.has(path)) added.push(path);
    else if (then.get(path) !== text) changed.push(path);
  }
  return { added: added.sort(), changed: changed.sort(), now };
}

/* ------------------------------------------------------------------ render */

function render(mods) {
  const clusters = CLUSTERS.map((c) => ({ ...c, data: rowsFor(c, mods) }));
  const total = clusters.reduce((n, c) => n + c.data.length, 0);
  const blocking = clusters.filter((c) => c.blocking?.startsWith("**Yes"));

  const summary = clusters
    .filter((c) => !c.skipSummary)
    .map((c) => `| ${c.summaryN ?? c.n} | ${c.summaryTitle ?? c.title} | ${c.where} | ${c.blocking ?? "No"} |`)
    .join("\n");

  const body = clusters
    .map((c) => {
      const head = `### Cluster ${c.n} — ${c.title} (source: \`${c.source}\`)`;
      const cols = `| ${c.whereHeader ?? "Path"} | ${c.englishHeader ?? "English (reference)"} | French (draft) | Your correction |\n|---|---|---|---|`;
      const rows = c.data.map((r) => `| ${cell(r.key)} | ${cell(r.en)} | ${cell(r.fr)} | |`).join("\n");
      return `${head}\n\n${cols}\n${rows}\n`;
    })
    .join("\n");

  return `# French copy review — BitePerk international site

**Prepared for:** ${META.preparedFor} · **Date:** ${META.date} · **Requested by:** ${META.requestedBy}

## What this is

BitePerk's international site (biteperk.com) ships in five trees — \`/en\`, \`/gb-en\` (UK), \`/fr\` (France), \`/be-en\` and \`/be-fr\` (Belgium). The French you reviewed on **${META.sincePass}** is live and unchanged; this document collects **only the French written since then**, which is marked \`DRAFT\` in the source and has never had a native pass.

Everything below is already on the site or is one merge away from it, so a correction here changes what prospects read. One item is a hard blocker: the **city-page furniture** gates every future French city page (Paris, Brussels-FR) — nothing French can launch in a city until it is signed off.

## How to use it

Each table has an English reference column, the current French draft, and an empty **Your correction** column. You can:
- leave a cell empty if the draft is fine,
- rewrite the French in the cell, or
- write a short note ("too familiar", "wrong register") and we'll redraft.

Marking up this file directly, or replying with just the rows you'd change, both work.

## Register and constraints

- **Vouvoiement throughout**, professional but not stiff — the same voice as the July copy.
- The audience is **restaurant and hotel operators**, not developers. Plain words beat technical ones.
- We describe a **pilot programme**, never a shipped European product: there is no European office, no European phone number, and no local staff. If a draft implies otherwise, that is a bug worth flagging.
- Legal phrasing (GDPR/RGPD article references, the AI Act citation) is deliberate and checked by automated gates — please correct the *French*, but flag rather than remove a citation.

## The clusters

| # | Cluster | Where it appears | Blocking? |
|---|---|---|---|
${summary}

**On VoxStay (cluster 6):** this is the hotel receptionist product, in development. It's the one we'd most like your eye on as an operator as well as a native speaker — if a claim reads as overpromising in French, say so.


${body}
---

## What happens after you send this back

1. We apply your corrections and drop the \`DRAFT\` markers.
2. The French city-page furniture (cluster ${blocking.map((c) => c.n).join(", ")}) unblocks Paris and Brussels-FR — those pages get written next.
3. VoxStay's French goes from draft to prospect-ready.

Thank you — this is the pass that lets the French side of the site grow.
` + `<!-- ${total} rows -->\n`;
}

/** Everything after the evidence header a filed review may carry. */
const stripFiled = (s) => {
  const i = s.indexOf("# French copy review");
  return (i === -1 ? s : s.slice(i)).replace(/\n<!-- \d+ rows -->\n?$/, "").trimEnd();
};

async function loadModules() {
  const [copy, products, markets] = await Promise.all([
    loadTS(INTL("copy.ts")), loadTS(INTL("products.ts")), loadTS(INTL("markets.ts")),
  ]);
  return { copy, products, markets };
}

/**
 * The clusters with their rows resolved — shared with build-review-page.mjs so
 * the page and the markdown are built from ONE extraction, not from the page
 * re-parsing the markdown. A parser between them is a bug waiting to happen.
 */
export async function collectClusters() {
  const mods = await loadModules();
  return CLUSTERS.map((c) => ({ ...c, data: rowsFor(c, mods) }));
}

export async function buildReview() {
  return render(await loadModules());
}

/* --------------------------------------------------------------------- cli */

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const arg = (f) => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
  const since = arg("--since");
  if (since) {
    const { added, changed } = await frChangesSince(since);
    const report = (label, paths) => {
      if (!paths.length) return;
      console.log(`\n${label} (${paths.length}):`);
      for (const p of paths) console.log(`  ${p}`);
    };
    report("NEW French since " + since, added);
    report("CHANGED French since " + since, changed);
    const n = added.length + changed.length;
    console.log(
      n
        ? `\n${n} French string(s) written since ${since} — each needs a native pass.\n` +
            `Add the ones in scope to CLUSTERS above, then regenerate with --out.`
        : `\nNo French has changed since ${since}.`,
    );
    process.exit(0);
  }

  const doc = await buildReview();
  const rows = Number(doc.match(/<!-- (\d+) rows -->/)[1]);
  const check = arg("--check");

  if (check) {
    const want = stripFiled(readFileSync(check, "utf8"));
    if (stripFiled(doc) !== want) {
      console.error(`extract-fr-review: regenerated document DIFFERS from ${check}.`);
      console.error("  Either the French changed in src/ (expected — file a NEW dated review),");
      console.error("  or this script drifted from the document it must be able to reproduce.");
      process.exit(1);
    }
    console.log(`extract-fr-review: reproduces ${check} exactly (${rows} rows).`);
  } else {
    const out = arg("--out");
    if (out) { writeFileSync(out, doc); console.log(`extract-fr-review: ${out} — ${rows} rows across ${CLUSTERS.length} clusters.`); }
    else process.stdout.write(doc);
  }
}
