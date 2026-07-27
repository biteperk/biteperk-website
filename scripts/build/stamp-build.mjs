#!/usr/bin/env node
/**
 * Stamps the RESOLVED build configuration into the output directory.
 *
 * Why: INTL_LAUNCHED is read from process.env at module load, separately in
 * every process (src/data/locales.ts). Nothing stopped you building with the
 * flag and gating without it — and check-hreflang fails on EXTRA codes as well
 * as missing ones, so that mismatch fails in a way that reads like a gate bug
 * and invites the wrong fix. Relying on people remembering a rule is not a
 * control; this makes the value an artefact of the build that gates read back.
 *
 * Written to a dotfile so both hosting targets' `ignore: ["**\/.*"]` keeps it
 * out of the deploy.
 *
 * Usage: node scripts/build/stamp-build.mjs <dist-dir> <target>
 */
import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const [dir, target] = process.argv.slice(2);
if (!dir || !target) {
  console.error("stamp-build: usage: stamp-build.mjs <dist-dir> <target>");
  process.exit(1);
}
const out = join(ROOT, dir);
if (!existsSync(out)) {
  console.error(`stamp-build: ${dir} does not exist — run the build first.`);
  process.exit(1);
}

// Parsed exactly as locales.ts parses it, so the stamp cannot disagree with
// what the pages were actually rendered with.
const raw = process.env.INTL_LAUNCHED;
const intlLaunched = raw === "true";

writeFileSync(
  join(out, ".build-meta.json"),
  JSON.stringify({ target, intlLaunched, intlLaunchedRaw: raw ?? null }, null, 2) + "\n",
);
console.log(`stamp-build: ${dir}/.build-meta.json — target=${target} intlLaunched=${intlLaunched}`);
