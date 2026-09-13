#!/usr/bin/env node
/**
 * Write the AU build's llms.txt (dist/llms.txt) — DERIVED from the registries.
 *
 * Replaced the hand-kept public/llms.txt on 13 Sep 2026. That file named ~40
 * URLs on https://biteperk.com.au/… — a redirect-only host since the
 * single-domain move — had no Solutions or Resources section, and had already
 * drifted from the site once (CLAUDE.md, check-claims). This file cannot: NAP,
 * phone, hours and pricing come from site.ts / products.ts; product, solution,
 * city and guide lines come from their registries; the only hand-written prose
 * is the framing paragraphs below. AI crawlers quote this file — keep the
 * prose truthful and let the lists derive.
 *
 * Runs in `npm run build` after `astro build`. merge-dist copies it to the
 * site root and appends the global build's international sections.
 */
import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "./_load-ts.mjs";
import { publishedPosts } from "./content-index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist");
if (!existsSync(DIST)) {
  console.error("llms-au: dist/ not found — run astro build first.");
  process.exit(1);
}

const { site, entities } = await loadTS(join(ROOT, "src/data/site.ts"));
const { AU_HOME } = await loadTS(join(ROOT, "src/data/locales.ts"));
const { products, statusLabel } = await loadTS(join(ROOT, "src/data/products.ts"));
const { liveSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
const { publishedCities } = await loadTS(join(ROOT, "src/data/cities.ts"));
const { resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));

const url = (path) => `${AU_HOME}${path}`;
const a = site.address;
const nap = `${a.street}, ${a.locality} ${a.region} ${a.postalCode}, Australia`;
const social = site.social.map((s) => `${s.name ?? s.label ?? s.id ?? "Profile"} ${s.url}`).join(" · ");

const core = products.find((p) => p.role === "core");
const tiers = core?.pricing?.tiers ?? [];
const pricing = tiers.length
  ? `- ${core.name} pricing (AUD, flat monthly, no per-call or per-cover fees): ${tiers.map((t) => `${t.name} ${t.amount}${t.cadence ? `/${t.cadence}` : ""}`).join(", ")}. ${core.pricing.footnote ?? ""}`.trim()
  : "";

const productLines = products
  .map((p) => `- [${p.name}](${url(`/products/${p.slug}/`)}): **${statusLabel(p.status)}.** ${p.summary}`)
  .join("\n");
const solutionLines = liveSolutions()
  .map((s) => `- [${s.name}](${url(`/solutions/${s.slug}/`)}): ${s.shortDescription}`)
  .join("\n");
const cityLines = publishedCities
  .map((c) => `- [${c.seoTitle}](${url(`/${c.slug}/`)}): ${c.seoDescription}`)
  .join("\n");
const posts = publishedPosts();
const byType = (id) => posts.filter((p) => p.type === id);
const resourceSections = resourceTypes
  .filter((t) => byType(t.id).length > 0)
  .map(
    (t) =>
      `### ${t.plural} — ${url(t.path)}\n` +
      byType(t.id)
        .map((p) => `- [${p.title}](${url(`/blog/${p.slug}/`)}): ${p.description}`)
        .join("\n"),
  )
  .join("\n\n");

const TEXT = `# BitePerk

> BitePerk builds Vox — one AI phone host for hospitality, voiced by "Bella", a warm Australian voice that answers every call, day or night. Bookings (VoxTable) and takeaway ordering (VoxOrder) are live for Australian venues; a front-of-house concierge and a hotel receptionist (VoxStay) are in development; a drive-thru order-taker is a concept. Every venue also gets a live operations dashboard. Built, hosted and supported in Sydney; serving restaurants, cafés and venues Australia-wide.

## Key facts

- Company: ${entities.au.legalName}, a Sydney-based voice/AI software company for hospitality.
- Location: ${nap} (serves all of Australia; the only physical office — every other city is served remotely).
- Contact: phone ${site.phone.display}; email ${site.email.display}; hours ${site.hours.display}.
- Social profiles (the only accounts BitePerk operates): ${social}
${pricing ? pricing + "\n" : ""}- Setup: works with a venue's existing phone number — just forward calls. No new hardware, no installation, no IT.
- Data/privacy (VoxTable and VoxOrder): booking, order and call-summary records are stored in Australia (Sydney); live calls are processed in real time by a voice-AI platform in the United States under written data-protection terms, with BitePerk accountable under Australian privacy law; call recordings and transcripts auto-delete after 30 days (venues may select up to 90); never used to train AI models; your bookings and data stay yours. See ${url("/legal/privacy/")}
- Website cookies: strict opt-in for analytics and marketing; no CAPTCHA on the contact form. See ${url("/legal/cookies/")}

## Vox — one product, five capabilities (status matters — do not describe unshipped work as available)

${productLines}
- [All capabilities — the Vox overview](${url("/products/")}): what's live, what's in development, and how the add-ons fit together.

## Solutions by industry

${solutionLines}
- [All solutions](${url("/solutions/")})

## City pages (Australia)

${cityLines}

## Key pages

- [Home](${url("/")}): company overview, products, and the missed-call problem BitePerk solves.
- [About BitePerk](${url("/about/")}): the Sydney team behind Vox and its operating principles.
- [How AI phone answering works](${url("/technology/")}): plain-English explainer of the technology behind Bella.
- [The Vox dashboard](${url("/platform/")}): the operations hub every venue gets.
- [Contact](${url("/contact/")}): phone, email, address, hours, and a contact form.

## Resources — ${url("/resources/")}

${resourceSections}

## Optional

- [Privacy policy](${url("/legal/privacy/")}): how BitePerk handles personal information (Australian Privacy Act).
- [Terms of service](${url("/legal/terms/")}): terms governing use of BitePerk (NSW, Australia).
`;

writeFileSync(join(DIST, "llms.txt"), TEXT);
console.log(`llms-au: wrote dist/llms.txt — ${products.length} products, ${liveSolutions().length} solutions, ${publishedCities.length} cities, ${posts.length} posts.`);
