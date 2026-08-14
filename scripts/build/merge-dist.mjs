#!/usr/bin/env node
/**
 * Assemble the single biteperk.com deploy directory (single-domain rev.3).
 *
 * Inputs (build both first):
 *   dist/         — the AU build (Astro base /au-en; flat output, refs /au-en/**)
 *   dist-global/  — the international build (/en/ + /fr/ + shared root assets)
 *
 * Output:
 *   dist-site/    — served by the biteperk-global hosting target as biteperk.com
 *     /au-en/**       the AU site (dist/ relocated under the base it references)
 *     /en/**, /fr/**  the international trees (from dist-global/)
 *     /_astro, /og …  shared assets at root (from dist-global/)
 *     sitemap-index.xml + sitemap-0.xml   merged (au-en + en + fr)
 *     robots.txt, llms.txt, humans.txt    root, whole-site
 *   dist-cctld/   — placeholder public dir for the redirect-only biteperk.com.au host
 *
 * Run:  npm run build && npm run build:global && node scripts/build/merge-dist.mjs
 */
import {
  rmSync, mkdirSync, cpSync, existsSync, readFileSync, writeFileSync, readdirSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTS } from "./_load-ts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const locales = await loadTS(join(ROOT, "src/data/locales.ts"));
const AU = join(ROOT, "dist");
const GLOBAL = join(ROOT, "dist-global");
const SITE = join(ROOT, "dist-site");
const CCTLD = join(ROOT, "dist-cctld");
const ORIGIN = "https://biteperk.com";

for (const [name, p] of [["dist", AU], ["dist-global", GLOBAL]]) {
  if (!existsSync(p)) {
    console.error(`merge-dist: ${name}/ not found. Run: npm run build && npm run build:global`);
    process.exit(1);
  }
}

// Root-level files that belong ONLY at the site root, never nested under /au-en.
const ROOT_ONLY = new Set([
  "robots.txt", "llms.txt", "humans.txt", "sitemap-0.xml", "sitemap-index.xml",
]);

// 1. Fresh output.
rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

// 2. International build → site root (en, fr, _astro, og, favicon, 404, …).
//    Its own robots/llms/sitemap are overwritten with merged versions below.
cpSync(GLOBAL, SITE, { recursive: true });

// 3. AU build → /au-en/**, minus the root-only files.
mkdirSync(join(SITE, "au-en"), { recursive: true });
cpSync(AU, join(SITE, "au-en"), {
  recursive: true,
  filter: (src) => !ROOT_ONLY.has(src.slice(AU.length + 1)),
});

// 4. Merge sitemaps (au-en locs + en/fr locs) into one urlset at the root.
const urlsFrom = (file) => {
  if (!existsSync(file)) return [];
  const xml = readFileSync(file, "utf8");
  return [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => m[0]);
};
const auUrls = urlsFrom(join(AU, "sitemap-0.xml"));
// Keep only the /au-en/** locs from the AU sitemap (defensive; it should already
// be all /au-en because the AU build's Astro base is /au-en).
const auEnUrls = auUrls.filter((u) => {
  const loc = u.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? "";
  return loc.startsWith(`${ORIGIN}/au-en/`);
});
const intlUrls = urlsFrom(join(GLOBAL, "sitemap-0.xml")); // /en + /fr
const allUrls = [...auEnUrls, ...intlUrls];
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  allUrls.join("\n") +
  `\n</urlset>\n`;
writeFileSync(join(SITE, "sitemap-0.xml"), sitemap);
writeFileSync(
  join(SITE, "sitemap-index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `<sitemap><loc>${ORIGIN}/sitemap-index.xml</loc></sitemap>\n`.replace(
      "sitemap-index.xml</loc>",
      "sitemap-0.xml</loc>",
    ) +
    `</sitemapindex>\n`,
);

// 5. Root robots.txt — welcomes crawlers, points at the merged sitemap.
const auRobots = existsSync(join(AU, "robots.txt"))
  ? readFileSync(join(AU, "robots.txt"), "utf8")
  : "User-agent: *\nAllow: /\n";
// The blanket .com.au -> /au-en rewrite below is right for PAGE references,
// but robots.txt also names the root-only files (sitemap + llms.txt). Those
// live at the site ROOT on the merged host (see ROOT_ONLY above), not under
// /au-en, so they must be rewritten first — otherwise robots.txt advertises
// /au-en/sitemap-index.xml and /au-en/llms.txt, which 404, and crawlers that
// read the comment lines are pointed at nothing.
const robots = [...ROOT_ONLY].reduce(
  (acc, f) => acc.replaceAll(`https://biteperk.com.au/${f}`, `${ORIGIN}/${f}`),
  auRobots.replace(/Sitemap:.*$/m, `Sitemap: ${ORIGIN}/sitemap-index.xml`),
).replace(/https:\/\/biteperk\.com\.au/g, `${ORIGIN}/au-en`);
writeFileSync(join(SITE, "robots.txt"), robots);

// 6. Root llms.txt + humans.txt — from the AU build (primary market), with the
//    friendly .com.au address rewritten to the canonical /au-en home. (Source
//    public/*.txt stay on .com.au, so the AU-only check-cities gate is unaffected.)
//
//    The root llms.txt then gains the GLOBAL build's sections: the single
//    domain serves ONE /llms.txt, and until 29 Jul 2026 this loop shipped the
//    AU file verbatim — dist-global/llms.txt (locale homes, market cities) was
//    written, gated by check-cities, and served by nothing. Same family as the
//    other "gate validates a file that doesn't ship" bugs in CLAUDE.md; found
//    live, when the deployed /llms.txt had zero of the gated city lines.
for (const f of ["llms.txt", "humans.txt"]) {
  if (existsSync(join(AU, f))) {
    let txt = readFileSync(join(AU, f), "utf8").replace(
      /https:\/\/biteperk\.com\.au/g,
      `${ORIGIN}/au-en`,
    );
    if (f === "llms.txt") {
      const intlLines = locales
        .localesForTarget("global")
        .map((l) => `- ${l.label}: ${ORIGIN}${l.base}/`)
        .join("\n");
      const citySection = readFileSync(join(GLOBAL, "llms.txt"), "utf8")
        .split(/^## /m)
        .find((s) => s.startsWith("Market city pages"));
      const cityBlock = citySection ? `## ${citySection.trim()}` : "";
      txt =
        txt.trimEnd() +
        `\n\n## International sites (same company, biteperk.com locale trees)\n` +
        intlLines +
        (cityBlock ? `\n\n${cityBlock}` : "") +
        "\n";
    }
    writeFileSync(join(SITE, f), txt);
  }
}

// 7. Placeholder public dir for the redirect-only biteperk.com.au host.
rmSync(CCTLD, { recursive: true, force: true });
mkdirSync(CCTLD, { recursive: true });
writeFileSync(
  join(CCTLD, "index.html"),
  `<!doctype html><meta charset=utf-8><title>biteperk.com.au</title>` +
    `<meta http-equiv=refresh content="0; url=${ORIGIN}/au-en/">` +
    `<link rel=canonical href="${ORIGIN}/au-en/">` +
    `<p>Moved to <a href="${ORIGIN}/au-en/">biteperk.com/au-en</a>.`,
);

const count = (d) => readdirSync(d).length;
const globalBases = locales.localesForTarget("global").map((l) => l.base).join(", ");
console.log(
  `merge-dist: dist-site/ ready — /au-en (${count(join(SITE, "au-en"))} entries), ` +
    `${globalBases}, ${allUrls.length} sitemap URLs. dist-cctld/ placeholder written.`,
);
