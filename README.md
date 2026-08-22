# biteperk-website

Marketing site for **BitePerk** — voice + AI tools for hospitality (Vox, the AI
phone host). One Astro 5 codebase, one domain (**biteperk.com**), six locales.

> Working in this repo with an AI agent? **CLAUDE.md** is the authoritative
> instruction file (conventions, hazards, brand rules). This README is the map.

## Architecture in one diagram

```
BUILD_TARGET=au      astro build  →  dist/         (Astro base /au-en)
BUILD_TARGET=global  astro build  →  dist-global/  (/en /gb-en /fr /be-en /be-fr)
                              prune-global.mjs  (drop AU pages from global pass)
                              llms-global.mjs   (global llms.txt + robots.txt)
merge-dist.mjs  →  dist-site/     ← what biteperk.com actually serves
                   dist-cctld/    ← biteperk.com.au = 301 redirect host only
```

- `biteperk.com/au-en/**` — the Australian site (products, cities, blog).
- `biteperk.com/{en,gb-en,fr,be-en,be-fr}/**` — international market trees
  (noindex behind the `INTL_LAUNCHED` env flag until launch).
- `biteperk.com.au/*` → 301 → `biteperk.com/au-en/*` (Firebase, `dist-cctld/`).
- `biteperk.uk/*` → 301 → `biteperk.com/gb-en/*`, `biteperk.fr/*` → `/fr/*`,
  `biteperk.be/*` → `/be-en/*` — ccTLD front doors handled by **Cloudflare
  Redirect Rules** (deliberately not firebase.json; see
  `docs/accounts-and-ops-log.md`).

## Single sources of truth (edit here, never at call sites)

| File | Owns |
|---|---|
| `src/data/locales.ts` | Locales, bases, hreflang, x-default, `u()`/`abs()` URL helpers — **everything locale-aware derives from this** |
| `src/data/intl/` | International copy: `copy.ts` (EN/FR language cores) + `markets.ts` (per-market overrides + imagery) + `index.ts` (`resolveCopy`) |
| `src/data/products.ts` | Product catalogue → pages, nav, footer, JSON-LD |
| `src/data/cities.ts` | AU city landing-page engine |
| `src/data/site.ts` | Name, URL, phone, email, NAP address, hours |
| `src/data/nav.ts` | AU nav + footer structure |
| `src/data/schema.ts` | Sitewide JSON-LD `@graph` (stable `@id`s) |

## Commands

```bash
npm run dev          # AU dev server (port 4321)
npm run build:site   # both targets + merge → dist-site/ (what production serves)
npm run gates:au     # AU gate suite (needs npm run build first)
npm run gates:global # global gate suite incl. unit tests (needs build:global)
npm run test:e2e     # AU: chromium+webkit+firefox, real mobile devices, axe
npm run test:intl    # global build: device widths, chrome, consent, suggestion
npm run test:unit    # intl copy-merge contract
npm run lhci         # Lighthouse budgets (needs build:site)
npm run brand        # regenerate the logo kit (public/brand/) + touch icon
npm run og           # regenerate OG cards (BUILD_TARGET=global for intl set)
npm run images       # photo pipeline: fetch → grade → composites
```

## The gates (scripts/gates/ — CI runs all of them)

| Gate | Protects against |
|---|---|
| `check-routes` | Missing/renamed pages (route list generated from data) |
| `check-assets` | Built HTML referencing files that don't exist |
| `check-links` | Internal links escaping the locale base |
| `check-schema` | JSON-LD `@id` drift, NAP corruption, LocalBusiness leaking onto global pages |
| `check-truthful` | AU phone/NAP/price leaking onto international pages |
| `check-hreflang` | Broken/non-reciprocal hreflang clusters (global) |
| `check-cities` | Doorway-page thin content on city pages (AU) |
| `check-contrast` | WCAG AA regressions in the token pairs (both themes) |
| `check-images` | Unreviewed AI-imagery manifest slots |

There are no unit tests beyond `tests/unit/` (the intl copy-merge contract);
the gates + Playwright + axe + Lighthouse budgets are the safety net.

**Browser suites.** `playwright.config.ts` covers the AU build (desktop
chromium/webkit/firefox, real Pixel 7 + iPhone 14 device projects, axe);
`playwright.intl.config.ts` covers the **global** build on its own preview.
Two configs, not two projects: `webServer` entries all start on every run, so
a global preview in the main config would break the AU CI leg, which never
builds `dist-global`. Every route in both suites carries a
**horizontal-overflow assertion at 390 and 768** — the cheap net for device
regressions.

## Directory map

```
src/            components (+sections/), data (SSOT), layouts, pages, scripts, styles, content/blog
public/         served assets — images (committed pipeline output), og cards, brand kit
scripts/        gates/ (CI) · build/ (merge/prune/llms) · images/ (photo pipeline) · brand/ (og + logo kit)
tests/          e2e/ (Playwright) · a11y/ (axe) · unit/ · helpers/routes.ts (generated route list)
functions/      the contact-form Cloud Function (Firestore + Zoho)
docs/           committed ops content (art direction, marketing engine, citations…)
marketing/      print collateral + generators
deliverables/   gitignored working material (decks, plans, local archive)
```

## Deploy

`.github/workflows/deploy-firebase.yml` manually deploys Firebase Hosting from
`main` only. It checks out the latest `main`, builds the merged production tree
with `INTL_LAUNCHED=true npm run build:site`, then deploys both Hosting targets:

- `biteperk-global` — the site at `biteperk.com`.
- `biteperk` — the `biteperk.com.au` redirect host.

Required GitHub variables, normally on the `production` Environment:

- `FIREBASE_PROJECT_ID` — `vocotable`.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`.
- `GCP_FIREBASE_DEPLOY_SERVICE_ACCOUNT`.

Manual deploy remains available for break-glass use:

```bash
npm run build:site
firebase deploy --only hosting:biteperk-global   # the site (biteperk.com)
firebase deploy --only hosting:biteperk          # the ccTLD redirect host
firebase deploy --only functions:biteperk-website  # only when functions/ changed
```

Firebase project id is `vocotable` — legacy, immutable, do not "fix".
