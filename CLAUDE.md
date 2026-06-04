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
```

There are no unit tests. CI (`.github/workflows/web.yml`) runs `npm run check`, `npm run build`, asserts a hard-coded list of `dist/*` routes exist, sanity-checks the sitemap, and runs lychee against built HTML. Match the route list there when adding/removing pages.

## Deploy

Site is one Firebase project (`vocotable`) with hosting target `biteperk`:

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
- `src/data/nav.ts` — top nav structure.
- `src/data/schema.ts` — sitewide JSON-LD `@graph` (Organization+LocalBusiness, WebSite) emitted once by `Base.astro`. Page-specific schema (BreadcrumbList, FAQPage, Article, SoftwareApplication) is built on the page and references `ORG_ID`/`WEBSITE_ID` by `@id` so Google merges them into one entity.

### Layouts & routing

- `src/layouts/Base.astro` — every page extends this. Owns `<head>`, sitewide `<Nav>`/`<Footer>`, View Transitions (`ClientRouter`), `<SEO>` component, sitewide JSON-LD graph, and deferred script imports (`src/scripts/*.ts`). Pages pass `title`, `description?`, `path?` (canonical override), `preloadImage?`, `ogImage?`.
- `src/layouts/ProductLayout.astro` — wraps Base for product pages.
- `src/pages/products/[slug].astro` — `getStaticPaths` over `products.ts`. Behaviour branches on `product.status` (live vs in-development vs concept).
- `src/pages/blog/[...slug].astro` + `src/content/blog/*.md` — Astro Content Layer collection defined in `src/content.config.ts`. Schema enforces `title`, `seoTitle?` (use when on-page H1 would truncate in SERPs), `description`, `publishDate`, `draft`, `featured`. Drop a `.md` with frontmatter to ship a new guide — it auto-appears on `/blog/`, the sitemap, and gets Article JSON-LD.

### Astro config quirks worth knowing

- `output: "static"` + `trailingSlash: "ignore"` — Firebase Hosting `cleanUrls: true` handles `/foo` ↔ `/foo/`.
- `compressHTML: true` collapses `alt=""` to bare `alt`, which Bing Site Scan reads as missing alt. Don't use empty alts on visible images; for decorative-in-aria-hidden cases, prefer omitting the image or using CSS backgrounds.
- `inlineStylesheets: "auto"` and `prefetch.defaultStrategy: "viewport"` are tuned for hero LCP — don't undo without reason.
- `@astrojs/sitemap` is filtered and re-prioritised in `astro.config.mjs` (homepage 1.0, products 0.9, `/sydney/` 0.9, blog 0.8, individual guides 0.7 weekly, legal 0.4).

### SEO / discoverability layer

This repo is heavily tuned for local + AI-agent discoverability. When touching this surface, keep in mind:

- `public/llms.txt` is hand-curated for AI crawlers (ChatGPT/Claude/Gemini/Perplexity). Update it when product copy or privacy facts change so AI answers stay accurate.
- `public/robots.txt` explicitly welcomes AI crawlers. Don't restrict them.
- LocalBusiness schema in `schema.ts` drives Google local pack eligibility — keep NAP byte-identical to what's published on the site, footer, GBP, and external directories.
- Blog frontmatter `seoTitle` is the lever for fixing long `<title>` tags in SERPs without touching the H1.

### Contact form flow

Form posts same-origin to `/api/contact` → Firebase Hosting rewrites to `contactForm` Cloud Function → validates → writes to Firestore (`biteperk-leads`) → best-effort Zoho SMTP notification. Origin allowlist: `biteperk.com.au` and `www.biteperk.com.au` only. Honeypot field is `_gotcha`. Product slug allowlist (`PRODUCT_SLUGS` in `functions/index.js`) must be kept in sync with `src/data/products.ts`.

## Redirects to remember

`firebase.json` 301s the bare product slugs (`/vocotable`, `/vocoorder`, `/vococoncierge`, `/vocodrive`) and legal short-paths (`/privacy`, `/terms`) to their canonical `/products/<slug>/` and `/legal/<page>/` URLs. Don't change these without updating any external links/citations.

## Image pipeline

`scripts/{fetch-images,grade,generate-images,generate-og}.mjs` are one-shot generators run via `npm run images` / `npm run og`. Outputs land in `public/` (committed). Don't run in CI — they're for content updates.

## Docs

- `docs/directory-citations.md` — tiered AU/SaaS directory submission plan + canonical NAP block (paste-ready).
- `docs/review-requests.md` — Google review request templates (post-GBP verification).
