#!/usr/bin/env node
/**
 * WCAG contrast gate. Parses the `contrast-manifest` comment block at the
 * bottom of src/styles/tokens.css and fails (exit 1) if any declared
 * text/surface pair drops below AA (4.5:1). Run in CI and locally:
 *   node scripts/gates/check-contrast.mjs
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");

const lines = [...css.matchAll(/^\s*\*\s*pair\s+(\S+)\s+(\S+)\s+(#[0-9a-fA-F]{6})\s+on\s+(\S+)\s+(#[0-9a-fA-F]{6})/gm)];
if (lines.length === 0) {
  console.error("check-contrast: no contrast-manifest pairs found in tokens.css");
  process.exit(1);
}

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let failed = 0;
for (const [, theme, fgName, fg, bgName, bg] of lines) {
  const r = ratio(fg, bg);
  const ok = r >= 4.5;
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  [${theme}] ${fgName} ${fg} on ${bgName} ${bg} = ${r.toFixed(2)}:1`
  );
}

if (failed) {
  console.error(`\ncheck-contrast: ${failed} pair(s) below WCAG AA (4.5:1).`);
  process.exit(1);
}
console.log(`\ncheck-contrast: all ${lines.length} pairs pass AA.`);
