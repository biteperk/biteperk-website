/**
 * Generates per-route Open Graph cards (1200×630 PNG) for biteperk.com.au.
 *
 * Renders an HTML template with satori → SVG → @resvg/resvg-js → PNG.
 * Outputs to /public/og/*.png so Astro picks them up during build.
 *
 * Usage:
 *   node scripts/generate-og.mjs
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
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const OG_DIR = join(PUBLIC, "og");

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

// ── Bella portrait as base64 ───────────────────────────────────────
const bellaPath = join(PUBLIC, "bella", "portrait.png");
const bellaB64 = existsSync(bellaPath)
  ? `data:image/png;base64,${readFileSync(bellaPath).toString("base64")}`
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
                          fontSize: showBella ? "64px" : "80px",
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
                  children: "biteperk.com.au · Sydney, Australia",
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
                              objectPosition: "right center",
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

const cards = [
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
    headline: "Four products. One mission.",
    showBella: false,
  },
  {
    file: "vocotable.png",
    eyebrow: "VocoTable · Live",
    headline: "Every call. Every time. Every guest booked.",
  },
  {
    file: "vocoorder.png",
    eyebrow: "VocoOrder · In development",
    headline: "Pick up every order, even at the rush.",
    accent: "#ffb840",
  },
  {
    file: "vococoncierge.png",
    eyebrow: "VocoConcierge · In development",
    headline: "Everything between the booking and the table.",
    accent: "#7ad97a",
  },
  {
    file: "vocodrive.png",
    eyebrow: "VocoDrive · Concept",
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
  // (scripts/check-cities.mjs fails the build if a published city has no card).
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
];

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

console.log(`\n${cards.length} OG cards written to public/og/`);
