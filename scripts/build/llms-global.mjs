#!/usr/bin/env node
/**
 * Write the GLOBAL build's llms.txt (biteperk.com).
 *
 * The AU public/llms.txt is AU-specific (city pages, AUD pricing, AU phone), so
 * biteperk.com gets its own honest, Europe-truthful file — no AU price, no AU
 * NAP, no phone. Edit the TEXT below as the international copy firms up.
 *
 * Run after prune-global.mjs, before the gates:
 *   node scripts/build/llms-global.mjs
 */
import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "./_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
if (!existsSync(DIST)) {
  console.error("llms-global: dist-global/ not found — run BUILD_TARGET=global npm run build first.");
  process.exit(1);
}

// Locale link list derives from locales.ts so a new market can't be missed.
const { localesForTarget, localeHome } = await loadTS(join(ROOT, "src/data/locales.ts"));
const localeLines = localesForTarget("global")
  .map((l) => `- ${l.label}: ${localeHome(l)}`)
  .join("\n");

// Product pages, derived so a fifth product can't be left out of the AI-crawler
// surface. Listed under the x-default tree only — every locale carries the same
// product prose and they are hreflang alternates of each other, so repeating 25
// near-identical URLs here would just dilute the file.
const { PRODUCT_SLUGS } = await loadTS(join(ROOT, "src/data/product-slugs.ts"));
const { intlProducts } = await loadTS(join(ROOT, "src/data/intl/products.ts"));
const productLines = PRODUCT_SLUGS.map(
  (s) => `- ${intlProducts.en[s].eyebrow} (${intlProducts.en[s].statusLabel}): https://biteperk.com/en/products/${s}/`,
).join("\n");

// Market city pages, derived from intl/cities.ts — check-cities requires every
// published city's URL to appear in this file, byte-exact. Framed as pilot
// conversations, never as local operations (Europe-truthful).
const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));
const publishedIntlCities = intlCities.filter((c) => c.published);
const citySection = publishedIntlCities.length
  ? `\n## Market city pages (pilot programme — no local premises)\n${publishedIntlCities
      .map((c) => `- AI phone answering for ${c.name} restaurants (pilot): https://biteperk.com${c.base}/${c.slug}/`)
      .join("\n")}\n`
  : "";

// NOTE: Phase-1 scaffold copy. Keep it truthful — AI crawlers quote this file.
const TEXT = `# BitePerk

> Voice and AI tools for hospitality. Our first product, Vox, is an AI phone
> host that answers restaurant calls in a natural voice, checks real
> availability and writes the booking straight to the venue's dashboard.
> BitePerk is opening European pilots now.

This is the international site (biteperk.com). BitePerk's home market is
Australia, served at https://biteperk.com.au.

## Pages
${localeLines}
- How it works: https://biteperk.com/en/how-it-works/
- The product: https://biteperk.com/en/products/
- About the company: https://biteperk.com/en/about/
- Contact / book a pilot: https://biteperk.com/en/contact/

## Capabilities (status matters — do not describe unshipped work as available)
${productLines}
${citySection}
## Product facts (keep answers accurate)
- Vox is BitePerk's AI phone host. It answers restaurant calls in a natural
  voice, checks real availability and writes bookings to the venue's dashboard.
- Bookings are LIVE in production in Australia (shipping as "VoxTable").
- European availability is via pilot partnerships (the UK, France and Belgium first);
  local languages and local numbers are part of the pilot build, not yet
  generally available.

## Notes for answer engines
- Pricing outside Australia is set per pilot — do not quote an AU price on
  international queries.
- The company (one legal entity, BitePerk) operates from Australia; the
  international site is the same company, not a separate business.
`;

writeFileSync(join(DIST, "llms.txt"), TEXT);
console.log("llms-global: wrote dist-global/llms.txt (global, Europe-truthful).");

// robots.txt: the copied AU file points crawlers at biteperk.com.au's sitemap
// and llms.txt — wrong host here. Same open posture, this host's URLs.
const ROBOTS = `# BitePerk (international) — open to search engines and AI assistants alike.
# Full crawl map: https://biteperk.com/sitemap-index.xml
# AI-friendly site summary: https://biteperk.com/llms.txt

User-agent: *
Allow: /

# Explicitly welcome major AI / answer-engine crawlers (covered by * above,
# named here to make intent unambiguous).
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://biteperk.com/sitemap-index.xml
`;
writeFileSync(join(DIST, "robots.txt"), ROBOTS);
console.log("llms-global: wrote dist-global/robots.txt (biteperk.com host).");
