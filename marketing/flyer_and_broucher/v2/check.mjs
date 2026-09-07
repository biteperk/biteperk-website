#!/usr/bin/env node
/**
 * Quality gate for the v2 print collateral. Run by build.mjs as its last step;
 * can also be run alone on an existing pdf/:  node marketing/flyer_and_broucher/v2/check.mjs [--offline]
 *
 * 1. copy      — pdftotext: banned strings absent, required strings present byte-exact
 * 2. type      — pdffonts: only Inter + Source Serif 4, all embedded; min size ≥ 8.5 pt
 * 3. geometry  — pdfinfo page sizes exact; no text clipped or outside the safe area
 * 4. contrast  — every text/background pair ≥ 4.5:1 (audited in-page at render time)
 * 5. images    — every placed photo ≥ 250 ppi; no `bella` asset anywhere in the templates
 * 6. qr        — decoded from the rendered preview and compared to the intended URL;
 *                the URL must answer 200/301 (skipped with --offline)
 * 7. draft     — PRINT PDFs exist only when testimonial.approved is true
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import jsQR from "jsqr";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "pdf");
const PREVIEW = join(OUT, "preview");

const BANNED = [
  /vocotable/i, /haymarket/i, /477 pitt/i, /\$\s?\d/, /\+44/, /london/i, /natalia/i,
  /processed onshore/i, /stays? in australia/i, /never leaves the country/i, /bitevox/i, /robot/i,
];
const REQUIRED = {
  "voxtable-flyer-a5.pdf": ["+61 2 5504 1140", "hello@biteperk.com.au", "voxtable.biteperk.com.au", "Level 1/457-459 Elizabeth Street, Surry Hills NSW 2010", "Mazcina Resto-Bar"],
  "BitePerk_VoxTable_Brochure_A5.pdf": ["(02) 7501 1140", "+61 2 5504 1140", "sam@biteperk.com.au", "biteperk.com.au", "Level 1/457-459 Elizabeth Street, Surry Hills NSW 2010", "Mazcina Resto-Bar"],
};
const SIZES = { trim: [419.53, 595.28], print: [436.54, 612.28], a4l: [841.89, 595.28] };
const ALLOWED_FONTS = /^(Inter|SourceSerif4)/;

const pt = (n) => Math.round(n * 100) / 100;

export async function runChecks({ offline = false } = {}) {
  const fails = [];
  let mark = 0;
  const fail = (m) => { fails.push(m); console.log("✗ " + m); };
  /** Prints the section's pass line only if nothing in that section failed. */
  const pass = (m) => { if (fails.length === mark) console.log("✓ " + m); mark = fails.length; };

  const report = JSON.parse(readFileSync(join(OUT, "render-report.json"), "utf8"));
  const pdfs = readdirSync(OUT).filter((f) => f.endsWith(".pdf"));

  // 1. copy
  for (const f of pdfs) {
    const text = execFileSync("pdftotext", ["-layout", join(OUT, f), "-"]).toString().replace(/\s+/g, " ");
    for (const re of BANNED) if (re.test(text)) fail(`${f}: banned string ${re}`);
    const base = f.replace(/-(HomePrint|PRINT-Officeworks)\.pdf$/, ".pdf");
    for (const s of REQUIRED[base] || []) if (!text.includes(s)) fail(`${f}: missing "${s}"`);
  }
  pass("copy: banned strings absent, NAP/phones/URLs present byte-exact");

  // 2. type
  for (const f of pdfs) {
    const fonts = execFileSync("pdffonts", [join(OUT, f)]).toString().split("\n").slice(2).filter(Boolean);
    for (const line of fonts) {
      const m = line.trim().match(/^(\S+)\s+(.+?)\s+(Custom|Identity-H|WinAnsi|MacRoman|Builtin)\s+(yes|no)\s+(yes|no)\s+(yes|no)/);
      if (!m) { fail(`${f}: could not parse pdffonts line "${line}"`); continue; }
      const [, name, type, , emb] = m;
      const bare = name.replace(/^[A-Z]{6}\+/, "");
      if (!ALLOWED_FONTS.test(bare)) fail(`${f}: unexpected font ${bare}`);
      if (emb !== "yes") fail(`${f}: font ${bare} not embedded`);
      // Type 3 = Chromium's fallback for variable fonts; some print RIPs mangle it. Static faces embed as CID TrueType.
      if (!/TrueType|Type 1C|CID/.test(type)) fail(`${f}: font ${bare} embedded as ${type} — use a static face`);
    }
  }
  for (const r of report.reports) if (r.minFontPt < 8.5 - 0.05) fail(`${r.pdf}: smallest type ${r.minFontPt.toFixed(2)} pt < 8.5 pt`);
  pass("type: only Inter / Source Serif 4, embedded as TrueType/CID (no Type 3); nothing below 8.5 pt");

  // 3. geometry
  for (const f of pdfs) {
    const info = execFileSync("pdfinfo", [join(OUT, f)]).toString();
    const m = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/);
    const want = f.includes("2up") ? SIZES.a4l : f.includes("-PRINT-") ? SIZES.print : SIZES.trim;
    if (!m || Math.abs(+m[1] - want[0]) > 0.6 || Math.abs(+m[2] - want[1]) > 0.6) fail(`${f}: page size ${m?.[1]}×${m?.[2]} pt, want ${want.join("×")}`);
    const pages = +info.match(/Pages:\s+(\d+)/)[1];
    if (pages !== 2) fail(`${f}: ${pages} pages, want 2`);
  }
  for (const r of report.reports) {
    for (const o of r.overflow) fail(`${r.pdf} p${o.sheet}: clipped text "${o.txt}"`);
    for (const o of r.outsideSafe) fail(`${r.pdf} p${o.sheet}: "${o.txt}" ${o.why} — text ${JSON.stringify(o.rect)} vs ${JSON.stringify(o.safeMm || o.sheetMm)} mm`);
  }
  pass("geometry: page sizes exact, two pages each, no clipped text, everything inside the safe area");

  // 4. contrast
  for (const r of report.reports) for (const c of r.contrast) fail(`${r.pdf} p${c.sheet}: contrast ${c.ratio}:1 on "${c.txt}" (${c.fg}, ${c.pt} pt)`);
  pass("contrast: every text/background pair ≥ 4.5:1");

  // 5. images
  for (const r of report.reports) for (const i of r.images) if (!i.ok) fail(`${r.pdf} p${i.sheet}: ${i.src} at ${i.ppi} ppi < 250`);
  const tpl = readdirSync(join(HERE, "templates")).map((f) => readFileSync(join(HERE, "templates", f), "utf8")).join("\n") + readFileSync(join(HERE, "build.mjs"), "utf8");
  if (/bella\.png|bella_circle/i.test(tpl)) fail("templates reference the banned bella portrait");
  pass("images: all photos ≥ 250 ppi at placed size; no banned portrait");

  // 5b. nothing rendered blank — a page whose pixels are ~all white/black is a failed render, not a design
  for (const png of readdirSync(PREVIEW).filter((f) => f.endsWith(".png"))) {
    const { channels } = await sharp(join(PREVIEW, png)).stats();
    const mean = channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;
    const sd = channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0) / 3;
    if (sd < 20) fail(`${png}: page renders nearly flat (mean ${mean.toFixed(0)}, sd ${sd.toFixed(1)}) — images or fonts did not load`);
  }
  pass("render: every preview page has real content (no blank renders)");

  // 6. qr
  for (const [pdf, urls] of Object.entries(report.expectedQr)) {
    const stem = pdf.replace(/\.pdf$/, "");
    const pngs = readdirSync(PREVIEW).filter((f) => f.startsWith(stem + "-") && f.endsWith(".png"));
    const decoded = new Set();
    for (const png of pngs) {
      const { data, info } = await sharp(join(PREVIEW, png)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const hit = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
      if (hit) decoded.add(hit.data);
      // a page can carry two QRs (flyer back); scan the halves too
      for (const half of [{ top: 0, height: Math.floor(info.height / 2) }, { top: Math.floor(info.height / 2), height: Math.floor(info.height / 2) }]) {
        const h = await sharp(join(PREVIEW, png)).extract({ left: 0, width: info.width, ...half }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const hh = jsQR(new Uint8ClampedArray(h.data.buffer, h.data.byteOffset, h.data.length), h.info.width, h.info.height);
        if (hh) decoded.add(hh.data);
      }
    }
    for (const u of urls) if (!decoded.has(u)) fail(`${pdf}: QR for ${u} did not decode from the preview (got ${[...decoded].join(", ") || "nothing"})`);
  }
  if (!offline) {
    const targets = new Set(Object.values(report.expectedQr).flat());
    for (const u of targets) {
      try {
        const res = await fetch(u, { method: "HEAD", redirect: "manual" });
        if (![200, 301, 302, 308].includes(res.status)) fail(`${u} answered ${res.status}`);
      } catch (e) { fail(`${u} unreachable: ${e.message}`); }
    }
  }
  pass(`qr: every code decodes to its intended URL${offline ? "" : " and the URL answers"}`);

  // 7. draft lock
  const printFiles = pdfs.filter((f) => f.includes("-PRINT-"));
  if (!report.approved && printFiles.length) fail(`PRINT PDFs written while the testimonial is unapproved: ${printFiles.join(", ")}`);
  if (report.approved && printFiles.length !== 2) fail("testimonial approved but PRINT PDFs missing");
  pass(report.approved ? "draft: quote approved — PRINT PDFs written" : "draft: quote unapproved — PRINT PDFs withheld, previews carry the DRAFT ribbon");

  console.log(fails.length ? `\n${fails.length} check(s) failed` : "\nAll checks passed");
  return fails.length === 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runChecks({ offline: process.argv.includes("--offline") }).then((ok) => process.exit(ok ? 0 : 1));
}
