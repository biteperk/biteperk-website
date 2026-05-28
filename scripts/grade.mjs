/**
 * Brand colour-grade pass.
 *
 * Reads raw photos from public/images/raw/, applies the Biteperk LUT
 * (warm tone curve, crushed blacks, slight cyan desaturation), and
 * emits AVIF + WebP + JPG variants at three widths.
 *
 * Also emits a 24×16 LQIP base64 thumbnail per photo to
 * src/data/image-placeholders.json. The thumbnail is rendered behind
 * every full image until it loads.
 *
 * Usage: node scripts/grade.mjs
 */
import {
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, "public", "images", "raw");
const OUT = join(ROOT, "public", "images");
const PLACEHOLDERS = join(ROOT, "src", "data", "image-placeholders.json");

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (!existsSync(dirname(PLACEHOLDERS))) mkdirSync(dirname(PLACEHOLDERS), { recursive: true });

// ── Widths to emit ─────────────────────────────────────────────────
const widths = [1920, 1280, 768];

// ── Encoding settings (the budget gates that hold the perf bar) ────
const avifOpts = { quality: 58, effort: 6 };
const webpOpts = { quality: 78, effort: 5 };
const jpgOpts = { quality: 82, mozjpeg: true };

/**
 * The Biteperk LUT, expressed as a sharp pipeline.
 *
 * 1. tint: warm the midtones toward amber
 * 2. modulate: slight saturation lift, slight brightness pull-down
 * 3. linear: crush the blacks
 * 4. gamma: pull the midtone curve to retain shadow detail
 *
 * If you change this, regenerate every photo + spot-check the result.
 */
/**
 * Brand LUT.
 *
 * Apply only operations that preserve hue across the whole image.
 * sharp's .tint() collapses to single-colour duotone and is wrong here.
 *
 * 1. modulate hue toward amber: shift -8° so neutral becomes warm
 * 2. modulate saturation: +12% to compensate for the contrast pull
 * 3. modulate brightness: -3% to settle into the dark theme
 * 4. linear: subtle contrast bump + black point pull
 */
function applyBrandLUT(pipeline) {
  return pipeline
    .modulate({ brightness: 0.97, saturation: 1.12, hue: -8 })
    .linear(1.05, -6);
}

// ── Process one photo ──────────────────────────────────────────────
async function processOne(file) {
  const slug = file.replace(/\.jpg$/, "");
  const inputPath = join(RAW, file);
  const placeholders = {};
  console.log(`→ ${slug}`);

  // Variants: width × format (AVIF + WebP for the live site, JPG for fallback
  // and for the build-time composite generator)
  for (const w of widths) {
    for (const fmt of ["avif", "webp", "jpg"]) {
      const outFile = join(OUT, `${slug}-${w}.${fmt}`);
      let pipe = sharp(inputPath).resize({ width: w, withoutEnlargement: true });
      pipe = applyBrandLUT(pipe);
      if (fmt === "avif") pipe = pipe.avif(avifOpts);
      else if (fmt === "webp") pipe = pipe.webp(webpOpts);
      else pipe = pipe.jpeg(jpgOpts);
      await pipe.toFile(outFile);
    }
  }

  // LQIP — 24 wide blurred jpeg as base64
  const lqipBuf = await applyBrandLUT(
    sharp(inputPath).resize({ width: 24 }).blur(1)
  )
    .jpeg({ quality: 40 })
    .toBuffer();
  placeholders[slug] = `data:image/jpeg;base64,${lqipBuf.toString("base64")}`;

  return { slug, placeholders };
}

// ── Run ────────────────────────────────────────────────────────────
const files = readdirSync(RAW).filter((f) => f.endsWith(".jpg"));
if (files.length === 0) {
  console.error("No photos in public/images/raw/ — run npm run images:fetch first");
  process.exit(1);
}

console.log(`Grading ${files.length} photos…\n`);
const allPlaceholders = {};
for (const file of files) {
  const r = await processOne(file);
  Object.assign(allPlaceholders, r.placeholders);
}

writeFileSync(PLACEHOLDERS, JSON.stringify(allPlaceholders, null, 2) + "\n");

console.log(`\nWrote ${Object.keys(allPlaceholders).length} LQIPs to src/data/image-placeholders.json`);
console.log(`Wrote AVIF + WebP + JPG variants at widths ${widths.join(", ")} to public/images/`);
