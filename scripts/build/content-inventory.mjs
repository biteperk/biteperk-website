#!/usr/bin/env node
/**
 * Content inventory — renders docs/phase1/CONTENT-INVENTORY.md from the two
 * content collections and the Definition-of-Done registry in resources.ts.
 *
 * Why generated: PLAN.md's acceptance list ("20+ guides, 10+ comparisons…")
 * and a hand-kept tracker drift within a week. This file is the tracker, it
 * is derived, and tests/unit/content-inventory.test.mjs fails when the filed
 * copy is stale — so `node scripts/build/content-inventory.mjs --out
 * docs/phase1/CONTENT-INVENTORY.md` is part of shipping a post.
 *
 * Per market (AU + every launched international base): published and draft
 * counts per resource type against the DoD, the gap, and the last publish
 * date. Then field hygiene per post — what blocks a draft (a case study with
 * no approved customer, a report with no sources), an over-long title with
 * no seoTitle, a description outside the SERP window, no relatedSolutions,
 * a relatedSolutions slug that is not a solution. Frontmatter is parsed with
 * a real YAML parser here (content-index.mjs stays regex-only on purpose —
 * it runs inside the locales.ts bundle).
 *
 * Exports `buildInventory()` and `lintPost()` for the unit test.
 */
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadTS } from "./_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BLOG = join(ROOT, "src/content/blog");
const INTL = join(ROOT, "src/content/intl-resources");

const fmOf = (src) => yaml.load(src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "") ?? {};
const wordsOf = (src) => (src.split(/\n---\n/).slice(1).join(" ").match(/[A-Za-zÀ-ÿ'’-]+/g) ?? []).length;

function readDir(dir, extra = () => ({})) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const src = readFileSync(join(dir, f), "utf8");
      const fm = fmOf(src);
      return { slug: f.replace(/\.md$/, ""), words: wordsOf(src), draft: fm.draft === true, type: fm.type ?? "guide", ...fm, ...extra(f) };
    });
}

export function loadPosts() {
  const au = readDir(BLOG).map((p) => ({ ...p, scope: "/au-en", lang: "en" }));
  const intl = [];
  if (existsSync(INTL)) {
    for (const lang of readdirSync(INTL)) {
      const d = join(INTL, lang);
      if (!statSync(d).isDirectory()) continue;
      for (const p of readDir(d)) intl.push({ ...p, lang, markets: p.markets ?? [] });
    }
  }
  return { au, intl };
}

/** Field-hygiene findings for one post. Pure — the unit test drives it with fixtures. */
export function lintPost(p, solutionSlugs) {
  const out = [];
  const title = p.seoTitle ?? p.title ?? "";
  if (title.length > 60) out.push(`title ${title.length} chars with no shorter seoTitle`);
  const d = p.description ?? "";
  if (d.length < 120 || d.length > 170) out.push(`description ${d.length} chars (want 120–170)`);
  if (!Array.isArray(p.relatedSolutions) || p.relatedSolutions.length === 0) out.push("no relatedSolutions");
  else for (const s of p.relatedSolutions) if (!solutionSlugs.has(s)) out.push(`relatedSolutions "${s}" is not a solution`);
  if (p.type === "case-study" && !p.customer?.approved) out.push("BLOCKED: case study without an approved customer (customer.approved)");
  if (p.type === "industry-report" && !(p.sources?.length > 0)) out.push("BLOCKED: industry report without sources");
  if ((p.words ?? 0) < 600) out.push(`${p.words} words (thin: want ≥600)`);
  return out;
}

const pad = (s, n) => String(s).padEnd(n);

export async function buildInventory() {
  const { RESOURCE_DOD_AU, RESOURCE_DOD_INTL, resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));
  const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
  const { localesForTarget } = await loadTS(join(ROOT, "src/data/locales.ts"));
  const solutionSlugs = new Set(renderableSolutions().map((s) => s.slug));
  const { au, intl } = loadPosts();

  const table = (label, posts, dod) => {
    const rows = resourceTypes.map((t) => {
      const mine = posts.filter((p) => p.type === t.id);
      const pub = mine.filter((p) => !p.draft);
      const iso = (d) => (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10);
      const last = pub.map((p) => iso(p.publishDate)).sort().at(-1) ?? "—";
      const gap = Math.max(0, dod[t.id] - pub.length);
      return `| ${pad(t.plural, 17)} | ${pad(pub.length, 9)} | ${pad(mine.length - pub.length, 6)} | ${pad(dod[t.id], 4)} | ${pad(gap === 0 ? "✓" : gap, 4)} | ${last} |`;
    });
    const need = resourceTypes.reduce((n, t) => n + Math.max(0, dod[t.id] - posts.filter((p) => p.type === t.id && !p.draft).length), 0);
    return [`### ${label} — ${need === 0 ? "Definition of Done met" : `${need} piece(s) to Definition of Done`}`, "", "| Type              | Published | Drafts | DoD  | Gap  | Last published |", "|---|---|---|---|---|---|", ...rows, ""].join("\n");
  };

  const sections = [table("Australia (`/au-en`)", au, RESOURCE_DOD_AU)];
  for (const l of localesForTarget("global")) {
    const mine = intl.filter((p) => p.markets.includes(l.base) && p.lang === l.copyLang);
    sections.push(table(`${l.label} (\`${l.base}\`)`, mine, RESOURCE_DOD_INTL));
  }

  const hygiene = [];
  for (const p of [...au.map((p) => ({ ...p, where: `src/content/blog/${p.slug}.md` })), ...intl.map((p) => ({ ...p, where: `src/content/intl-resources/${p.lang}/${p.slug}.md` }))]) {
    const issues = lintPost(p, solutionSlugs);
    if (issues.length) hygiene.push(`- \`${p.where}\`${p.draft ? " (draft)" : ""}: ${issues.join("; ")}`);
  }

  return [
    "# Content inventory — Phase 1 tracker (generated)",
    "",
    "> **Generated** by `node scripts/build/content-inventory.mjs --out docs/phase1/CONTENT-INVENTORY.md` from the content collections and `RESOURCE_DOD_*` in `src/data/resources.ts`. Do not edit by hand — `tests/unit/content-inventory.test.mjs` fails when this file is stale. Regenerate it in the same commit as the post.",
    ">",
    "> Templates for each type, with the truthfulness checklist, live in `docs/phase1/templates/`. Cadence: `docs/marketing-engine.md`.",
    "",
    ...sections,
    "## Field hygiene",
    "",
    hygiene.length ? hygiene.join("\n") : "- Every post passes: title/seoTitle within 60, description 120–170, relatedSolutions valid, proof and sources present where the type demands them, ≥600 words.",
    "",
  ].join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const md = await buildInventory();
  const i = process.argv.indexOf("--out");
  if (i !== -1) { writeFileSync(join(ROOT, process.argv[i + 1]), md); console.log(`content-inventory: wrote ${process.argv[i + 1]}`); }
  else process.stdout.write(md);
}
