/**
 * Brand asset kit generator — the reproducible source of every exported
 * BitePerk logo file in public/brand/.
 *
 * The site itself never loads these (the nav/footer mark is the inline
 * StarMark.astro SVG); this kit exists for everything OUTSIDE the codebase:
 * directory listings, social profiles, partner decks, press. Reference
 * master: public/brand/biteperk-logo.jpeg (official flat-colour logo —
 * gold star, green fork, green "bite" + gold italic "perk" on dark).
 *
 * Outputs (public/brand/):
 *   biteperk-mark.svg            transparent star+fork, flat official colours
 *   biteperk-mark-512.png        raster mark, transparent (Schema.org logo)
 *   biteperk-logo-dark.svg/.png  lockup for DARK surfaces (white "bite")
 *   biteperk-logo-light.svg/.png lockup for LIGHT surfaces (ink "bite")
 * Outputs (public/):
 *   apple-touch-icon.png         180×180, mark on ink #0a0b0d, padded
 *
 * Usage: npm run brand   (network needed — Inter fetched like generate-og)
 *
 * Colour contract: the wordmark follows the SITE palette (white/ink "bite",
 * gold italic "perk" — decision 24 Jul 2026), not the JPEG's green "bite";
 * green appears only inside the mark. Keep in sync with StarMark.astro and
 * .brand-name/.perk in global.css.
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const BRAND = join(ROOT, "public", "brand");
const PUBLIC = join(ROOT, "public");
if (!existsSync(BRAND)) mkdirSync(BRAND, { recursive: true });

const GOLD = "#f5c418";
const GREEN = "#1a4d1a";
const INK = "#0a0b0d";
const PAPER_TEXT = "#14161a"; // --white in light theme

// ── The mark ───────────────────────────────────────────────────────
// Same 64×64 geometry as StarMark.astro (the single source of the star
// polygon), flat official colours, no gradient/shadow — exports must be
// surface-agnostic. The fork is the full silhouette from the official
// logo: three tines into a yoke, handle running down toward the star's
// lower notch.
const STAR_POINTS = "32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24";
// Fork silhouette: three tines flowing into a soft-shouldered yoke, then a
// rounded handle — matched by eye against the JPEG (no plug-like square
// shoulders, no outline on the star: the official mark is flat).
const FORK = [
  `<rect x="27.0" y="16" width="2.7" height="12.5" rx="1.35" fill="${GREEN}"/>`,
  `<rect x="30.65" y="16" width="2.7" height="12.5" rx="1.35" fill="${GREEN}"/>`,
  `<rect x="34.3" y="16" width="2.7" height="12.5" rx="1.35" fill="${GREEN}"/>`,
  `<path d="M28.3 26.5 h7.4 q2.3 0 2.3 2.3 v0.9 q0 2.8 -2.8 2.8 h-0.6 v10.2 q0 2.6 -2.6 2.6 t-2.6 -2.6 v-10.2 h-0.6 q-2.8 0 -2.8 -2.8 v-0.9 q0 -2.3 2.3 -2.3 z" fill="${GREEN}"/>`,
].join("\n  ");

function markSvg({ size = 64, background = null, pad = 0 } = {}) {
  const box = 64 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" width="${size}" height="${size}">
  ${background ? `<rect width="${box}" height="${box}" fill="${background}"/>` : ""}
  <g transform="translate(${pad},${pad})">
  <polygon points="${STAR_POINTS}" fill="${GOLD}" stroke-linejoin="round"/>
  ${FORK}
  </g>
</svg>`;
}

// ── Fonts (same source as generate-og) ─────────────────────────────
async function fetchFont(weight, style = "normal") {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-${style}.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
console.log("→ fetching Inter from fontsource CDN…");
const [inter700, inter700i] = await Promise.all([fetchFont(700), fetchFont(700, "italic")]);

// ── Lockup (mark + wordmark) via satori → pure-vector SVG ──────────
async function lockupSvg({ biteColor }) {
  const tree = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "420px",
        display: "flex",
        alignItems: "center",
        gap: "40px",
        padding: "40px",
      },
      children: [
        {
          type: "img",
          props: {
            src: `data:image/svg+xml;utf8,${encodeURIComponent(markSvg({ size: 340 }))}`,
            width: 340,
            height: 340,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: "190px", letterSpacing: "-0.02em" },
            children: [
              { type: "span", props: { style: { color: biteColor, fontWeight: 700 }, children: "bite" } },
              {
                type: "span",
                props: {
                  style: { color: GOLD, fontWeight: 700, fontStyle: "italic", paddingRight: "16px" },
                  children: "perk",
                },
              },
            ],
          },
        },
      ],
    },
  };
  return satori(tree, {
    width: 1200,
    height: 420,
    fonts: [
      { name: "Inter", data: inter700, weight: 700, style: "normal" },
      { name: "Inter", data: inter700i, weight: 700, style: "italic" },
    ],
  });
}

function png(svg, width) {
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}

// ── Emit ───────────────────────────────────────────────────────────
const mark = markSvg({ size: 512 });
writeFileSync(join(BRAND, "biteperk-mark.svg"), markSvg({ size: 64 }));
writeFileSync(join(BRAND, "biteperk-mark-512.png"), png(mark, 512));
console.log("  brand/biteperk-mark.svg + biteperk-mark-512.png");

const dark = await lockupSvg({ biteColor: "#f7f8fa" });
const light = await lockupSvg({ biteColor: PAPER_TEXT });
writeFileSync(join(BRAND, "biteperk-logo-dark.svg"), dark);
writeFileSync(join(BRAND, "biteperk-logo-light.svg"), light);
writeFileSync(join(BRAND, "biteperk-logo-dark-1200.png"), png(dark, 1200));
writeFileSync(join(BRAND, "biteperk-logo-light-1200.png"), png(light, 1200));
console.log("  brand/biteperk-logo-{dark,light}.svg + -1200.png");

// apple-touch-icon: iOS composites its own corner radius; ship a full-bleed
// ink square with the mark padded inside.
const touch = markSvg({ size: 180, background: INK, pad: 9 });
writeFileSync(join(PUBLIC, "apple-touch-icon.png"), png(touch, 180));
console.log("  public/apple-touch-icon.png (180×180)");

console.log("\nDone. Pixel-review every output before shipping (satori/resvg");
console.log("rendering can shift between versions — same rule as the OG cards).");
