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
  date: "15 September 2026",
  requestedBy: "Sam Kalaliya",
  /** The pass this batch is measured against. */
  sincePass: "15 September 2026",
  /**
   * Batch-specific narrative. render() reads these so the document speaks to the
   * batch in front of it rather than a hard-coded earlier one — the 15 Sep (A)
   * batch was chrome/contact/city framing with a VoxStay note; this one is not.
   */
  whatThisIs:
    "BitePerk's international site (biteperk.com) ships in five trees — `/en`, `/gb-en` (UK), `/fr` (France), `/be-en` and `/be-fr` (Belgium). This batch collects French that was written for the site earlier but never made it into a review document: the industry **solution** pages, the **resources** section furniture, and the trust panel's **supervisory-authority** and **team** lines. None of it has had a native pass.",
  stakes:
    "Everything below already renders on the French trees, so a correction here changes what a French prospect reads. There is no hard deploy-blocker in this batch — but until it is signed off, these strings carry `DRAFT` / \"not yet reviewed\" markers in the source and should not be treated as prospect-ready.",
  /** Optional mid-document callout (batch A used one for VoxStay). null = none. */
  midNote: null,
  nextSteps: [
    "We drop the `DRAFT` / \"not yet reviewed\" markers on these strings in the source.",
    "The industry solution pages and the resources section go from draft to prospect-ready across `/fr` and `/be-fr`.",
    "The trust panel's supervisory-authority and team lines are cleared for every French page.",
  ],
};

/**
 * One entry per cluster. `keys` is an ordered list of paths into the objects
 * returned by `pick`; `[n]` indexes arrays. Order is the reading order in the
 * document, so group related keys together deliberately.
 *
 * Two escape hatches from `keys`:
 *   - `rows(mods)` returns hand-built rows — for market-scoped copy with no EN
 *     counterpart (the English column is then a gloss).
 *   - `leafRows(en, fr)` pairs EVERY leaf of an en/fr object by path, for a
 *     cluster that reviews a whole module rather than a hand-picked key list.
 *
 * ── The 15 Sep 2026 batch (B) ────────────────────────────────────────────────
 * The gap that the 15 Sep batch (A) surfaced: French flagged "next Ludovic
 * batch" that never actually made it into a cluster of any review document — the
 * trust panel's supervisory-authority + "where the team is" lines (copy.ts
 * trustFacts), and the whole of intl/solutions.ts and intl/resources.ts. This
 * batch reviews exactly those.
 *
 * Batch A (chrome + contact + city + market lines, incl. `languageRegion`) is
 * filed and PASSED at 2026-09-15-french-review-ludovic.md and, like the 7 Sep
 * and 13 Sep batches, is no longer regenerable from this config (by design: a
 * new batch replaces CLUSTERS; the filed document is the record). This batch's
 * document is 2026-09-15-french-review-ludovic-batch-b.md.
 */
export const CLUSTERS = [
  {
    n: "1",
    title: "trust panel — supervisory-authority and \"where the team is\" lines",
    summaryTitle: "Trust panel — supervisory authority + team line",
    where: "The trust strip (TrustPanel) on every French page",
    source: "copy.ts",
    pick: (m) => [m.copy.trustFacts.en, m.copy.trustFacts.fr],
    keys: ["authorityLabel", "authorityBody", "teamLabel"],
  },
  {
    n: "2",
    title: "solutions overview — the industry index page",
    summaryTitle: "Solutions overview page",
    where: "`/fr/solutions/` and `/be-fr/solutions/` — the industry index",
    source: "solutions.ts",
    rows: (m) => leafRows(m.solutions.intlSolutionsOverview.en, m.solutions.intlSolutionsOverview.fr),
  },
  {
    n: "3",
    title: "solutions by industry — every industry solution page",
    summaryTitle: "Solution pages (8 industries)",
    where: "Each French industry page: restaurants, hotels, cafés, takeaway, drive-thru, medical, professional services, groups",
    source: "solutions.ts",
    rows: (m) => leafRows(m.solutions.intlSolutions.en, m.solutions.intlSolutions.fr),
  },
  {
    n: "4",
    title: "resources — index labels and type descriptions",
    summaryTitle: "Resources furniture",
    where: "`/fr/resources/` index, article furniture and the six resource-type labels",
    source: "resources.ts",
    rows: (m) => leafRows(m.resources.intlResources.en, m.resources.intlResources.fr),
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

/**
 * Pair EVERY leaf of an en/fr object by path — for a cluster that reviews a
 * whole module rather than a hand-picked key list. Both sides are the same
 * shape (TypeScript enforces it), so an fr leaf with no en counterpart is a bug
 * and throws, rather than silently emitting a half-empty row. Uses `leaves`
 * (hoisted, from the discovery section) so the flattening is shared, not
 * re-implemented.
 */
function leafRows(enRoot, frRoot) {
  const en = leaves(enRoot, "");
  const fr = leaves(frRoot, "");
  return [...fr.keys()].sort().map((path) => {
    if (!en.has(path)) throw new Error(`extract-fr-review: fr leaf "${path}" has no en counterpart`);
    return { key: `\`${path}\``, en: en.get(path), fr: fr.get(path) };
  });
}

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
// Language-scoped modules all expose their bundles as `{ en, fr }` exports;
// one picker serves them. markets.ts is market-scoped and needs its own.
const byEnFr = (m) =>
  Object.entries(m)
    .filter(([, v]) => v && typeof v === "object" && typeof v.fr === "object" && v.en)
    .map(([name, v]) => [name, v.fr]);
const FR_ROOTS = {
  "copy.ts": byEnFr,
  "products.ts": byEnFr,
  "solutions.ts": byEnFr,
  "resources.ts": byEnFr,
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

${META.whatThisIs}

${META.stakes}

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
${META.midNote ? `\n${META.midNote}\n` : ""}

${body}
---

## What happens after you send this back

${META.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Thank you — this is the pass that lets the French side of the site grow.
` + `<!-- ${total} rows -->\n`;
}

/** Everything after the evidence header a filed review may carry. */
const stripFiled = (s) => {
  const i = s.indexOf("# French copy review");
  return (i === -1 ? s : s.slice(i)).replace(/\n<!-- \d+ rows -->\n?$/, "").trimEnd();
};

async function loadModules() {
  const [copy, products, markets, solutions, resources] = await Promise.all([
    loadTS(INTL("copy.ts")), loadTS(INTL("products.ts")), loadTS(INTL("markets.ts")),
    loadTS(INTL("solutions.ts")), loadTS(INTL("resources.ts")),
  ]);
  return { copy, products, markets, solutions, resources };
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
