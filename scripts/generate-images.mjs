/**
 * Builds the marketing composites — photo + UI-overlay cards.
 *
 * Reads graded photos from public/images/<slug>-1920.jpg (the master)
 * and renders satori-composed UI overlays over them. Outputs both
 * desktop and mobile variants of each composite to
 * public/images/composites/.
 *
 * Re-run whenever the overlay copy or layout changes; the script is
 * idempotent.
 *
 * Usage: node scripts/generate-images.mjs
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGES = join(ROOT, "public", "images");
const COMPOSITES = join(IMAGES, "composites");

if (!existsSync(COMPOSITES)) mkdirSync(COMPOSITES, { recursive: true });

// ── Fonts ──────────────────────────────────────────────────────────
async function fetchFont(weight) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.ttf`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Font ${weight} failed: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

console.log("→ fetching Inter weights…");
const [interBold, interMed, interReg] = await Promise.all([
  fetchFont(800),
  fetchFont(600),
  fetchFont(500),
]);

const fontOpts = [
  { name: "Inter", data: interBold, weight: 800, style: "normal" },
  { name: "Inter", data: interMed, weight: 600, style: "normal" },
  { name: "Inter", data: interReg, weight: 500, style: "normal" },
];

// ── Read a graded photo as base64 ──────────────────────────────────
async function photoDataUri(slug, width) {
  const path = join(IMAGES, `${slug}-${width}.jpg`);
  if (!existsSync(path)) {
    throw new Error(`Missing photo: ${path}. Run npm run images:grade first.`);
  }
  const buf = readFileSync(path);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// ── StarMark inline SVG ────────────────────────────────────────────
function starMarkSvg(size, color = "#f5c418") {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='${size}' height='${size}'><polygon points='32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24' fill='${color}' stroke='#1a4d1a' stroke-width='1.2'/><rect x='29' y='20' width='2.5' height='22' fill='#1a4d1a' rx='0.8'/><rect x='32.5' y='20' width='2.5' height='14' fill='#1a4d1a' rx='0.8'/><rect x='35.5' y='20' width='2.5' height='22' fill='#1a4d1a' rx='0.8'/></svg>`
    )
  );
}

// ── UI overlay cards ───────────────────────────────────────────────
const cardStyle = {
  background: "rgba(17, 19, 23, 0.86)",
  border: "1px solid rgba(245, 196, 24, 0.22)",
  borderRadius: "20px",
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  fontFamily: "Inter",
  color: "#f7f8fa",
  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7)",
};

function bookedCard({ time = "Friday 8:00pm", guests = "4 guests", name = "Sarah" } = {}) {
  return {
    type: "div",
    props: {
      style: { ...cardStyle, width: "320px" },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#f5c418",
              fontWeight: 600,
            },
            children: [
              { type: "img", props: { src: starMarkSvg(18), width: 18, height: 18 } },
              { type: "span", props: { children: "Booked" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              fontVariantNumeric: "tabular-nums",
            },
            children: time,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: "14px", color: "#b8bec8", display: "flex", gap: "10px" },
            children: [
              { type: "span", props: { children: guests } },
              { type: "span", props: { children: "·" } },
              { type: "span", props: { children: name } },
            ],
          },
        },
      ],
    },
  };
}

function incomingCard({ number = "0411 234 567", duration = "0:12" } = {}) {
  return {
    type: "div",
    props: {
      style: { ...cardStyle, width: "300px" },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#f5c418",
              fontWeight: 600,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#f5c418",
                    boxShadow: "0 0 12px #f5c418",
                  },
                },
              },
              { type: "span", props: { children: "Incoming · live" } },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: "22px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.3px",
            },
            children: number,
          },
        },
        {
          type: "div",
          props: {
            style: { fontSize: "13px", color: "#9aa1ad" },
            children: `Bella answering · ${duration}`,
          },
        },
      ],
    },
  };
}

// ── Composite renderer ─────────────────────────────────────────────
async function render({ width, height, photo, layout }) {
  const tree = {
    type: "div",
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        display: "flex",
        background: "#0a0b0d",
      },
      children: [
        // Photo background
        {
          type: "img",
          props: {
            src: photo,
            width,
            height,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              objectFit: "cover",
            },
          },
        },
        // Scrim — bottom-up dark fade so cards always have legible ground
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              background:
                "linear-gradient(180deg, rgba(10,11,13,0.35) 0%, rgba(10,11,13,0.15) 40%, rgba(10,11,13,0.7) 100%)",
            },
          },
        },
        // Layout-specific cards
        ...layout,
      ],
    },
  };

  const svg = await satori(tree, { width, height, fonts: fontOpts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    .render()
    .asPng();
  return png;
}

function positioned(card, top, right, bottom, left) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        ...(top !== undefined && { top: `${top}px` }),
        ...(right !== undefined && { right: `${right}px` }),
        ...(bottom !== undefined && { bottom: `${bottom}px` }),
        ...(left !== undefined && { left: `${left}px` }),
        display: "flex",
      },
      children: [card],
    },
  };
}

// ── Composites ─────────────────────────────────────────────────────
const composites = [
  {
    name: "home-in-the-wild-desktop",
    width: 1600,
    height: 1000,
    photoSlug: "restaurant-evening",
    photoWidth: 1920,
    layout: (w, h) => [positioned(bookedCard({ time: "Friday 8:00pm" }), 80, 80)],
  },
  {
    name: "home-in-the-wild-mobile",
    width: 800,
    height: 1000,
    photoSlug: "restaurant-evening",
    photoWidth: 1280,
    layout: (w, h) => [positioned(bookedCard({ time: "Fri 8:00pm" }), undefined, 40, 80, 40)],
  },
  {
    name: "vocotable-hero-desktop",
    width: 1800,
    height: 1200,
    photoSlug: "restaurant-evening",
    photoWidth: 1920,
    layout: (w, h) => [
      positioned(incomingCard(), 100, undefined, undefined, 80),
      positioned(bookedCard(), undefined, 80, 100, undefined),
    ],
  },
  {
    name: "vocotable-hero-mobile",
    width: 800,
    height: 1200,
    photoSlug: "restaurant-evening",
    photoWidth: 1280,
    layout: (w, h) => [
      positioned(incomingCard(), 80, undefined, undefined, 40),
      positioned(bookedCard({ time: "Fri 8pm" }), undefined, 40, 100, undefined),
    ],
  },
  {
    name: "footer-mood-band-desktop",
    width: 1920,
    height: 360,
    photoSlug: "sydney-harbour-dusk",
    photoWidth: 1920,
    layout: () => [],
  },
  {
    name: "footer-mood-band-mobile",
    width: 800,
    height: 360,
    photoSlug: "sydney-harbour-dusk",
    photoWidth: 1280,
    layout: () => [],
  },
];

// ── Run ────────────────────────────────────────────────────────────
for (const c of composites) {
  const photo = await photoDataUri(c.photoSlug, c.photoWidth);
  const png = await render({
    width: c.width,
    height: c.height,
    photo,
    layout: c.layout(c.width, c.height),
  });
  const out = join(COMPOSITES, `${c.name}.png`);
  writeFileSync(out, png);

  // Also emit AVIF + WebP variants of the composite for the live site
  const buf = png;
  await sharp(buf).avif({ quality: 60 }).toFile(out.replace(/\.png$/, ".avif"));
  await sharp(buf).webp({ quality: 80 }).toFile(out.replace(/\.png$/, ".webp"));

  const kb = Math.round(png.length / 1024);
  console.log(`✓ ${c.name} (${kb} KB PNG, ${c.width}×${c.height})`);
}

console.log(`\n${composites.length} composites written to public/images/composites/`);
