# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Astro 5** (static output, no SSR adapter) — content/marketing site for biteperk.com.au
- **TypeScript strict** with `@/*` path alias → `src/*`
- **Firebase Hosting** serves `dist/`; one **Cloud Function** (`functions/`, Node 20, `australia-southeast1`) backs the contact form
- **Firestore** named database `biteperk-leads` stores contact submissions
- **Astro 5 Content Layer** powers the blog/guides collection

## Commands

Scripts are grouped: `scripts/gates/` (CI gates) · `scripts/build/` (merge/prune/llms + `_load-ts`) · `scripts/images/` (photo pipeline) · `scripts/brand/` (OG cards + logo kit). A README.md at the repo root maps the whole tree.

```bash
npm run dev        # astro dev
npm run build      # astro build → dist/
npm run preview    # astro preview
npm run check      # astro check (type-check, what CI runs)
npm run og         # regenerate Open Graph cards (scripts/brand/generate-og.mjs)
npm run images     # fetch → grade → composite illustration pipeline
npm run test:e2e   # AU build: chromium+webkit+firefox, Pixel 7 + iPhone 14, axe
npm run test:intl  # GLOBAL build browser suite (own config + preview)
npm run brand      # logo kit, apple-touch-icon, maskable PWA icons
npm run lhci       # Lighthouse CI budgets against astro preview
```

### CI gates (`.github/workflows/web.yml`) — all must pass

CI does not keep its own gate list. Both matrix legs run **`npm run gates:au` / `npm run gates:global`** — the lists in `package.json` are the single source, so adding a gate there is picked up by CI with no workflow edit. They used to be restated inline in `web.yml`, and the two drifted: `check-cities` is documented below as running on both targets, but CI had it behind `if: matrix.target == 'au'`. It was vacuous while `intl/cities.ts` was empty, so nothing showed — it would have come back "covered" the day market cities shipped.

CI also sets **`INTL_LAUNCHED: "true"`** on the matrix, because that is what production builds with since the 27 Jul 2026 launch; with the flag unset CI was gating the pre-launch shape (global pages `noindex`, no cross-domain cluster) rather than what ships. The flag-**off** path is the rollback lever and keeps its own small `rollback` job, which asserts all five global homes are `noindex` and re-runs the gates whose shape depends on the flag.

After `npm run check` + `npm run build`, the gates are:

- `node scripts/gates/check-routes.mjs` — expected route list is **generated**: cities from `cities.ts`, guides from the blog collection, and the AU static pages from `AU_STATIC_PAGES` in `locales.ts`, which `tests/helpers/routes.ts` reads too. Adding a city, guide or product needs no CI edit. That static list was hand-written in *both* files until Jul 2026, in different shapes, under a comment claiming they could not drift.
- `node scripts/gates/check-contrast.mjs` — WCAG AA over the colour pairs declared in the `contrast-manifest` comment block at the bottom of `tokens.css`. Add a pair there when you add a text/surface token.
- `node scripts/gates/check-cities.mjs` — anti-doorway gate, **run on both targets**: every `published` city needs ≥600 words of unique copy, <35% pairwise intro *and* `aiLocal` similarity, an OG card, valid `relatedGuides`, and an `llms.txt` entry. AU reads `cities.ts`; `BUILD_TARGET=global` reads `intl/cities.ts` and pools the comparison **per language across markets** (English = gb-en + be-en, French = fr + be-fr) — that's where templated copy actually leaks, since London and Brussels-EN say the same thing in the same language while London vs. Paris is separated by language already. The shingle/overlap method lives in `scripts/gates/_similarity.mjs` and is shared with `check-intl-similarity.mjs` — don't re-inline it. It was duplicated until Jul 2026 and the copies had drifted: the one here stripped accents, which is the one thing that module documents as unsafe, in the gate that pools French.
- `node scripts/gates/check-schema.mjs` — asserts stable JSON-LD `@id`s (`#organization`, `#website`, `#vox`, per-city `#service`) and byte-exact Haymarket NAP in the built HTML.
- `node scripts/gates/check-images.mjs` — any image-manifest slot referenced by the site must be `reviewed: true`. **Note: `src/data/image-manifest.json` is currently empty, so this gate exits 0 and checks nothing.** Don't rely on it to catch a missing or renamed image — that's `check-assets.mjs`'s job.
- `node scripts/gates/check-assets.mjs` — every local asset URL in the built HTML (`img`/`srcset`/`preload`/`imagesrcset`/`og:image`/`twitter:image`) must resolve in `dist/`. Derived from the build, so new products/cities/guides are covered automatically. This is what catches a renamed product whose OG card or hero composite was never regenerated — a bug that shipped twice before the gate existed.
- `node scripts/gates/check-product-slugs.mjs` — every `product` value the built HTML can post (hidden inputs *and* `<select>` options, both targets) must be in `PRODUCT_SLUGS` in `functions/index.js`. Deliberately a **subset** check: the allowlist also carries the legacy `voco*`/`perk*` slugs, which appear nowhere on the site and must stay accepted forever. This closes a genuinely silent failure — the function coerces an unknown slug to `""` and still returns `{"ok":true}`, so a new product's leads would save with no attribution and nothing would surface the loss.
- Then Playwright + axe (`npm run test:e2e`), Lighthouse budgets (`npm run lhci`), sitemap sanity, and lychee.

**Accessibility on the intl trees** (`tests/intl/a11y.spec.ts`, project `intl-a11y`): axe over 12 routes × both themes — all five locale homes (chrome, consent, picker, FAQ) plus one page per distinct template from `/be-fr` plus `/gb-en/contact/` for the form. All 60 routes additionally get a no-axe heading sweep (one `h1`, first, no level jumps), because axe rates `heading-order` *moderate* and the AU suite gates only serious/critical — which is how an `h1 → h3` skip shipped on all five contact pages. The spec is `testIgnore`d from the three device projects so it runs once, not 3×. Note the intl suite is now **stricter than the AU one** on heading order; the AU footer has an `h2 → h4` jump that nothing currently gates.

Unit tests (`tests/unit/`, run by `gates:global`) cover the `merge()` contract and **bundle parity**: all five trees must resolve the same *shape* (TypeScript enforces keys, but `merge()` replaces arrays wholesale, so a market override with two proof points where every other tree has four type-checks fine), no empty copy, and no untranslated English left in the French trees. Beyond those, the gates above are the safety net.

`INTL_LAUNCHED` is parsed strictly: `true/1/yes/on` and `false/0/no/off` (any case, trimmed), unset = not launched, and **anything else throws**. The old `=== "true"` test made `INTL_LAUNCHED=TRUE` silently false — a launch build that quietly came out `noindex` across five markets.

## International — single domain, six locales (rev. 24 Jul 2026)

One codebase emits **one domain, biteperk.com**, in two build passes selected by `BUILD_TARGET` (architecture: `deliverables/2026-07-23-intl-site-architecture/PLAN.md`):

- `au` (default) → `dist/` — the AU site, Astro base `/au-en`; merged under `biteperk.com/au-en/**`. `biteperk.com.au` is a redirect-only host (301, path-preserving).
- `global` → `dist-global/` — the international trees: **`/en` (x-default) · `/gb-en` (UK) · `/fr` (France) · `/be-en` + `/be-fr` (Belgium)**.
- `npm run build:site` = both passes + `scripts/build/merge-dist.mjs` → `dist-site/` (what `hosting:biteperk-global` serves) + `dist-cctld/` (the redirect host).

Key facts:

- **`src/data/locales.ts` is the SSOT** — bases, `lang`/`copyLang`/`market`, hreflang codes, x-default, the `u()`/`abs()` helpers, `localeSwitchUrl` (page-carrying region switch). Every locale-aware surface DERIVES from it: `[...intl].astro` page trees, LocalePicker, hreflang, sitemap filter/priorities (astro.config imports the TS module directly), `check-links`/`check-schema`/`check-hreflang`/`check-truthful`, llms-global, OG cards, the e2e route list. **Add a locale = one array entry + copy + OG regen; never extend a hardcoded en/fr list — if you find one, derive it instead.**
- **The locale trees may differ (rev. 26 Jul 2026).** `pagesForLocale(locale)` — core pages + per-base `INTL_EXTRA_PAGES` + published entries from `intl/cities.ts` — replaced the flat `INTL_PAGE_PATHS`, which could not express either half of uneven depth: `/gb-en/london/` exists in one tree, while `/be-en/brussels/` and `/be-fr/brussels/` are genuine alternates of each other. Three consequences worth knowing:
  - **`buildHreflang` is subset-aware**: a locale joins a cluster only if it emits the page, so a UK-only page self-references and the Belgium pair clusters `en-BE ↔ fr-BE` alone. An empty cluster throws at build time. `IntlLayout` therefore passes `["au","global"]` unconditionally once launched — do not re-add an `isSharedPage` test there, the filter does it.
  - **`check-hreflang` derives the expected code set per page** from the same `pageExistsInLocale`, and fails on **extra** codes as well as missing ones. Demanding the complete set on every page was right only while all five trees were identical.
  - **`[...intl].astro` dispatches through a page registry**, and throws (naming the path and locale) for a path no branch renders. Adding a page kind = a registry entry + a body branch.
- **`src/data/intl/cities.ts` — the market city engine** (empty until Phase 2). Mirrors `cities.ts` but deliberately has **no geo/address/hours/phone field at all**: there is no European premises, and the absent field is the enforcement rather than a convention. Two image slugs per city (a unique cityscape + one hospitality shot shared across the market), not the AU engine's three — `public/images` is already 74MB and binaries never delta-compress. A `published` entry automatically gets its route, hreflang cluster, e2e coverage and OG-card requirement.
- **Copy = language cores × market overrides** (`src/data/intl/`): `copy.ts` holds the full EN/FR bundles and must stay **market-neutral** (France-specific lines live in the `/fr` override or `be-fr` inherits them); `markets.ts` layers per-base overrides + the imagery band (cityscape/hospitality slugs + alts); `index.ts` resolves via `merge()` — **arrays replace wholesale** (contract unit-tested in `tests/unit/`, run by `gates:global` and CI). French (core + `/fr` + `/be-fr` + the intl product copy) had Ludovic's native review and is **signed off (26 Jul 2026)** — this no longer gates `INTL_LAUNCHED`. French added *after* that date needs its own pass. The 27 Jul 2026 market-differentiation French (both FR home pages, both about pages, two five-item FAQs) had that pass and is **signed off (27 Jul 2026)** — cleared for prospect-facing use. The rule stands for French written after it.
- **`/en` carries a single supporting photo** (`support` on `enNeutral` in `markets.ts`, resolved by `resolveSupport()`, rendered after the steps). It is the only tree with no market imagery band — it is the x-default and must read as neither European nor Australian — which left it at 617 words per image against the others' ~260. One geography-neutral photo takes it to 309 without inventing the "here is your city" band it cannot claim; the home stays at 8 sections. Never `priority`, never preloaded.
- **The intl nav list is `src/data/intl/nav.ts` (`INTL_NAV`)** — `IntlLayout` renders both the header bar and the footer links from it, and `tests/intl/chrome.spec.ts` imports it so the phone-nav test derives its expected count instead of restating it. That count was hardcoded at 4 with a comment reminding whoever changed the nav to update it, and it had already been stale once (3 → 4 when the product tree shipped). Adding a nav item = one array entry.
- **Sub-page imagery lives in `src/data/intl/page-images.ts`, not the copy bundle** (rev. 27 Jul 2026). Two maps — `intlPageImages` keyed by page path, `intlProductImages` keyed by product slug — give every non-legal sub-page in all five trees exactly one photo, where every sub-page was text-only before. It is deliberately outside `CopyBundle` because alt text is **language**-scoped while copy is **market**-scoped: the picture on `/gb-en/about/` and `/be-en/about/` is the same picture, so putting it in the bundle would force every market to restate an identical value (`merge()` replaces objects wholesale) for nothing. Rules: reuse slugs already graded into `public/images` (no new photography), keep them geography-neutral (these pages serve all five trees — a London landmark on a page Belgium also gets is worse than no picture), **never `priority` and never preloaded** (the LCP element on these trees is *text*; prioritising an image only steals throttled bandwidth from it), and legal pages get none on purpose. `contact` takes its photo in the aside, not under the intro — the page is a two-column grid.
- **Europe-truthful rules (PLAN.md §8): no AU price, no NAP, no AU phone on any global page** — enforced twice: `check-schema` (global) asserts the shared AU-anchored org `@id`, Organization-only, no address/geo/areaServed on EVERY locale home; `check-truthful` sweeps every built global page's HTML for the phone numbers, Haymarket/477 Pitt and `$80` (this sweep caught the AU phone hiding in the global org JSON-LD — structured data is part of the page). CTA is "book a pilot". No fake local offices — market pages localise the conversation and imagery, never invent a presence.
- The intl pages use `IntlLayout.astro` (own chrome, carries the StarMark since 24 Jul) — never render the AU Nav/Footer on global pages (AU phone + pruned routes). The footer's region links and the LocalePicker both carry the current page across locales via `localeSwitchUrl`.
- International pages are **`noindex` behind `INTL_LAUNCHED`** (env flag, default off). Launch = `INTL_LAUNCHED=true npm run build:site` + deploy: flips indexability AND emits the full cross-locale hreflang cluster in one step. The flag is all-or-nothing across the five global locales — flipping it is a deliberate five-market decision.
- OG cards: `BUILD_TARGET=global npm run og` → `public/og/intl/` — **derived from `resolveCopy` per locale** (11 cards; `/en` keeps legacy unsuffixed filenames). Pixel-review before deploy, as always.
- `firebase.json` (biteperk-global): apex `/` → `/en/`; country shortcuts `/gb` `/uk` → `/gb-en/`, `/be` → `/be-en/`.
- **ccTLD front doors (rev. 26 Jul 2026):** `biteperk.uk` → `/gb-en`, `biteperk.fr` → `/fr`, `biteperk.be` → `/be-en` (apex + www, path + query preserved, single-hop 301). These live in **Cloudflare Redirect Rules — deliberately NOT firebase.json** (`biteperk.com.au` is the one Firebase-hosted redirect exception). The per-locale `cctld` field in `locales.ts` is the SSOT list (feeds org `sameAs` in `schema.ts`); the exact zone rules, DNS records and edge settings are in `docs/accounts-and-ops-log.md`. Do not add uk/fr/be redirects to firebase.json.
- CI (`web.yml`) runs an `[au, global]` matrix — all gates incl. `check-links` + `check-truthful` + the unit tests; e2e/Lighthouse/contrast run on the AU pass (Lighthouse measures `dist-site/`, the merged tree).

## Device & browser experience (rev. 26 Jul 2026)

The international pages had never had a device pass; the fixes and the guards
that keep them fixed:

- **Intl chrome is responsive below 720px** — `.intl-nav-row` wraps into two
  rows (brand + picker + theme toggle, then the links as 44px pills). It was
  `display:none` with no replacement, i.e. NO mobile navigation at all. The bar
  is non-sticky and drops its header CTA there (it scrolls away instantly, and
  the hero repeats it) — that's what buys room for the controls.
- **The bar also drops its `backdrop-filter` on mobile**, deliberately: a
  filtered ancestor becomes the containing block for `position:fixed`
  descendants, which would trap the locale picker's bottom sheet inside it.
  If you re-add a filter there, the picker breaks on phones.
- **LocalePicker is a viewport-anchored bottom sheet ≤720px.** Neither `left:0`
  nor `right:0` can work — the trigger sits mid-bar and the menu is 276px wide.
- **Short viewports** (`max-height: 620px` — phone landscape) compress the hero;
  it was 681px tall on a 844×390 screen with the CTA 200px below the fold.
- **Cookie policy exists in every locale** (`legal/cookies` is a core page in `pagesForLocale`)
  and `ConsentBanner` derives its href from the served path via `localeFromPath`
  — `u()` is a no-op on the global build, so the banner used to link to a root
  path that existed in no tree. `check-links` KNOWN_GAPS is empty and must stay
  empty: an entry there is a live broken link.
- **PWA**: per-locale manifests (`src/pages/manifest/[loc].webmanifest.ts`) so an
  install from `/gb-en/` opens on the UK site. Maskable icons from `npm run
  brand`. **No service worker** — this site ships too often to risk a stale
  shell.
- **LocaleSuggest** offers (never redirects to) the visitor's market from
  `navigator.languages`, matched against locale `hreflang` codes. Dismissible,
  remembered, silent for anyone already in their market or with no market.
- **Guards**: both browser suites assert **no horizontal overflow at 390 and
  768 on every route**; CI runs the global suite on the global matrix leg (it
  previously ran zero browser tests there — that's how the above shipped).
  Markdown and legal tables are wrapped in accessible scroll boxes rather than
  allowed to widen the page.

## Deploy

Site is one Firebase project (id `vocotable` — a legacy id, do **not** "fix" it; project ids are immutable) with hosting targets `biteperk` (AU) and `biteperk-global` (biteperk.com):

```bash
firebase deploy --only hosting:biteperk
firebase deploy --only functions:biteperk-website   # contact form
npm run build:global && firebase deploy --only hosting:biteperk-global   # international
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

Form posts same-origin to `/api/contact` → Firebase Hosting rewrites to `contactForm` Cloud Function → validates → writes to Firestore (`biteperk-leads`) → best-effort Zoho SMTP notification. Origin allowlist (`ALLOWED_ORIGINS` in `functions/index.js`): **four** entries — `biteperk.com.au`, `www.biteperk.com.au`, `biteperk.com`, `www.biteperk.com`. The `.com` pair is **load-bearing, not leftover**: every page the AU tree now serves lives on `biteperk.com/au-en/**` (the `.com.au` host only 301s), and the five international locales post from `biteperk.com` too — drop them and every contact form on the site dies. `biteperk-global.web.app` is deliberately absent, so the form does not work from the raw staging origin. Honeypot field is `_gotcha`. Product slug allowlist (`PRODUCT_SLUGS` in `functions/index.js`) must be kept in sync with `src/data/products.ts`.

## Redirects to remember

`firebase.json` 301s the bare product slugs (`/voxtable`, `/voxorder`, `/voxconcierge`, `/voxdrive`) and legal short-paths (`/privacy`, `/terms`) to their canonical `/products/<slug>/` and `/legal/<page>/` URLs. It also 301s the **legacy voco-era URLs** — bare `/voco*` slugs and full `/products/voco*` paths — to the new Vox product pages; keep these forever (external links, directory citations, and printed collateral still use them). Don't change any of these without updating external links/citations.

## Image pipeline

`scripts/{fetch-images,grade,generate-images,generate-og}.mjs` are one-shot generators run via `npm run images` / `npm run og`. Outputs land in `public/` (committed). Don't run in CI — they're for content updates.

For **AI-generated photography** there's a separate intake pipeline (`scripts/images/img/`): drop masters in `scripts/images/img/intake/<slot>.png`, run `scripts/images/img/process.mjs`, and mark the manifest slot `reviewed: true` (enforced by `check-images.mjs`). Art direction + prompt library: `docs/art-direction.md`. No sci-fi/robot imagery — real hospitality photography only.

- **OG card slot image** (`scripts/brand/generate-og.mjs`): the right-hand photo on image-bearing cards is sourced from `public/images/hands-headset-1920.jpg` (tracked — so `npm run og` runs from a clean checkout) via the `bellaPath` constant. It replaced a robotic AI "Bella" portrait that violated the no-sci-fi rule above and had shipped on every social card since the Perk era (fixed `be7a419`, 22 Jul 2026). To change it, point `bellaPath` at another tracked file in `public/images/` and re-run `npm run og`; **review the rendered PNGs** (`public/og/*.png`) before deploy — the crop lands in a 360×450 slot. The five text-only cards (products, voxdrive, contact, blog, platform) render no image slot and are unaffected. After a card image changes, LinkedIn/Facebook share caches must be re-scraped or they keep serving the old image for weeks.

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
- The rename (branch `rename/vox-products`) covered: slugs & routes, JSON-LD (`#vox` @id, `VOX_ID`), `firebase.json` redirects incl. legacy voco→vox **and** perk→vox 301s (single-hop), `PRODUCT_SLUGS` (accepts legacy voco *and* perk slugs during transition), site copy, blog posts, `llms.txt`, CI gates, tests, and OG cards.
- **Not renamed (deliberately):** the Firebase project id `vocotable` (immutable), the `docs/v1-baseline/` snapshot (historical diff target), and the booking-app subdomain `vocotable.biteperk.com.au` (`site.voxtableUrl` still points there until the app + DNS migrate — see the note in `src/data/site.ts`).

### Brand spec — what renames and what never does

| Layer | Value | Renames? |
|---|---|---|
| Company | **BitePerk** / `biteperk` / `biteperk.com.au` / `@biteperk.com.au` | **Never.** Wordmark renders `bite`+`<span class="perk">perk</span>`; the `.perk` class is company styling, not a product token. |
| Products | **Vox** (umbrella), **VoxTable**, **VoxOrder**, **VoxConcierge**, **VoxDrive** (concept) | Yes — this is the family that renamed. CamelCase, "by BitePerk". **VoxStay** is pitch-only (hotel prospects); never put it in site code. |
| Persona | **Bella** | Never. |
| Brand assets | `public/brand/` export kit (mark SVG/PNG, dark+light lockups) + `public/apple-touch-icon.png`, all generated by `npm run brand` (`scripts/brand/generate-brand.mjs`) — never hand-edit the exports; `biteperk-logo.jpeg` is the reference master and is never shipped into a page. On-site the mark is the inline `StarMark.astro` + CSS wordmark (site palette: white/ink "bite", gold italic "perk"; green only inside the mark). Schema.org logo = `/brand/biteperk-mark-512.png`. | Regenerate, don't redraw. |
| Contact | Published line `+61 2 5504 1140`; NAP Level 1, 477 Pitt St, Haymarket NSW 2000 — byte-identical everywhere. Print-only demo line `(02) 7501 1140` stays off the website and all directories. | Never. |
| Legacy slugs | `voco*` and `perk*` redirects + `PRODUCT_SLUGS` entries | **Keep forever** — printed collateral and cached links still use them. |
| Infra ids | Firebase project `vocotable`, the app subdomain, GCP project `vocotable-497209`, DB/image/package names, localStorage + event keys | Never — these are identity, not brand. |
- For hotel-prospect pitches (WiZiU / Ludovic Roux), the deck presents **VoxStay** (room bookings) alongside VoxTable/VoxOrder/VoxConcierge — VoxStay is pitch-only until a hotel product ships.
- ⚠️ **Trademark clearance for "VoxTable" is OUTSTANDING and gates deployment.** "Vox" is a common word (Latin for "voice") with many prior marks across media, telecom and audio (Vox Media, VOX, etc.), so formal AU/EU clearance is essential before deploy or major marketing spend. (Alternatives previously researched: Vireo, Vocelle.)
- **STATUS: SHIPPED 22 July 2026.** Vox is live in production on biteperk.com.au, and VoxTable is live on the booking app. Trademark clearance for "VoxTable" was confirmed before deploy. Deploy order used: merge → CI green → **functions first, then hosting** (CI does **not** deploy; `web.yml` only builds and gates).
- **Verified live at ship:** all four `/products/vox*/` return 200; every legacy `perk*` and `voco*` path (bare and `/products/*`) 301s **single-hop** to its Vox page; JSON-LD resolves to `#vox` with zero `#perk`/`#voco` remaining; `og/vox*.png` serve 200 and the legacy cards are retained for cached shares; `llms.txt` is all-Vox; NAP and `+61 2 5504 1140` byte-intact; contact round-trip returns `{"ok":true}` and writes to Firestore for `voxtable`, `perktable` **and** `vocotable` (test leads removed afterwards); browser walkthrough clean in both themes with zero console errors and zero failed requests.
- **Post-ship follow-ups (owner: Sam):** Search Console — resubmit the sitemap and URL-inspect the four new product URLs; re-scrape LinkedIn Post Inspector + Facebook Sharing Debugger so old Perk cards don't linger in social caches; add Vox picklist values in Zoho CRM (keep perk/voco for existing leads); launch GBP + directory citations Vox-native (none exist yet, so there are no external Perk citations to chase).
- Post-rename follow-ups: external directory listings & GBP, and the app subdomain. Decision log: claude.ai Project → `claude/Ludovic-WiZiU-Pitch.md`.
- **`marketing/` collateral — partly rebuilt.** The 7 PDFs from `marketing/print/build_pack_extras.py` (business cards, stickers, demo card, follow-up) are rebuilt as VoxTable and verified. Still **VocoTable and still without a generator**: `BitePerk_VocoTable_Brochure_A5.pdf`, `BitePerk_VocoTable_Deck_Print.pdf`, `BitePerk_Walkin_Demo_Kit.pdf`, and the two `vocotable-flyer-a5*.pdf`. `build_flyer.py` is Vox-clean in its copy but still hardcodes dead sandbox paths (`/sessions/dreamy-kind-fermi/...`) for its fonts and Bella image, so it cannot run as-is. **Deliberately deferred until the VoxTable trademark clears** (decision, 22 Jul 2026) — writing generators that bake in a name clearance might reject is the exact risk the trademark gate exists for. The 7 pieces actually handed to prospects are already rebuilt, so nothing is blocked on this.
- ⚠️ **When renaming, the company wordmark `biteperk` is NOT a product token.** A bulk `Perk*`→`Vox*` pass turned `bite`+`perk` into `bite`+`vox` in six places. Four were caught in `src/`; two were not — `scripts/brand/generate-og.mjs` (every social card) and `marketing/print/build_pack_extras.py` (physical business cards). Both are now fixed and commented. The print one is the dangerous shape: the wordmark is drawn as two separately-positioned strings, so grepping "bitevox" finds nothing, and `pdftotext` looks perfect because the *product* name is right. **Verify branding by rendering to pixels (`pdftoppm -png`), never by text extraction.**
- Composite images: `public/images/composites/*.png` is gitignored (only `.avif`/`.webp` are tracked), so renaming a composite needs `git mv` for the tracked pair **and** a plain `mv` for the PNGs. The built HTML deliberately references **only** AVIF/WebP — never the `.png`. Referencing a PNG makes the output depend on a file that exists locally but never in a CI checkout, so CI would validate a different tree than the local `firebase deploy` ships. Don't add a `.png` source back to `Composite.astro`.
