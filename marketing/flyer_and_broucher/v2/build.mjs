#!/usr/bin/env node
/**
 * BitePerk print collateral v2 — flyer + brochure.
 *
 *   node marketing/flyer_and_broucher/v2/build.mjs        (or: npm run collateral)
 *   flags: --offline   skip the live URL check in the gate
 *
 * HTML templates → Playwright Chromium → PDF. Three variants per piece:
 *   <name>.pdf            trim size (148×210), for screen + digital print
 *   <name>-PRINT.pdf      3 mm bleed + crop marks, for a print shop
 *                         (only written when copy.mjs testimonial.approved === true)
 *   <name>-HomePrint.pdf  light theme, toner-safe, for a desktop printer
 * plus BitePerk_Brochure_HomePrint_A4_2up.pdf and 150-dpi previews of every page, all in pdf/.
 *
 * Every render is audited in-page (min font size, overflow, safe area, contrast,
 * image resolution) and the result is written to pdf/render-report.json for
 * check.mjs, which then runs as the last step and fails the build on any defect.
 */
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, join, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import sharp from "sharp";
import { getCopy } from "./copy.mjs";
import { document } from "./templates/shared.mjs";
import { flyerSheets } from "./templates/flyer.mjs";
import { brochureSheets } from "./templates/brochure.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const OUT = join(HERE, "pdf"); // not "out/" — the repo-root .gitignore swallows any out/ directory
const TMP = join(OUT, ".tmp");
const PREVIEW = join(OUT, "preview");
const BLEED_MM = 3;

const assets = {
  flyerStrip: pathToFileURL(join(REPO, "public/images/bar-brass-evening-1920.jpg")).href,
  // 3200 px fetch of the catalogue's restaurant-evening source, graded with the
  // site's own recipe (scripts/images/grade.mjs). A full-bleed A5 cover needs
  // ≥ 2100 px on the short side to hold 250 ppi; the site's 1920 variant can't.
  cover: pathToFileURL(join(HERE, "assets/cover/restaurant-evening-3200.jpg")).href,
  proof1: pathToFileURL(join(HERE, "assets/mazcina/ceviche.jpg")).href,
  proof2: pathToFileURL(join(HERE, "assets/mazcina/barramundi.jpg")).href,
};
for (const [k, v] of Object.entries(assets)) {
  const p = fileURLToPath(v);
  if (!existsSync(p)) throw new Error(`asset ${k} missing: ${p}`);
  if (/bella/i.test(p)) throw new Error(`banned asset referenced: ${p}`);
}

const pieces = [
  { key: "flyer", file: "voxtable-flyer-a5", render: flyerSheets, title: "VoxTable A5 flyer" },
  { key: "brochure", file: "BitePerk_VoxTable_Brochure_A5", render: brochureSheets, title: "VoxTable A5 brochure" },
];

/** In-page audit — runs after fonts are ready, before the PDF is taken. */
const AUDIT = ({ safeMm, minPt, minPpi }) => {
  const MM = 96 / 25.4, PT = 96 / 72;
  const out = { minFontPt: 99, overflow: [], outsideSafe: [], contrast: [], images: [], sheets: 0 };
  const sheets = [...document.querySelectorAll(".sheet")];
  out.sheets = sheets.length;
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => { const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const ratio = (a, b) => { const [l1, l2] = [lum(...a), lum(...b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
  const bgOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      if (n.classList.contains("on-photo") || n.classList.contains("photo") || n.classList.contains("draft")) return "photo";
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.99) return c;
    }
    return parse(getComputedStyle(document.body).backgroundColor);
  };
  sheets.forEach((sheet, si) => {
    const sr = sheet.getBoundingClientRect();
    const safe = sheet.querySelector(".safe");
    const safeR = safe ? safe.getBoundingClientRect() : null;
    const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const el = node.parentElement;
      if (seen.has(el) || el.closest("[hidden],.draft,svg")) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const pt = parseFloat(cs.fontSize) / PT;
      out.minFontPt = Math.min(out.minFontPt, pt);
      const r = el.getBoundingClientRect();
      const txt = node.textContent.trim().slice(0, 40);
      // overflow of the element's own box (clipped text)
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) {
        if (cs.overflow !== "visible") out.overflow.push({ sheet: si + 1, txt });
      }
      // text must stay inside the sheet and (unless it's in a bleed band) inside the safe area
      const tol = 0.5 * MM;
      const mm = (x) => Math.round((x / MM) * 10) / 10;
      const box = (q) => [mm(q.left - sr.left), mm(q.top - sr.top), mm(q.right - sr.left), mm(q.bottom - sr.top)];
      if (r.left < sr.left - tol || r.right > sr.right + tol || r.top < sr.top - tol || r.bottom > sr.bottom + tol) {
        out.outsideSafe.push({ sheet: si + 1, txt, why: "outside sheet", rect: box(r), sheetMm: box(sr) });
      } else if (safeR && !el.closest(".band-bleed")) {
        if (r.left < safeR.left - tol || r.right > safeR.right + tol || r.top < safeR.top - tol || r.bottom > safeR.bottom + tol) {
          out.outsideSafe.push({ sheet: si + 1, txt, why: "outside safe area", rect: box(r), safeMm: box(safeR) });
        }
      }
      const fg = parse(cs.color), bg = bgOf(el);
      if (fg && bg && bg !== "photo") {
        const rr = ratio(fg, bg);
        if (rr < 4.5) out.contrast.push({ sheet: si + 1, txt, ratio: +rr.toFixed(2), fg: cs.color, pt: +pt.toFixed(1) });
      }
    }
    sheet.querySelectorAll("img").forEach((img) => {
      const r = img.getBoundingClientRect();
      // object-fit: cover → effective scale is the larger of the two ratios
      const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
      const ppi = (1 / scale) * 96;
      out.images.push({ sheet: si + 1, src: img.src.split("/").pop(), ppi: Math.round(ppi), ok: ppi >= minPpi });
    });
  });
  return out;
};

async function renderPdf(page, html, pdfPath, { bleed, theme }) {
  const tmpHtml = join(TMP, basename(pdfPath, ".pdf") + ".html");
  writeFileSync(tmpHtml, html);
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(AUDIT, { safeMm: 10, minPt: 8.5, minPpi: 250 });
  const w = 148 + 2 * bleed, h = 210 + 2 * bleed;
  await page.pdf({ path: pdfPath, width: `${w}mm`, height: `${h}mm`, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  return { ...report, theme, bleed, pdf: basename(pdfPath) };
}

async function twoUp(browser, sourcePdf, outPdf) {
  // rasterise the (light) brochure at 300 dpi and impose two per A4 landscape sheet
  const stem = join(TMP, "twoup");
  execFileSync("pdftoppm", ["-png", "-r", "300", sourcePdf, stem]);
  const pngs = readdirSync(TMP).filter((f) => f.startsWith("twoup") && f.endsWith(".png")).sort();
  const pages = pngs.map((f) => `
    <section class="a4">
      <img src="${pathToFileURL(join(TMP, f)).href}"><div class="cut"></div><img src="${pathToFileURL(join(TMP, f)).href}">
      <div class="note">BitePerk · A4 landscape · double-sided, flip on SHORT edge · print at 100% · cut on the dotted line for two A5 brochures</div>
    </section>`).join("");
  const cssHref = pathToFileURL(join(HERE, "templates/print.css")).href;
  const html = `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><link rel="stylesheet" href="${cssHref}"><style>
    @page { size: 297mm 210mm; margin: 0 } * { margin:0; padding:0; box-sizing:border-box }
    html, body { background:#fff; font-family: "Inter", system-ui, sans-serif }
    .a4 { width:297mm; height:210mm; position:relative; display:flex; justify-content:center; align-items:center; gap:0; page-break-after: always }
    .a4:last-child { page-break-after:auto }
    img { width:148mm; height:210mm; display:block }
    .cut { width:0; height:210mm; border-left:0.5pt dashed #888 }
    .note { position:absolute; left:6mm; bottom:2mm; font-size:6pt; color:#777 }
  </style></head><body>${pages}</body></html>`;
  // must be a real file:// document — a setContent() page is about:blank and Chromium
  // refuses file:// images from it, which produced a blank 2-up once (check.mjs now guards it)
  const tmpHtml = join(TMP, "twoup.html");
  writeFileSync(tmpHtml, html);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "load" });
  await page.pdf({ path: outPdf, width: "297mm", height: "210mm", printBackground: true, preferCSSPageSize: true });
  await page.close();
}

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  mkdirSync(PREVIEW, { recursive: true });

  const copy = await getCopy();
  const approved = copy.testimonial.approved === true;
  const cssHref = pathToFileURL(join(HERE, "templates/print.css")).href;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const reports = [];
  const expectedQr = {};

  for (const p of pieces) {
    const variants = [
      { suffix: "", bleed: 0, theme: "dark" },
      { suffix: "-HomePrint", bleed: 0, theme: "light" },
      ...(approved ? [{ suffix: "-PRINT", bleed: BLEED_MM, theme: "dark" }] : []),
    ];
    for (const v of variants) {
      const sheets = await p.render(copy, { bleed: v.bleed, assets });
      const html = document({ sheets, theme: v.theme, bleed: v.bleed, cssHref, title: `${p.title}${v.suffix}` });
      const pdfPath = join(OUT, `${p.file}${v.suffix}.pdf`);
      const r = await renderPdf(page, html, pdfPath, v);
      reports.push(r);
      const qrs = html.match(/data-qr="([^"]+)"/g) || [];
      expectedQr[basename(pdfPath)] = [...new Set(qrs.map((m) => m.slice(9, -1).replace(/&amp;/g, "&")))];
      console.log(`✓ ${basename(pdfPath)}  (${r.sheets} pages, min ${r.minFontPt.toFixed(1)} pt, ${r.theme})`);
    }
  }
  if (!approved) console.log("· PRINT variants NOT written — copy.mjs testimonial.approved is false (quote awaiting Camilo & Mauro).");

  await twoUp(browser, join(OUT, "BitePerk_VoxTable_Brochure_A5-HomePrint.pdf"), join(OUT, "BitePerk_Brochure_HomePrint_A4_2up.pdf"));
  console.log("✓ BitePerk_Brochure_HomePrint_A4_2up.pdf");
  await page.close();
  await browser.close();

  // previews — the artefact a human reviews; 150 dpi
  for (const f of readdirSync(OUT).filter((f) => f.endsWith(".pdf"))) {
    execFileSync("pdftoppm", ["-png", "-r", "150", join(OUT, f), join(PREVIEW, basename(f, ".pdf"))]);
  }
  writeFileSync(join(OUT, "render-report.json"), JSON.stringify({ approved, expectedQr, reports }, null, 2));
  rmSync(TMP, { recursive: true, force: true });

  const { runChecks } = await import("./check.mjs");
  const ok = await runChecks({ offline: process.argv.includes("--offline") });
  if (!ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
