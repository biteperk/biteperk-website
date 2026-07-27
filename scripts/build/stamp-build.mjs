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
 * The target is DERIVED from BUILD_TARGET, exactly as astro.config.mjs and every
 * gate derives it — never passed as an argument. It was passed once, and the
 * stamp could then contradict the build it was stamping: CI runs a plain
 * `npm run build` with BUILD_TARGET=global (job env), so astro wrote
 * dist-global/ while the hardcoded args said `dist au`. That crashed in CI only
 * because dist/ happened not to exist; with a stale dist/ present it would have
 * stamped the wrong directory with false provenance — silently defeating the
 * mismatch control this whole file exists to provide.
 *
 * Usage: node scripts/build/stamp-build.mjs   (BUILD_TARGET selects the output)
 */
import { writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

if (process.argv.length > 2) {
  console.error(
    `stamp-build: takes no arguments (got ${process.argv.slice(2).join(" ")}). ` +
      `The target is derived from BUILD_TARGET so it cannot disagree with the build.`,
  );
  process.exit(1);
}

const target = process.env.BUILD_TARGET === "global" ? "global" : "au";
const dir = target === "global" ? "dist-global" : "dist";
const out = join(ROOT, dir);
if (!existsSync(out)) {
  console.error(
    `stamp-build: ${dir}/ does not exist (BUILD_TARGET=${process.env.BUILD_TARGET ?? "<unset>"} → target=${target}). ` +
      `Run the build for this target first.`,
  );
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
