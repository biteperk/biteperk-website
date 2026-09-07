/** Shared fragments for the print templates: lockup, tick, QR, crop marks, DRAFT ribbon. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import QRCode from "qrcode";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(HERE, "../../../..");

/** The exported brand mark (never redrawn — `npm run brand` owns it). */
const MARK = readFileSync(resolve(REPO, "public/brand/biteperk-mark.svg"), "utf8")
  .replace(/width="64" height="64"/, "")
  .replace(/<\?xml[^>]*>/, "");

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const lockup = (cls = "") =>
  `<span class="lockup ${cls}" aria-label="biteperk">${MARK}<span class="wm">bite<span class="perk">perk</span></span></span>`;

export const tick = () =>
  `<span class="tk"><svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3L13 4.5" stroke="#1a0f04" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

/**
 * QR as inline SVG. Error correction H, 4-module quiet zone, dark on gold
 * (the band colour) so it reads on any phone camera.
 */
export async function qr(url, { dark = "#1a0f04", light = "#f5c418", mm = 24 } = {}) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    color: { dark, light },
  });
  return `<span class="qr" style="width:${mm}mm;height:${mm}mm" data-qr="${esc(url)}">${svg}</span>`;
}

/** Four L-shaped corner crop marks, 1 mm clear of the trim, only when bleed > 0. */
export const cropMarks = (bleed) => {
  if (!bleed) return "";
  const b = `${bleed}mm`;
  const W = `calc(148mm + 2 * ${b})`, H = `calc(210mm + 2 * ${b})`;
  const l = (style) => `<span class="crop" style="${style}"></span>`;
  const v = (style) => `<span class="crop v" style="${style}"></span>`;
  return [
    l(`left:0;top:${b}`), v(`left:${b};top:0`),
    l(`right:0;top:${b}`), v(`right:${b};top:0`),
    l(`left:0;bottom:${b}`), v(`left:${b};bottom:0`),
    l(`right:0;bottom:${b}`), v(`right:${b};bottom:0`),
  ].join("") + `<span hidden data-sheet="${W}x${H}"></span>`;
};

export const draftRibbon = (approved) =>
  approved ? "" : `<div class="draft">Draft — quote awaiting Camilo &amp; Mauro</div>`;

/** Wrap sheets in a document. `theme` = dark | light; `bleed` in mm. */
export const document = ({ sheets, theme, bleed, cssHref, title }) => `<!doctype html>
<html lang="en-AU" data-theme="${theme}">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${cssHref}">
<style>
  :root { --bleed: ${bleed}mm; }
  @page { size: calc(148mm + ${2 * bleed}mm) calc(210mm + ${2 * bleed}mm); margin: 0; }
</style>
</head>
<body>${sheets.join("\n")}</body>
</html>`;
