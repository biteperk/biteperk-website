#!/usr/bin/env node
/**
 * Imagery review gate (docs/art-direction.md hard rule 5).
 *
 * Every image is human-reviewed before use: any slot in
 * src/data/image-manifest.json that is REFERENCED from src/ must have
 * reviewed:true, or the build fails.
 *
 * A slot counts as referenced when a file under src/ contains either
 *   - the emitted asset path  images/v2/<slot>
 *   - a slug/slot prop set to it, e.g. slug="city-sydney"
 * Unreferenced slots may stay reviewed:false (staged but not shipped).
 *
 * Run after processing / before build: node scripts/gates/check-images.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = join(ROOT, "src", "data", "image-manifest.json");

if (!existsSync(MANIFEST)) {
  console.log("check-images: no image manifest yet — nothing to gate.");
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const slots = Object.keys(manifest);
if (slots.length === 0) {
  console.log("check-images: manifest is empty — nothing to gate.");
  process.exit(0);
}

// Collect all text sources under src/ (skip the manifest itself)
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(astro|ts|tsx|js|mjs|md|mdx|json)$/.test(name)) acc.push(p);
  }
  return acc;
}
const files = walk(join(ROOT, "src")).filter((p) => p !== MANIFEST);
const corpus = files.map((p) => ({ p, text: readFileSync(p, "utf8") }));

function isReferenced(slot) {
  const pathNeedle = `images/v2/${slot}`;
  const slugRe = new RegExp(`(slug|slot)\\s*[:=]\\s*["'\`]${slot}["'\`]`);
  return corpus.some(({ text }) => text.includes(pathNeedle) || slugRe.test(text));
}

const failures = [];
for (const slot of slots) {
  if (isReferenced(slot) && !manifest[slot].reviewed) failures.push(slot);
}

if (failures.length) {
  console.error(
    "✗ check-images: slots referenced from src/ without human review:\n" +
      failures.map((s) => `  - ${s} (reviewed: false)`).join("\n") +
      "\nReview each against docs/art-direction.md hard rules, then set" +
      ' reviewed: true in src/data/image-manifest.json.'
  );
  process.exit(1);
}

console.log(
  `✓ check-images: ${slots.length} slot(s) in manifest, all referenced slots reviewed.`
);
