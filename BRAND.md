# BitePerk brand kit

**Canonical brand reference. If you are an AI agent producing anything that carries the
BitePerk name — a document, an artifact, a deck, a page, a PDF, an email — read this first
and follow it.**

Source of truth for the live site is `src/styles/tokens.css`. **This file is the portable
version**: everything you need to brand a standalone output that can't import those tokens.

Product, hostname and infrastructure **names** are not brand-kit material — they are
registered in the product repo's [`NAMES.md`](https://github.com/biteperk/voxtable/blob/integration/NAMES.md)
(the estate-wide naming SSOT). Check it before writing any hostname or product name.
If the two ever disagree, `tokens.css` wins and this file should be corrected.

_Last verified against `src/styles/tokens.css` and `CLAUDE.md` — 6 August 2026._

---

## 1. Identity — what is a brand name and what is not

| Layer | Value | Ever renamed? |
|---|---|---|
| **Company** | **BitePerk** · `biteperk.com.au` · `@biteperk.com.au` | **Never** |
| **Legal entity** | **BITEPERK PTY LTD** · ABN 36 700 831 303 · ACN 700 831 303 | Never |
| **Products** | **Vox** (umbrella) · **VoxTable** · **VoxOrder** · **VoxConcierge** · **VoxDrive** | This family renamed from `Voco*`/`Perk*` in July 2026 |
| **Persona** | **Bella** — the voice agent | Never |

- Product names are **CamelCase**, written "VoxTable **by BitePerk**" on first use in
  external material.
- **VoxStay** is pitch-only (hotel prospects). Never put it in site code or public material.
- `voco*` and `perk*` legacy slugs redirect **forever** — printed collateral still uses them.

> ⚠️ **`perk` in `biteperk` is not a product token.** A bulk `Perk*`→`Vox*` rename once turned
> `bite`+`perk` into `bite`+`vox` on every social card and the printed business cards. The
> company wordmark is never touched by a product rename.

---

## 2. The wordmark

Rendered as two parts, never as a single flat string:

```html
<span class="brand-name">bite<span class="perk">perk</span></span>
```

```css
.brand-name       { font-weight: 700; letter-spacing: -0.02em; }
.brand-name .perk { color: var(--gold); font-style: italic; font-weight: 700; }
```

- `bite` — strongest text colour (`--white`: near-white on dark, near-black on light)
- `perk` — **gold, italic, bold**
- Lowercase in the wordmark. In running prose, write **BitePerk**.

## 3. The mark

A five-point gold star with a dark-green fork through it. Inline SVG, `viewBox="0 0 64 64"`.

```html
<svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
  <polygon points="32,4 39,24 60,24 43,37 49,58 32,46 15,58 21,37 4,24 25,24"
           fill="#f5c418" stroke="#1a4d1a" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="29"   y="20" width="2.5" height="22" rx="0.8" fill="#1a4d1a"/>
  <rect x="32.5" y="20" width="2.5" height="14" rx="0.8" fill="#1a4d1a"/>
  <rect x="35.5" y="20" width="2.5" height="22" rx="0.8" fill="#1a4d1a"/>
</svg>
```

The on-site version adds a radial gradient (`#fff7c4` → `#f5c418` → `#9a7a0a`) and a drop
shadow — see `src/components/StarMark.astro`. The flat version above is correct for documents.

**Green appears only inside the mark.** It is not a UI colour.

Exported assets live in `public/brand/` and are **generated** by `npm run brand`. Never
hand-edit them. `biteperk-logo.jpeg` is the reference master and never ships into a page.

---

## 4. Colour — read this section carefully

**Dark is the brand default.** Light is a supported theme, not the primary look.

### 🔴 The one rule agents get wrong

| Token | Value | Use |
|---|---|---|
| `--gold-fill` | `#f5c418` (both themes) | **Fills only** — buttons, dots, the mark. **NEVER as text.** Always pair with `--gold-fill-text` `#1a0f04` on top. |
| `--gold` | `#f5c418` on dark · `#7d6104` on light | **The text-safe brand colour.** Theme-dependent by design — the light value is darkened to clear 4.5:1 on paper. |

Using `#f5c418` as text on a light background fails WCAG AA and looks cheap. If you are
writing gold text, you want `--gold`, and its value changes with the theme.

### Dark theme (default)

```css
--ink-0:#0a0b0d; --ink-1:#111317; --ink-2:#161a20; --ink-3:#1d222a;
--white:#f7f8fa; --text:#d5d9e0; --mist:#9aa1ad; --mist-2:#b8bec8;
--gold:#f5c418; --gold-dark:#d9aa0e; --gold-amber:#ffb840;
--green:#1a4d1a; --green-deep:#0e2f12; --green-light:#4a8a48;
--line:rgba(255,255,255,.08); --line-strong:rgba(255,255,255,.18);
--line-gold:rgba(245,196,24,.18);
--danger:#ff6b6b; --success:#6ee7a8;
--fill-subtle:rgba(255,255,255,.04); --fill-hover:rgba(255,255,255,.07);
```

### Light theme — warm premium paper, not plain white

```css
--ink-0:#faf9f6; --ink-1:#ffffff; --ink-2:#f2f0e9; --ink-3:#e9e6dc;
--white:#14161a; --text:#333a44; --mist:#5f6774; --mist-2:#4a515c;
--gold:#7d6104; --gold-dark:#644e03; --gold-amber:#8a5a00;
--green:#1a4d1a; --green-deep:#0e2f12; --green-light:#2e6b2c;
--line:rgba(20,22,26,.10); --line-strong:rgba(20,22,26,.22);
--line-gold:rgba(125,97,4,.30);
--danger:#b3261e; --success:#1a7a4a;
--fill-subtle:rgba(20,22,26,.04); --fill-hover:rgba(20,22,26,.07);
```

Note `--ink-0` on light is `#faf9f6` — a warm off-white. Pure `#ffffff` is `--ink-1`, the
*raised* surface. Getting this backwards makes the page look generic.

### Theme-invariant

```css
--gold-fill:#f5c418; --gold-fill-dark:#d9aa0e; --gold-fill-text:#1a0f04;
--on-image:#f7f8fa; --on-image-muted:#c9cfd8;   /* text over photos — always light */
```

---

## 5. Type

```css
--font-sans:  "Inter Variable","InterVariable","Inter",ui-sans-serif,system-ui,
              -apple-system,"Segoe UI",sans-serif;
--font-serif: "Source Serif 4","Source Serif Pro",Georgia,"Times New Roman",serif;
--font-mono:  ui-monospace,"JetBrains Mono","SF Mono",Menlo,monospace;
```

Inter for everything by default. Serif is available for editorial pull-quotes; use it
sparingly and deliberately. Sizes are fluid:

```css
--fs-h1:clamp(2.5rem,1.4rem + 4.2vw,5.25rem);  --lh-display:1.02;
--fs-h2:clamp(2rem,1rem + 3.5vw,4rem);         --lh-heading:1.1;
--fs-h3:clamp(1.5rem,1rem + 1.5vw,2.25rem);
--fs-lede:clamp(1.125rem,1rem + .5vw,1.375rem); --lh-lede:1.5;
--fs-body:clamp(1rem,.95rem + .25vw,1.125rem);  --lh-body:1.6;
--fs-small:.875rem;  --fs-eyebrow:.75rem;
```

Eyebrows are uppercase, letter-spaced, muted. Headings carry slight negative tracking.

---

## 6. Shape, space, motion

```css
--r-sm:8px; --r-md:14px; --r-lg:24px; --r-xl:28px; --r-pill:999px;

--space-1:4px;  --space-2:8px;  --space-3:12px; --space-4:16px; --space-5:24px;
--space-6:32px; --space-7:48px; --space-8:64px; --space-9:96px; --space-10:128px;
--space-section:clamp(72px,9vw,128px);
--container-max:1180px; --container-pad:clamp(20px,4vw,32px);

--ease-out:cubic-bezier(.2,.7,.1,1);
--ease-spring:cubic-bezier(.34,1.3,.64,1);
--ease-soft:cubic-bezier(.16,1,.3,1);
--dur-fast:160ms; --dur-base:240ms; --dur-slow:600ms; --dur-reveal:800ms;
```

Shadows are long and soft, gold-tinted on hover:

```css
--shadow-card:      0 30px 80px -30px rgba(0,0,0,.7);          /* dark */
--shadow-btn-hover: 0 14px 38px rgba(245,196,24,.32);
--ring-focus:       0 0 0 2px var(--gold);
```

---

## 7. Copy-paste starter for a standalone document

For an HTML artifact, report or deck that can't import `tokens.css`. Dark default, light
under an explicit `data-theme="light"`, plus the no-JS OS fallback.

```html
<style>
:root{
  color-scheme:dark;
  --ink-0:#0a0b0d; --ink-1:#111317; --ink-2:#161a20; --ink-3:#1d222a;
  --white:#f7f8fa; --text:#d5d9e0; --mist:#9aa1ad;
  --gold:#f5c418; --gold-dark:#d9aa0e;
  --green:#1a4d1a; --green-light:#4a8a48;
  --line:rgba(255,255,255,.08); --line-strong:rgba(255,255,255,.18);
  --danger:#ff6b6b; --success:#6ee7a8;
  --gold-fill:#f5c418; --gold-fill-text:#1a0f04;
  --font-sans:"Inter Variable","Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --r-sm:8px; --r-md:14px; --r-lg:24px; --r-pill:999px;
}
:root[data-theme="light"]{
  color-scheme:light;
  --ink-0:#faf9f6; --ink-1:#ffffff; --ink-2:#f2f0e9; --ink-3:#e9e6dc;
  --white:#14161a; --text:#333a44; --mist:#5f6774;
  --gold:#7d6104; --gold-dark:#644e03;
  --green:#1a4d1a; --green-light:#2e6b2c;
  --line:rgba(20,22,26,.10); --line-strong:rgba(20,22,26,.22);
  --danger:#b3261e; --success:#1a7a4a;
}
@media (prefers-color-scheme:light){
  :root:not([data-theme]){ /* mirror the light block above */ }
}
body{background:var(--ink-0);color:var(--text);font-family:var(--font-sans);}
h1,h2,h3{color:var(--white);letter-spacing:-.02em;}
.brand-name .perk{color:var(--gold);font-style:italic;font-weight:700;}
</style>
```

---

## 8. Facts that must be byte-identical everywhere

Changing these in one place and not another breaks NAP consistency and local SEO.

| | |
|---|---|
| Legal name | BITEPERK PTY LTD |
| ABN | 36 700 831 303 |
| ACN | 700 831 303 |
| Address | Level 1, 457-459 Elizabeth Street, Surry Hills NSW 2010 |
| Published phone | +61 2 5504 1140 |
| Public email | hello@biteperk.com.au |
| Website | biteperk.com.au |

**UK entity (added 7 Aug 2026).** A second registered company exists. It is the contracting
party and data controller for UK customers, and its details appear on `/gb-en` and nowhere else.

| | |
|---|---|
| Legal name | Biteperk Ltd |
| Registered in | England and Wales |
| Company number | 17379647 |
| Registered office | 124 City Road, London, England, EC1V 2NX |
| Contact email | sales@biteperk.com |
| Register record | find-and-update.company-information.service.gov.uk/company/17379647 |

⚠️ It is a **registered office, not a premises** — no UK staff, no UK phone number, no VAT
registration. Never write "our London office/team", never publish a `+44` number, and never
put a UK address on `/en`, `/fr` or `/be-*`. Source of record is **Companies House**; do not
republish the size or turnover bands that third-party aggregators infer for companies which
have filed no accounts.

**Email sender follows the domain-by-audience rule:** `@biteperk.com.au` to Australian
recipients, `@biteperk.com` to everyone else. The print-only demo line `(02) 7501 1140`
never appears on the website or in any directory.

---

## 9. Tone

BitePerk sells AI phone answering to Australian restaurants. Write like a competent operator
talking to a busy venue manager, not like a technology vendor.

- Plain Australian English. Australian spelling — *organise*, *colour*, *centre*.
- Concrete over aspirational. "Answers every call" beats "revolutionises guest engagement".
- **No sci-fi.** No robot imagery, no glowing-brain metaphors, no "AI-powered future". Bella
  is a helpful voice on the phone, not a android. This is an explicit standing rule.
- Never over-claim. There is a `check-claims.mjs` CI gate for exactly this reason.
- The venue is the hero. BitePerk is the thing that quietly works in the background.

---

## 10. Verify, don't assume

- **Render to pixels.** The `bitevox` incident shipped because the wordmark is drawn as two
  separately-positioned strings — grep found nothing and `pdftotext` looked perfect. Check
  branding with `pdftoppm -png` or a screenshot, never by text extraction.
- **Run the contrast gate.** `node scripts/gates/check-contrast.mjs` reads the
  `contrast-manifest` block at the bottom of `tokens.css`. Adding a text/surface pair means
  adding it to that manifest.
- **`/kitchen-sink`** is the live design-system reference page, both themes, excluded from
  the sitemap. Look there before inventing a component.
- **Regenerate, don't redraw.** Brand exports come from `npm run brand`.
