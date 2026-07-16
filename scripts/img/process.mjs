/**
 * v2 imagery pipeline — neutral brand grade + responsive variants.
 * See docs/art-direction.md for the slot library and hard rules.
 *
 * Reads masters from scripts/img/intake/<slot>.png (or .jpg), applies
 * the neutral brand grade, and emits AVIF + WebP + JPG at 768/1280/1920
 * into public/images/v2/. Writes LQIP + intrinsic dimensions +
 * reviewed:false per slot into src/data/image-manifest.json.
 *
 * reviewed is sticky: a slot already marked reviewed:true keeps it on
 * re-run UNLESS the master file changed (tracked via sourceHash), in
 * which case it resets to false and must be re-reviewed.
 *
 * Usage: npm run images:v2   (node scripts/img/process.mjs)
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const INTAKE = join(ROOT, "scripts", "img", "intake");
const OUT = join(ROOT, "public", "images", "v2");
const MANIFEST = join(ROOT, "src", "data", "image-manifest.json");

mkdirSync(INTAKE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const widths = [768, 1280, 1920];

// Encoding budgets (match scripts/grade.mjs so perf gates hold)
const avifOpts = { quality: 58, effort: 6 };
const webpOpts = { quality: 78, effort: 5 };
const jpgOpts = { quality: 82, mozjpeg: true };

/**
 * Neutral brand grade (docs/art-direction.md "Colour story").
 *
 * One grade that sits on both the dark (#0a0b0d) and light (#faf9f6)
 * themes: balanced midpoint, slightly warm, lifted blacks (~5%), soft
 * highlight rolloff. Hue-preserving ops only — no .tint() (duotone).
 *
 * 1. modulate hue -6°: nudge neutrals toward amber (brand gold family)
 * 2. modulate saturation +5%: gentle, not the v1 punchy grade
 * 3. linear(0.93, 13): gain <1 rolls highlights off ~248 while the
 *    +13 offset lifts blacks ~5% (13/255)
 * 4. gamma 1.05: hold midtone density after the black lift
 */
function applyNeutralGrade(pipeline) {
  return pipeline
    .modulate({ saturation: 1.05, hue: -6 })
    .linear(0.93, 13)
    .gamma(1.05);
}

const masters = existsSync(INTAKE)
  ? readdirSync(INTAKE).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];

if (masters.length === 0) {
  console.error(
    "No masters in scripts/img/intake/ — drop <slot>.png files per docs/art-direction.md"
  );
  process.exit(1);
}

const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};

console.log(`Processing ${masters.length} master(s)…\n`);

for (const file of masters) {
  const slot = file.replace(/\.(png|jpe?g)$/i, "");
  const inputPath = join(INTAKE, file);
  const input = readFileSync(inputPath);
  const sourceHash = createHash("sha256").update(input).digest("hex").slice(0, 16);

  const prev = manifest[slot];
  const unchanged = prev && prev.sourceHash === sourceHash;

  const meta = await sharp(input).metadata();
  console.log(`→ ${slot} (${meta.width}×${meta.height}${unchanged ? ", master unchanged" : ""})`);

  for (const w of widths) {
    for (const fmt of ["avif", "webp", "jpg"]) {
      const outFile = join(OUT, `${slot}-${w}.${fmt}`);
      let pipe = applyNeutralGrade(
        sharp(input).resize({ width: w, withoutEnlargement: true })
      );
      if (fmt === "avif") pipe = pipe.avif(avifOpts);
      else if (fmt === "webp") pipe = pipe.webp(webpOpts);
      else pipe = pipe.jpeg(jpgOpts);
      await pipe.toFile(outFile);
    }
  }

  const lqipBuf = await applyNeutralGrade(
    sharp(input).resize({ width: 24 }).blur(1)
  )
    .jpeg({ quality: 40 })
    .toBuffer();

  manifest[slot] = {
    src: `/images/v2/${slot}`,
    width: meta.width,
    height: meta.height,
    lqip: `data:image/jpeg;base64,${lqipBuf.toString("base64")}`,
    sourceHash,
    // Human review against docs/art-direction.md hard rules is mandatory
    // before use — check-images.mjs fails the build otherwise.
    reviewed: unchanged ? prev.reviewed : false,
  };
}

// Stable slot ordering keeps the manifest diff-friendly
const sorted = Object.fromEntries(
  Object.keys(manifest).sort().map((k) => [k, manifest[k]])
);
writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

console.log(`\nWrote variants at ${widths.join("/")} (AVIF/WebP/JPG) to public/images/v2/`);
console.log(`Wrote ${Object.keys(sorted).length} slot(s) to src/data/image-manifest.json`);
const unreviewed = Object.entries(sorted).filter(([, v]) => !v.reviewed);
if (unreviewed.length) {
  console.log(
    `Unreviewed slots (flip reviewed:true after on-page check): ${unreviewed.map(([k]) => k).join(", ")}`
  );
}
