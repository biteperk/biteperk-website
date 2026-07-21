# BitePerk visit pack — print guide

Everything you need to print before walking into venues. Two routes: **home/office printer** (today) or **print shop** (nicer, for volume). Last updated 2026-07-20.

## The two phone numbers (deliberate — don't "fix")

- **(02) 7501 1140** — Bella's live **demo line**. Print-only: it goes on the demo card, brochures, deck, and business-card back so venue owners can hear her. **Never publish it on the website or directories** (spam risk).
- **(02) 5504 1140** — the BitePerk **office line** (Sam). This is the canonical NAP number used on the website, GBP, and all directory listings.

---

## What to print, per file

### 1. Brochure (the leave-behind — print MANY)

| Route | File | Settings |
|---|---|---|
| **Home/office** | `print/BitePerk_Brochure_HomePrint_A4_2up.pdf` | A4, **landscape**, **double-sided, flip on SHORT edge**, colour, "Actual size" (100% — NOT "fit to page"). Cut down the dotted centre line → 2 brochures per sheet. |
| **Print shop** | `../BitePerk_VocoTable_Brochure_A5.pdf` | Tell them: "A5 double-sided, 3mm bleed included, trim to A5. Stock: 300gsm silk/matte." |

Paper at home: the heaviest your printer takes (160–200gsm ideal). Plain 80gsm works but feels cheap — the brochure IS the brand in their hands.

**Quantity: 10–15 per day of visits.** Leave one at every venue, even a "no".

### 2. Demo card (the hand-them-your-phone prop — print a few, laminate)

- File: `print/BitePerk_Demo_Card_A4.pdf` — A4, portrait, single-sided, colour, 100%.
- Print **3–4 copies and laminate them** (any Officeworks does it cheaply). You hand this to the owner while they call Bella — laminated survives kitchen counters, spills, and being handed around.
- One per person on the visit + one spare.

### 3. Pitch script + objections (YOURS — do not hand over)

- File: `print/BitePerk_Pitch_Script_Internal_A4_duplex.pdf` — A4, **double-sided, flip on LONG edge** → one sheet: script on the front, objections on the back.
- Print 1–2. Fold it into your notebook. Glance at it in the car, not in front of the owner.

### 4. Deck (for sit-downs — tablet first, paper backup)

- File: `../BitePerk_VocoTable_Deck_Print.pdf` — the 11 slides as full-page PDF.
- Best used **on a tablet/laptop across the table** (dark slides look great on screen).
- Paper backup: print A4 **landscape**, colour, single-sided, 100%. Note: slides are dark navy — this is ink-heavy, so print one copy for sit-down meetings, not in bulk.
- The editable original is `../BitePerk_VocoTable_Deck.pptx`.

---

### 5. Venue stickers (for CUSTOMER venues — the "Powered by" badge)

| Route | File | Settings |
|---|---|---|
| **Home/office** | `BitePerk_Stickers_HomePrint_A4.pdf` | A4 **adhesive/sticker paper** (Officeworks sells A4 sticker sheets), colour, 100%. Cut on the grey guides. 2 door decals + 4 counter strips per sheet. |
| **Print shop / sticker service** | `BitePerk_Sticker_Door_Round90mm_PRINT.pdf` + `BitePerk_Sticker_Counter_70x25mm_PRINT.pdf` | "Kiss-cut vinyl stickers, artwork has 3mm bleed, magenta dashed line is the cut path. Door decal: 90mm circle, outdoor-grade laminated vinyl. Counter: 70×25mm." Sticker Mule / Vistaprint / local signage shop all handle this. |

**Rules of use:** only for venues actually running VocoTable — it's a badge, not an ad. Place it yourself during onboarding (door glass at eye level + one at the till). The QR is tagged `utm_source=venue-sticker` so you can count scans in your analytics.

### 6. Business cards

| Route | File | Settings |
|---|---|---|
| **Home/office** | `BitePerk_BusinessCards_HomePrint_A4_10up.pdf` | A4 portrait, **double-sided, flip on LONG edge**, colour, 100%. Heaviest stock your printer takes. Cut on the dashed guides → 10 cards per sheet. |
| **Print shop** | `BitePerk_BusinessCard_90x54_PRINT.pdf` | "Standard 90×54mm business cards, double-sided, 3mm bleed included, trim to 90×54. 350gsm matte, 100 copies." |

Front: your contact (office line + sam@). Back: the hook — Bella's demo line + QR (tagged `utm_source=business-card`).

### 7. Follow-up sheet (leave with venues that say YES)

- File: `BitePerk_Followup_NextSteps_A4.pdf` — A4, portrait, single-sided, colour, 100%.
- The "what happens next" leave-behind: 4 setup steps, what you need from them, the honest fine print, and your contact. Hand it over the moment they agree to the 15-minute setup call — it keeps the deal warm and tells them exactly what to gather (menu, hours, booking rules).
- Print 5–10. QR tagged `utm_source=followup-sheet`.
- `build_pack_extras.py` in this folder regenerates the business cards, follow-up sheet, demo card, and all three sticker files (`python3 build_pack_extras.py`).

## The visit pack (carry checklist)

- [ ] 10–15 × brochures
- [ ] 3–4 × laminated demo cards
- [ ] 1 × pitch script (folded, internal)
- [ ] Tablet/phone with `Deck_Print.pdf` loaded (airplane-mode-proof: save it locally)
- [ ] Your phone charged — the close is them calling **(02) 7501 1140**
- [ ] A stack of business cards (10-up sheet above)
- [ ] 5 × follow-up sheets — for the venues that say yes on the spot

## Print-shop one-liner (copy-paste)

> "Hi — I need A5 double-sided brochures, artwork has 3mm bleed, trim to 148×210. 300gsm silk stock, full colour both sides. 50 copies. And 4 × A4 single-sided on 250gsm, matte laminated."

## Colour note

All artwork is RGB, designed for digital print — fine for home printers and digital print shops (99% of cases). Only if a shop insists on offset/CMYK conversion, tell them the brand gold is **#F5C418** and to keep it vivid.
