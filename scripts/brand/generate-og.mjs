/**
 * Generates per-route Open Graph cards (1200×630 PNG) for biteperk.com.au.
 *
 * Renders an HTML template with satori → SVG → @resvg/resvg-js → PNG.
 * Outputs to /public/og/*.png so Astro picks them up during build.
 *
 * Usage:
 *   node scripts/brand/generate-og.mjs
 *
 * Adding a card: append to the `cards` array below.
 *
 * Fonts: Inter loaded from Google Fonts at script start. The Bella image
 * is embedded as a base64 data URL from /public/bella/portrait.png so
 * satori can render it without a network request.
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const PUBLIC = join(ROOT, "public");
// International architecture (PLAN.md §7): cards are per-host. The AU build
// writes public/og/*.png (unchanged); the global build writes public/og/intl/*
// so the two sets never clobber each other. Regenerate with `npm run og` and
// `BUILD_TARGET=global npm run og`, and PIXEL-REVIEW the PNGs before deploy.
const TARGET = process.env.BUILD_TARGET === "global" ? "global" : "au";
const OG_DIR = TARGET === "global" ? join(PUBLIC, "og", "intl") : join(PUBLIC, "og");
const OG_FOOTER = TARGET === "global" ? "biteperk.com" : "biteperk.com.au · Sydney, Australia";

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

// ── Fonts ──────────────────────────────────────────────────────────
// Inter is published by fontsource on unpkg as ttf files which satori
// understands. ttf is verbose but deterministic and CDN-cached.
async function fetchFont(weight) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

console.log("→ fetching Inter weights from fontsource CDN…");
const [interBold, interRegular] = await Promise.all([
  fetchFont(800),
  fetchFont(500),
]);
console.log(`  Inter 800: ${Math.round(interBold.length / 1024)} KB`);
console.log(`  Inter 500: ${Math.round(interRegular.length / 1024)} KB`);

// ── Bella slot image as base64 (on-brand editorial host on a booking headset;
//    art-direction forbids sci-fi/robot portraits) ───────────────────
const bellaPath = join(PUBLIC, "images", "hands-headset-1920.jpg");
const bellaB64 = existsSync(bellaPath)
  ? `data:image/jpeg;base64,${readFileSync(bellaPath).toString("base64")}`
  : null;

// ── Card template ──────────────────────────────────────────────────
function card({ eyebrow, headline, accent = "#f5c418", showBella = true }) {
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "row",
        background: "#0a0b0d",
        fontFamily: "Inter",
        color: "#f7f8fa",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Halo behind
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-200px",
              right: "-200px",
              width: "700px",
              height: "700px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "-200px",
              left: "-100px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(26,77,26,0.45), transparent 70%)",
            },
          },
        },
        // Left: text
        {
          type: "div",
          props: {
            style: {
              flex: showBella ? "1.4" : "1",
              padding: "80px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            },
            children: [
              // Brand row
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        width: 52,
                        height: 52,
                        src:
                          "data:image/svg+xml;utf8," +
                          encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='52' height='52'><polygon points='32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24' fill='${accent}' stroke='#1a4d1a' stroke-width='1.2'/><rect x='29' y='20' width='2.5' height='22' fill='#1a4d1a' rx='0.8'/><rect x='32.5' y='20' width='2.5' height='14' fill='#1a4d1a' rx='0.8'/><rect x='35.5' y='20' width='2.5' height='22' fill='#1a4d1a' rx='0.8'/></svg>`
                          ),
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "28px",
                          fontWeight: 800,
                          display: "flex",
                          gap: "2px",
                        },
                        children: [
                          { type: "span", props: { children: "bite" } },
                          {
                            type: "span",
                            props: {
                              style: { color: accent, fontStyle: "italic" },
                              children: "perk",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Headline
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", gap: "16px" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "20px",
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          fontWeight: 500,
                          color: accent,
                        },
                        children: eyebrow,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          // Fit-to-box: long headlines (the French city pages
                          // run to ~75+ chars — "Au bouchon, le patron est au
                          // piano…") wrap to 6 lines and overflowed the 630px
                          // card at 80px. Step long headlines down so they fit;
                          // short ones keep the large size. Text-only cards
                          // (showBella:false) start at 80, image cards at 64.
                          fontSize: showBella
                            ? "64px"
                            : headline.length > 62
                              ? "62px"
                              : "80px",
                          fontWeight: 800,
                          lineHeight: "1.05",
                          letterSpacing: "-2.5px",
                          maxWidth: "720px",
                        },
                        children: headline,
                      },
                    },
                  ],
                },
              },
              // Footer
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "18px",
                    color: "#9aa1ad",
                    letterSpacing: "1.2px",
                  },
                  children: OG_FOOTER,
                },
              },
            ],
          },
        },
        // Right: Bella
        showBella && bellaB64
          ? {
              type: "div",
              props: {
                style: {
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "80px",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "360px",
                        height: "450px",
                        borderRadius: "24px",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "#14171c",
                        display: "flex",
                      },
                      children: [
                        {
                          type: "img",
                          props: {
                            src: bellaB64,
                            width: 360,
                            height: 450,
                            style: {
                              width: "360px",
                              height: "450px",
                              objectFit: "cover",
                              objectPosition: "center",
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            }
          : null,
      ].filter(Boolean),
    },
  };
}

/**
 * International cards (BUILD_TARGET=global → public/og/intl/). Their own set:
 * the AU cards' copy is AU-specific (city pages, "Made in Sydney").
 *
 * DERIVED from src/data/intl (the same resolveCopy the pages render), so the
 * cards can never drift from the on-page copy and every locale in locales.ts
 * gets its pair automatically — the old hand-written list had to be kept in
 * sync by comment. Filenames follow the [...intl].astro suffix rule: /en keeps
 * the legacy unsuffixed home.png/contact.png (already-shared URLs never
 * churn); every other locale gets -<seg> (home-fr.png, home-gb-en.png, …).
 */
async function buildGlobalCards() {
  const { loadTS } = await import("../build/_load-ts.mjs");
  const { localesForTarget, locales } = await loadTS(join(ROOT, "src/data/locales.ts"));
  const { resolveCopy, resolveHero } = await loadTS(join(ROOT, "src/data/intl/index.ts"));

  const en = locales.find((l) => l.base === "/en");
  const cards = [
    {
      file: "default.png",
      eyebrow: "Voice + AI for hospitality",
      headline: resolveCopy(en).home.h1,
    },
  ];
  for (const l of localesForTarget("global")) {
    const c = resolveCopy(l);
    const suffix = l.base === "/en" ? "" : `-${l.base.slice(1)}`;
    cards.push(
      { file: `home${suffix}.png`, eyebrow: c.home.eyebrow, headline: c.home.h1 },
      {
        file: `contact${suffix}.png`,
        eyebrow: c.home.pilot.eyebrow,
        headline: c.contact.h1,
        showBella: false,
      },
    );
  }

  // Product cards are keyed by LANGUAGE, not by locale base: the product prose
  // is identical across the English trees (see intl/products.ts on why), so a
  // per-base set would be five byte-identical PNGs per product. The page picks
  // the same names — keep the two rules together if either changes.
  const { intlProducts, intlProductsOverview } = await loadTS(
    join(ROOT, "src/data/intl/products.ts"),
  );
  const { PRODUCT_SLUGS } = await loadTS(join(ROOT, "src/data/product-slugs.ts"));
  for (const lang of ["en", "fr"]) {
    const ov = intlProductsOverview[lang];
    cards.push({ file: `products-${lang}.png`, eyebrow: ov.eyebrow, headline: ov.h1 });
    for (const slug of PRODUCT_SLUGS) {
      const prod = intlProducts[lang][slug];
      cards.push({
        file: `${slug}-${lang}.png`,
        // The status pill IS the eyebrow: three of the five are not shipping, and
        // a social card that hides that is the dishonest version of this page.
        eyebrow: prod.statusLabel,
        headline: prod.h1,
        showBella: false,
      });
    }
  }

  // Solution cards, keyed by LANGUAGE like the product cards (same prose across
  // the English trees). The status pill is the eyebrow — three verticals sit
  // on unshipped products and the card must say so.
  const { intlSolutions, intlSolutionsOverview } = await loadTS(join(ROOT, "src/data/intl/solutions.ts"));
  const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
  for (const lang of ["en", "fr"]) {
    cards.push({ file: `solutions-index-${lang}.png`, eyebrow: intlSolutionsOverview[lang].eyebrow, headline: intlSolutionsOverview[lang].h1, showBella: false });
    for (const s of renderableSolutions()) {
      const copy = intlSolutions[lang][s.slug];
      cards.push({ file: `solutions-${s.slug}-${lang}.png`, eyebrow: copy.statusLabel, headline: copy.h1, showBella: false });
    }
  }

  // Market city cards, derived from intl/cities.ts — check-cities.mjs requires
  // public/og/intl/<slug><suffix>.png on disk for every published city, same
  // suffix rule as the core pages above. The eyebrow is the market hero pill
  // ("United Kingdom · Pilot programme"): honest geography, never a premises.
  const { intlCities } = await loadTS(join(ROOT, "src/data/intl/cities.ts"));
  for (const city of intlCities.filter((c) => c.published)) {
    const cityLocale = locales.find((l) => l.base === city.base);
    const suffix = city.base === "/en" ? "" : `-${city.base.slice(1)}`;
    cards.push({
      file: `${city.slug}${suffix}.png`,
      eyebrow: (cityLocale && resolveHero(cityLocale)?.pill) || city.name,
      headline: city.heroHeadline,
      showBella: false,
    });
  }
  return cards;
}
const globalCards = TARGET === "global" ? await buildGlobalCards() : [];

const auCards = [
  {
    file: "default.png",
    eyebrow: "Voice + AI for hospitality",
    headline: "Made in Sydney. Answered in Sydney.",
  },
  {
    file: "home.png",
    eyebrow: "Voice + AI for hospitality",
    headline: "We build voice + AI for hospitality.",
  },
  {
    file: "products.png",
    eyebrow: "The catalogue",
    headline: "Five products. One mission.",
    showBella: false,
  },
  {
    file: "voxtable.png",
    eyebrow: "VoxTable · Live",
    headline: "Every call. Every time. Every guest booked.",
  },
  {
    file: "voxorder.png",
    eyebrow: "VoxOrder · In development",
    headline: "Pick up every order, even at the rush.",
    accent: "#ffb840",
  },
  {
    file: "voxconcierge.png",
    eyebrow: "VoxConcierge · In development",
    headline: "Everything between the booking and the table.",
    accent: "#7ad97a",
  },
  {
    file: "voxstay.png",
    eyebrow: "VoxStay · In development",
    headline: "Bella answers the hotel phone.",
    // No accent: the card accent also tints the `perk` in the wordmark, and
    // the brand kit keeps that gold. The teal is the product glow on the page,
    // not a social-card colour.
  },
  {
    file: "voxdrive.png",
    eyebrow: "VoxDrive · Concept",
    headline: "An order taker that knows the Saturday queue.",
    showBella: false,
  },
  {
    file: "contact.png",
    eyebrow: "Talk to a human",
    headline: "One conversation away from a quieter Friday night.",
    showBella: false,
  },
  // City landing pages — keep slugs in sync with src/data/cities.ts
  // (scripts/gates/check-cities.mjs fails the build if a published city has no card).
  {
    file: "sydney.png",
    eyebrow: "AI for Sydney restaurants",
    headline: "Never miss another Sydney booking.",
  },
  {
    file: "melbourne.png",
    eyebrow: "AI for Melbourne restaurants",
    headline: "Never miss another Melbourne booking.",
  },
  {
    file: "brisbane.png",
    eyebrow: "AI for Brisbane restaurants",
    headline: "Never miss another Brisbane booking.",
  },
  {
    file: "perth.png",
    eyebrow: "AI for Perth restaurants",
    headline: "Never miss another Perth booking.",
  },
  {
    file: "adelaide.png",
    eyebrow: "AI for Adelaide restaurants",
    headline: "Never miss another Adelaide booking.",
  },
  {
    file: "gold-coast.png",
    eyebrow: "AI for Gold Coast restaurants",
    headline: "Never miss another Gold Coast booking.",
  },
  {
    file: "blog.png",
    eyebrow: "Guides",
    headline: "Field notes for a busier, calmer floor.",
    showBella: false,
  },
  {
    file: "technology.png",
    eyebrow: "Under the hood",
    headline: "How Bella actually answers the phone.",
  },
  {
    file: "platform.png",
    eyebrow: "The platform",
    headline: "See every call. Live.",
    showBella: false,
  },
];

// Solutions + resources cards are DERIVED from their registries (nine solution
// pages shared /og/default.png until 13 Sep 2026). Namespaced directories so a
// vertical slug can never collide with a product's.
if (TARGET === "au") {
  const { loadTS } = await import("../build/_load-ts.mjs");
  const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
  const { resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));
  for (const d of ["solutions", "resources"]) if (!existsSync(join(OG_DIR, d))) mkdirSync(join(OG_DIR, d), { recursive: true });
  auCards.push({ file: "solutions/index.png", eyebrow: "Solutions by industry", headline: "Built for your kind of venue.", showBella: false });
  for (const s of renderableSolutions()) {
    auCards.push({ file: `solutions/${s.slug}.png`, eyebrow: s.name, headline: s.page.hero.headline, showBella: false });
  }
  auCards.push({ file: "resources/index.png", eyebrow: "Resources", headline: "Guides, comparisons and proof for a busy phone.", showBella: false });
  for (const t of resourceTypes) {
    auCards.push({ file: `resources/${t.path.replace(/^\/resources\/|\/$/g, "")}.png`, eyebrow: "Resources", headline: t.plural, showBella: false });
  }
}

// Every product page sets og:image=/og/<slug>.png (ProductLayout.astro), every
// solution page /og/solutions/<slug>.png, every resources page
// /og/resources/<segment>.png — a missing card fails check-assets on the built
// page, but only after a full build. Fail here instead, at the moment the card
// is missing.
if (TARGET === "au") {
  const { loadTS } = await import("../build/_load-ts.mjs");
  const { PRODUCT_SLUGS } = await loadTS(join(ROOT, "src/data/product-slugs.ts"));
  const { renderableSolutions } = await loadTS(join(ROOT, "src/data/solutions.ts"));
  const { resourceTypes } = await loadTS(join(ROOT, "src/data/resources.ts"));
  const have = new Set(auCards.map((c) => c.file));
  const missing = [
    ...PRODUCT_SLUGS.map((s) => `${s}.png`),
    ...renderableSolutions().map((s) => `solutions/${s.slug}.png`),
    ...resourceTypes.map((t) => `resources/${t.path.replace(/^\/resources\/|\/$/g, "")}.png`),
  ].filter((f) => !have.has(f));
  if (missing.length) {
    throw new Error(`generate-og: no AU card for ${missing.join(", ")} — add an auCards entry.`);
  }
}

const cards = TARGET === "global" ? globalCards : auCards;

for (const c of cards) {
  const tree = card({
    eyebrow: c.eyebrow,
    headline: c.headline,
    accent: c.accent,
    showBella: c.showBella !== false,
  });
  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: interBold, weight: 800, style: "normal" },
      { name: "Inter", data: interRegular, weight: 500, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  const out = join(OG_DIR, c.file);
  writeFileSync(out, png);
  const kb = Math.round(png.length / 1024);
  console.log(`✓ ${c.file} (${kb} KB)`);
}

console.log(`\n${cards.length} OG cards written to ${OG_DIR}/`);
