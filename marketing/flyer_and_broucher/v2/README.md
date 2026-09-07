# VoxTable flyer + brochure — v2 (Sep 2026)

The A5 leave-behinds, rebuilt on the site's own brand: Inter + Source Serif 4, the
`tokens.css` palette, the exported mark, real photography (no AI faces), and every
NAP / phone / URL read from `src/data/site.ts` at build time so print can never drift
from the website again (the v1 flyer shipped a dead `vocotable.` URL for two months).

```bash
npm run collateral            # build everything in pdf/ and run the quality gate
node marketing/flyer_and_broucher/v2/check.mjs   # gate only, on an existing pdf/
```

## What comes out (`pdf/`)

| File | Use it for | Print settings |
|---|---|---|
| `voxtable-flyer-a5.pdf` | screen, email, digital print at trim size | A5, double-sided, flip on **short** edge, 100 % |
| `voxtable-flyer-a5-PRINT-Officeworks.pdf` | **Officeworks / print shop** — 3 mm bleed + crop marks | "A5 2-sided, bleed included, trim to 148 × 210. 300 gsm silk. Optional matte laminate." |
| `voxtable-flyer-a5-HomePrint.pdf` | your own printer — light theme, toner-safe | A5 (or A4 fit-to-page), double-sided, short-edge flip |
| `BitePerk_VoxTable_Brochure_A5.pdf` | screen / digital print | as flyer |
| `BitePerk_VoxTable_Brochure_A5-PRINT-Officeworks.pdf` | **Officeworks / print shop** | "A5 2-sided, bleed included, **350 gsm silk, soft-touch matte laminate**. Spot-UV on the gold band if budget allows." |
| `BitePerk_VoxTable_Brochure_A5-HomePrint.pdf` | your own printer — light back | A5, short-edge flip |
| `BitePerk_Brochure_HomePrint_A4_2up.pdf` | two brochures per A4 sheet | A4 **landscape**, double-sided, flip on **short** edge, "Actual size", cut on the dotted line |
| `preview/*.png` | what to look at before anything goes to print (150 dpi) | — |

**Colour note for the shop:** artwork is RGB, designed for digital print. Keep the brand
gold `#F5C418` vivid; the dark is `#111317` (warm charcoal), not 100 K black.

## The DRAFT lock

The Mazcina Resto-Bar quote is Camilo and Mauro's to sign off. While
`testimonial.approved` in `copy.mjs` is `false`, every preview carries a red DRAFT
strip and **the two `-PRINT-Officeworks.pdf` files are not written**. Get their OK on the exact
wording, flip the flag, rebuild. The gate refuses the opposite mistake too.

## What the gate checks on every build (`check.mjs`)

1. **Copy** — `pdftotext`: no `vocotable`, Haymarket / 477 Pitt, `$` prices, `+44`, London,
   Natalia, "processed onshore" / "stays in Australia"; NAP, phones and URLs present byte-exact.
2. **Type** — only Inter + Source Serif 4, embedded as TrueType/CID (no Type 3); nothing under 8.5 pt.
3. **Geometry** — exact page sizes; no clipped text; all text inside the 10 mm safe area.
4. **Contrast** — every text/background pair ≥ 4.5:1 (audited in-page).
5. **Images** — every photo ≥ 250 ppi at its placed size; no `bella.png` anywhere.
6. **Render** — no page came out blank (fonts or images silently failing to load).
7. **QR** — decoded from the rendered preview, compared to the intended URL, and the URL must answer.
8. **Draft lock** — the `-PRINT-Officeworks` PDFs exist only when the quote is approved.

Verify by looking at `preview/*.png`, never by text extraction alone (BRAND.md §10).

## Layout of this folder

```
build.mjs         Playwright Chromium: HTML → PDF ×3 variants + 2-up + previews, then the gate
check.mjs         the quality gate
copy.mjs          every word; NAP/phone/URL imported from src/data/site.ts
templates/        print.css (tokens, @page, type scale) · flyer.mjs · brochure.mjs · shared.mjs
assets/mazcina/   Camilo & Mauro's dish photos, cropped (their QR + label removed), 1400 px
assets/cover/     restaurant-evening at 3200 px, graded with scripts/images/grade.mjs's recipe
pdf/              the PDFs (committed) · preview/ + render-report.json (ignored)
```

Changing words: edit `copy.mjs`. Changing a photo: point `build.mjs` `assets` at a file
in `public/images/` or `assets/`, never at an AI portrait. Changing a colour: it comes
from `tokens.css` — change it there first, then mirror the hex in `templates/print.css`.
