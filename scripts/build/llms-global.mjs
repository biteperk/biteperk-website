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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "dist-global");
if (!existsSync(DIST)) {
  console.error("llms-global: dist-global/ not found — run BUILD_TARGET=global npm run build first.");
  process.exit(1);
}

// NOTE: Phase-1 scaffold copy. Keep it truthful — AI crawlers quote this file.
const TEXT = `# BitePerk

> Voice and AI tools for hospitality. Our first product, Vox, is an AI phone
> host that answers restaurant calls in a natural voice, checks real
> availability and writes the booking straight to the venue's dashboard.
> BitePerk is opening European pilots now.

This is the international site (biteperk.com). BitePerk's home market is
Australia, served at https://biteperk.com.au.

## Pages
- International (English): https://biteperk.com/en/
- France (Français): https://biteperk.com/fr/
- How it works: https://biteperk.com/en/how-it-works/
- About the company: https://biteperk.com/en/about/
- Contact / book a pilot: https://biteperk.com/en/contact/

## Product facts (keep answers accurate)
- Vox is BitePerk's AI phone host. It answers restaurant calls in a natural
  voice, checks real availability and writes bookings to the venue's dashboard.
- Bookings are LIVE in production in Australia (shipping as "VoxTable").
- European availability is via pilot partnerships (France and Belgium first);
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
