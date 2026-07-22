# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Astro 5** (static output, no SSR adapter) — content/marketing site for biteperk.com.au
- **TypeScript strict** with `@/*` path alias → `src/*`
- **Firebase Hosting** serves `dist/`; one **Cloud Function** (`functions/`, Node 20, `australia-southeast1`) backs the contact form
- **Firestore** named database `biteperk-leads` stores contact submissions
- **Astro 5 Content Layer** powers the blog/guides collection

## Commands

```bash
npm run dev        # astro dev
npm run build      # astro build → dist/
npm run preview    # astro preview
npm run check      # astro check (type-check, what CI runs)
npm run og         # regenerate Open Graph cards (scripts/generate-og.mjs)
npm run images     # fetch → grade → composite illustration pipeline
npm run test:e2e   # Playwright (chromium+webkit) + axe — needs a build first
npm run lhci       # Lighthouse CI budgets against astro preview
```

### CI gates (`.github/workflows/web.yml`) — all must pass

After `npm run check` + `npm run build`, CI runs these **generated/data-driven gates** (run any locally after a build):

- `node scripts/check-routes.mjs` — expected route list is **generated from `cities.ts` + the blog collection**, not hard-coded. Adding a city or guide needs no CI edit.
- `node scripts/check-contrast.mjs` — WCAG AA over the colour pairs declared in the `contrast-manifest` comment block at the bottom of `tokens.css`. Add a pair there when you add a text/surface token.
- `node scripts/check-cities.mjs` — anti-doorway gate: every `published` city needs ≥600 words of unique copy, <35% cross-city intro similarity, an OG card, valid `relatedGuides`, and an `llms.txt` entry.
- `node scripts/check-schema.mjs` — asserts stable JSON-LD `@id`s (`#organization`, `#website`, `#vox`, per-city `#service`) and byte-exact Haymarket NAP in the built HTML.
- `node scripts/check-images.mjs` — any image-manifest slot referenced by the site must be `reviewed: true`.
- Then Playwright + axe (`npm run test:e2e`), Lighthouse budgets (`npm run lhci`), sitemap sanity, and lychee.

There are no unit tests; the gates above are the safety net.

## Deploy

Site is one Firebase project (id `vocotable` — a legacy id, do **not** "fix" it; project ids are immutable) with hosting target `biteperk`:

```bash
firebase deploy --only hosting:biteperk
firebase deploy --only functions:biteperk-website   # contact form
```

`firebase.json` defines the rewrite `/api/contact → contactForm` (region `australia-southeast1`), the CSP, and immutable cache headers for static assets. HTML is `max-age=300`.

The Cloud Function needs the `ZOHO_SMTP_PASS` secret (`firebase functions:secrets:set`); a missing/failing email never fails the request — the Firestore write is the source of truth.

## Architecture

### Single sources of truth (edit here, not at call sites)

- `src/data/site.ts` — name, URL, phone, email, **NAP address** (Level 1, 477 Pitt St, Haymarket NSW 2000), hours, social. `abn` is still `"TODO"`.
- `src/data/products.ts` — full product catalogue (slug, copy, features, metrics, FAQ, pricing tiers). Statuses: `live` | `in-development` | `concept`. Adding a product = one entry here; pages, nav, footer, and JSON-LD all derive from it.
- `src/data/nav.ts` — top nav + footer structure. Footer "Locations" column is derived from `publishedCities`.
- `src/data/cities.ts` — **city landing-page engine.** One entry per city drives `/[city].astro`, its JSON-LD `Service` node, OG card, nav/footer links, and homepage `CityStrip`. Sydney is the flagship (`isHQ`, real NAP); other cities are honestly remote-served (`areaServed` on the LocalBusiness, **never** a fake per-city premises). Set `published: false` until copy passes `check-cities.mjs`. All non-suburb copy is hand-written per city — templated copy is a doorway-spam risk the gate blocks.
- `src/data/schema.ts` — sitewide JSON-LD `@graph` (Organization+LocalBusiness, WebSite) emitted once by `Base.astro`. LocalBusiness `areaServed` is generated from `publishedCities`. Page-specific schema (BreadcrumbList, FAQPage, Article, SoftwareApplication, per-city Service) is built on the page and references `ORG_ID`/`WEBSITE_ID`/`VOX_ID` by `@id` so Google merges them into one entity. `check-schema.mjs` guards these @ids and the NAP.

### Layouts & routing

- `src/layouts/Base.astro` — every page extends this. Owns `<head>`, the **pre-paint inline theme script**, sitewide `<Nav>`/`<Footer>`, View Transitions (`ClientRouter`), `<SEO>` component, sitewide JSON-LD graph, self-hosted font imports, and deferred script imports (`src/scripts/*.ts`). Pages pass `title`, `description?`, `path?` (canonical override), `preloadImage?`, `ogImage?`.
- `src/layouts/ProductLayout.astro` — wraps Base for product pages.
- `src/layouts/CityLayout.astro` — wraps Base for city pages.
- `src/pages/products/[slug].astro` — `getStaticPaths` over `products.ts`. Behaviour branches on `product.status` (live vs in-development vs concept).
- `src/pages/[city].astro` — `getStaticPaths` over `publishedCities`; emits Service + FAQPage + BreadcrumbList JSON-LD. `/sydney/` is one of these (URL preserved from v1).

### Theming (dual light/dark)

- `src/styles/tokens.css` — theme-scoped semantic tokens under `:root[data-theme="dark"|"light"]`, plus a `prefers-color-scheme` fallback for no-JS. **`--gold` is the text-safe brand colour (darkened in light mode); `--gold-fill` is the constant vivid #f5c418 fill — never use `--gold-fill` as text.** Text over photos uses theme-invariant `--on-image`.
- Theme is set pre-paint by an inline script in `Base.astro` (localStorage key `bp-theme`, `data-theme` on `<html>`), re-asserted on `astro:after-swap`; `src/scripts/theme.ts` + `ThemeToggle.astro` drive the toggle. When adding a token pair, add it to the `contrast-manifest` block in `tokens.css` so `check-contrast.mjs` covers it.
- `src/pages/blog/[...slug].astro` + `src/content/blog/*.md` — Astro Content Layer collection defined in `src/content.config.ts`. Schema enforces `title`, `seoTitle?` (use when on-page H1 would truncate in SERPs), `description`, `publishDate`, `draft`, `featured`. Drop a `.md` with frontmatter to ship a new guide — it auto-appears on `/blog/`, the sitemap, and gets Article JSON-LD.

### Astro config quirks worth knowing

- `output: "static"` + `trailingSlash: "ignore"` — Firebase Hosting `cleanUrls: true` handles `/foo` ↔ `/foo/`.
- `compressHTML: true` collapses `alt=""` to bare `alt`, which Bing Site Scan reads as missing alt. Don't use empty alts on visible images; for decorative-in-aria-hidden cases, prefer omitting the image or using CSS backgrounds.
- `inlineStylesheets: "auto"` and `prefetch.defaultStrategy: "viewport"` are tuned for hero LCP — don't undo without reason.
- Fonts are **self-hosted** via `@fontsource-variable/inter` + `@fontsource/source-serif-4` imported in `Base.astro` (hashed woff2, no Google Fonts request). The CSP `style-src`/`font-src` are `'self'` only — don't re-add Google Fonts.
- `@astrojs/sitemap` is filtered and re-prioritised in `astro.config.mjs` (homepage 1.0, products 0.9, **all city pages 0.9**, blog 0.8, individual guides 0.7 weekly, legal 0.4). The city-page regex must match `cities.ts` slugs.
- `/kitchen-sink` is a sitemap-excluded design-system reference page (both themes). Note: Astro ignores `__`-prefixed page files, so it is **not** underscore-prefixed.

### SEO / discoverability layer

This repo is heavily tuned for local + AI-agent discoverability. When touching this surface, keep in mind:

- `public/llms.txt` is curated for AI crawlers (ChatGPT/Claude/Gemini/Perplexity). Update it when product copy or privacy facts change so AI answers stay accurate; every published city must be listed (`check-cities.mjs` enforces this).
- `public/robots.txt` explicitly welcomes AI crawlers. Don't restrict them.
- LocalBusiness schema in `schema.ts` drives Google local pack eligibility — keep NAP byte-identical to what's published on the site, footer, GBP, and external directories.
- Blog frontmatter `seoTitle` is the lever for fixing long `<title>` tags in SERPs without touching the H1.

### Contact form flow

Form posts same-origin to `/api/contact` → Firebase Hosting rewrites to `contactForm` Cloud Function → validates → writes to Firestore (`biteperk-leads`) → best-effort Zoho SMTP notification. Origin allowlist: `biteperk.com.au` and `www.biteperk.com.au` only. Honeypot field is `_gotcha`. Product slug allowlist (`PRODUCT_SLUGS` in `functions/index.js`) must be kept in sync with `src/data/products.ts`.

## Redirects to remember

`firebase.json` 301s the bare product slugs (`/voxtable`, `/voxorder`, `/voxconcierge`, `/voxdrive`) and legal short-paths (`/privacy`, `/terms`) to their canonical `/products/<slug>/` and `/legal/<page>/` URLs. It also 301s the **legacy voco-era URLs** — bare `/voco*` slugs and full `/products/voco*` paths — to the new Vox product pages; keep these forever (external links, directory citations, and printed collateral still use them). Don't change any of these without updating external links/citations.

## Image pipeline

`scripts/{fetch-images,grade,generate-images,generate-og}.mjs` are one-shot generators run via `npm run images` / `npm run og`. Outputs land in `public/` (committed). Don't run in CI — they're for content updates.

For **AI-generated photography** there's a separate intake pipeline (`scripts/img/`): drop masters in `scripts/img/intake/<slot>.png`, run `scripts/img/process.mjs`, and mark the manifest slot `reviewed: true` (enforced by `check-images.mjs`). Art direction + prompt library: `docs/art-direction.md`. No sci-fi/robot imagery — real hospitality photography only.

## Docs

- `docs/art-direction.md` — AI imagery prompt library + hard rules (no fake venues/faces/signage) + pipeline spec.
- `docs/marketing-engine.md` — weekly/monthly/quarterly SEO + off-site cadence; also the open launch blockers (ABN, GBP verification, Plausible decision).
- `docs/directory-citations.md` — tiered AU/SaaS directory submission plan + canonical NAP block (paste-ready).
- `docs/review-requests.md` — Google review request templates (post-GBP verification).
- `docs/v1-baseline/` — pre-rebuild sitemap/schema snapshot + the contact-form contract (`contact-contract.md`); the diff target the CI schema/route gates protect against.

## Claude-generated deliverables

One-off documents Claude produces for this project — pitch decks, proposals, exported reports, and similar working material — are saved to `deliverables/` at the repo root, not `docs/`. `docs/` is committed source content (site copy, ops docs, art direction); `deliverables/` is local-only working material and is **gitignored**. Save future generated docs there by default, in a dated, descriptive subfolder per deliverable with its source assets alongside (e.g. `deliverables/2026-07-ludovic-wiziu-pitch/` containing the .pptx + `assets/`).

## Product naming (renamed to Vox, July 2026)

- **The product family is now `Vox*` everywhere**: **VoxTable** (bookings), **VoxOrder** (takeaway & pickup), **VoxConcierge** (front-of-house concierge), **VoxDrive** (drive-thru concept). The umbrella product is **Vox**; the voice persona is **Bella**. The former `Voco*` names were dropped because `voco™` is IHG's hotel brand.
- The rename (branch `rename/vox-products`) covered: slugs & routes, JSON-LD (`#vox` @id, `VOX_ID`), `firebase.json` redirects incl. legacy voco→vox 301s, `PRODUCT_SLUGS` (accepts legacy voco slugs during transition), site copy, blog posts, `llms.txt`, CI gates, tests, and OG cards.
- **Not renamed (deliberately):** the Firebase project id `vocotable` (immutable), the `docs/v1-baseline/` snapshot (historical diff target), and the booking-app subdomain `vocotable.biteperk.com.au` (`site.voxtableUrl` still points there until the app + DNS migrate — see the note in `src/data/site.ts`).
- For hotel-prospect pitches (WiZiU / Ludovic Roux), the deck presents **VoxStay** (room bookings) alongside VoxTable/VoxOrder/VoxConcierge — VoxStay is pitch-only until a hotel product ships.
- ⚠️ "Vox" collides with TravelVox's "Vox" rebrand (which ships a voice-AI agent). Formal trademark clearance is still outstanding — resolve before major marketing spend. (Clean alternatives previously researched: Vireo, Vocelle.)
- The site itself shipped to production on 21 July 2026 (hosting + functions), verified live: vox URLs 200, legacy voco URLs single-hop 301, JSON-LD on `#vox`.
- Post-rename follow-ups: external directory listings & GBP, and the app subdomain. Decision log: claude.ai Project → `claude/Ludovic-WiZiU-Pitch.md`.
- ⚠️ **`marketing/` collateral is still Voco-branded, and so are its generators.** `marketing/build_flyer.py` and `marketing/print/build_pack_extras.py` still emit `VocoTable`, so *regenerating alone reproduces the old name* — rename the scripts first, then rebuild, then eyeball the PDFs before printing. Every PDF in `marketing/` and `marketing/print/` currently contains zero `Vox*` product names.
- Composite images: `public/images/composites/*.png` is gitignored (only `.avif`/`.webp` are tracked), so renaming a composite needs `git mv` for the tracked pair **and** a plain `mv` for the PNGs. A stale filename here 404s the LCP preload and fails the Playwright console-error gate.
