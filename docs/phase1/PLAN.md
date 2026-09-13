# Phase 1 — Australia Authority & Global Foundation

**Status:** in progress on `feat/phase1-au-authority` → PRs into `integration`  
**Owner:** Sam / Biteperk-Website-Improvement  
**Last updated:** 2026-09-12

## SME verdict on the brief

The brief’s *order* is right (architecture → nav → solutions → resources → conversion → SEO → Canada → content cadence). The live codebase already owns most of the hard parts. Phase 1 must **extend** that SSOT, not replace it with a parallel system.

### Locked decisions (do not reopen without a migration plan)

| Brief asks | Live reality | Decision |
|---|---|---|
| `/uk-en/` | `/gb-en/` + `biteperk.uk` | **Keep `/gb-en`**. Renames burn SEO + Cloudflare rules. Treat “UK” as a label; base stays `gb-en`. |
| `/fr-fr/` | `/fr/` (hreflang `fr-FR` + `fr`) | **Keep `/fr`**. Same reason. |
| Listed locales omit `/en`, `/be-en` | `/en` is x-default; `/be-en` is live | **Keep both**. They are load-bearing. |
| JSON locale blob on every page | `locales.ts` + `markets.ts` + `site.ts` | **Extend existing SSOT** — do not invent a second config tree. |
| Resources hub `/resources` | Guides live at `/blog/` | Evolve: add `/resources/` as hub; keep `/blog/` URLs with redirects later if renamed. |
| Nav: Products · Solutions · Resources · … | Current: Pricing · Platform · How it works · Guides · About | **Ship Solutions + Resources IA before flipping header**. Partial nav without destinations is worse than today’s. |

### Principles → engineering rules

1. **Build once, reuse everywhere** → one Astro template + data registries (`products`, `solutions`, `cities`, intl copy cores).
2. **No country-specific code** → market colour only in `locales.ts` / `markets.ts` / planned `locale-plan.ts`. Gates (`check-truthful`, hreflang, schema) stay the enforcement.
3. **Content before expansion** → AU solutions + resources depth before enabling Canada emission.
4. **Traffic / trust / conversion** → every new route must declare `purpose: traffic | trust | conversion` in its registry (see `solutions.ts`).

---

## Wave plan (execution order)

### Wave 0 — Decision lock *(this PR)*
- [x] Publish this plan under `docs/phase1/`
- [x] Codify live↔brief locale map + reserved Canada in `src/data/locale-plan.ts`
- [x] Codify target nav IA in `src/data/nav-ia.ts` (data only — **not** wired to header yet)
- [x] Codify Solutions registry in `src/data/solutions.ts` + unit contract test

### Wave 1 — Platform architecture (1A) *(done 13 Sep 2026 — C1/C2, #87)*
- [x] `Locale.status: "planned"` + `ALL_LOCALES` filter: `ca-en` / `ca-fr` registered, typed everywhere, emitted nowhere (`check-planned` proves it on every merged build)
- [x] `Market += "ca"` with a compliance entry; no currency/phone/address invented (`check-truthful` bans `+1` numbers and CAD amounts)
- [x] `docs/phase1/CANADA-READINESS.md` — the 14-row launch checklist

### Wave 2 — Solutions engine (1C) — **AU first commercial intent**
- [x] `/au-en/solutions/` index + `/au-en/solutions/{slug}/` for the eight required verticals
- [x] Shared layout: Hero → Problem → Lost revenue → How we solve → Features → Benefits → Story → FAQ → Book demo
- [x] Wire Products mega-menu / footer only after ≥1 solution page is live *(Wave 3, #65 / #72)*
- [x] Intl: same registry via `[...intl].astro` — 45 solution pages across the five trees *(M1, #79 → landed via #72)*

### Wave 3 — Navigation (1B)
- [x] Desktop: Solutions mega-menu beside Products (eight verticals + hub)
- [x] Mobile: Solutions section
- [x] Footer: Solutions column
- [x] “How it works” desktop-hidden (still mobile + footer) to fit the second megamenu
- [x] Header becomes full Phase 1 IA including Resources *(Wave 4)*
- [x] Map old “Guides” → Resources
- [ ] e2e nav coverage refresh if selectors drift

### Wave 4 — Resources authority hub (1D)
- [x] `/resources/` hub page (library IA)
- [x] Content `type` on blog schema: guide · comparison · case-study · faq · product-update · industry-report
- [x] Existing posts classified (12 guides + 1 comparison); URLs stay `/blog/{slug}/`
- [x] Category indexes under `/resources/{segment}/` — **only for populated types** (13 Sep: four empty, indexable pages were a thin-page signal; `check-routes` now fails an empty one that builds)
- [x] Header/footer “Guides” → “Resources”; `/blog/` index canonicalises to `/resources/guides/` and leaves the sitemap
- [x] Deeper internal links from solutions ↔ resources *(S2, #76; enforced by `check-internal-links`)*
- [ ] Optional later: 301 `/blog/` → `/resources/guides/` once analytics clear

### Wave 5 — Conversion system (1E)
- [x] Shared conversion SSOT (`src/data/conversion.ts`) — Book Demo primary, See How It Works secondary
- [x] `Cta.astro` Phase 1E defaults + `ConversionTrust` phone/trust line
- [x] Wired on solutions, products, city, blog, resources commercial surfaces
- [x] Contact `intent=demo` + optional `product=` continuity via `bookDemoHref()`
- [x] `CONVERSION_PAGE_REQUIREMENTS` is **enforced** by `scripts/gates/check-conversion.mjs` over every built commercial page *(13 Sep — it had been documented as unit-tested while nothing imported it)*

### Wave 5.5 — Hardening before promotion *(13 Sep 2026, PRs #72 #73 + this one)*
- [x] Solutions: named product links (was "See voxtable"), status-derived nav pills, real approved proof quotes, "Why we built this" instead of "Customer story", truthful copy, CTAs through `bookDemoHref()`
- [x] Resources: empty categories build no page; `/blog/` canonical → hub; nav order = Phase 1 IA; `nav-ia.ts` removed (it was never wired — two nav definitions)
- [x] Sitemap priorities for solutions/resources, cities derived, `lastmod` on posts; one predicate for which solution pages build
- [x] Gates: `check-conversion` (this contract), unit tests in `gates:au`, foundation tests import the registries instead of grepping source

### Wave 6 — SEO foundation (1F) *(done 13 Sep 2026 — S1–S4 #75–#78, M1–M4 #79–#82, L1–L3 #83/#84/#86; all landed via #72 + #89)*
- [x] Page-level schema builders (`buildBreadcrumb`, `buildWebPage`, `buildCollectionPage`, `buildContactPage`, `buildFaqPage(…, lang)`); `Breadcrumbs.astro` emits its own JSON-LD; every node linked by `@id`
- [x] Every solutions/resources template emits the set on all six trees; `check-schema` per-template type sets + `@id` integrity
- [x] Internal-linking graph (solutions ↔ guides ↔ products, intl product ↔ city) enforced by `check-internal-links` on both targets; `check-meta`, `check-llms`, `check-sitemap`, blocking offline lychee
- [x] Multinational engine: Solutions + Resources on every locale tree, compliance registry (`intl/compliance.ts`) + `check-market-disclosure`, parity test; feel-local waves (`/en` region router, market vocabulary, bilingual Belgian demo, Antwerp; Liège staged)

### Wave 7 — Canada readiness (1G) *(done 13 Sep 2026 — #87)*
- [x] `ca-en` / `ca-fr` planned locales — no routes, sitemap, hreflang, picker, OG or manifest (`check-planned` in `gates:merged`, fault-injected)
- [x] Seven `published:false` city stubs (Toronto, Vancouver, Calgary; Montréal, Québec, Laval, Longueuil) with real districts
- [x] Launch = content + flip `status` on both locales in one commit — **no template rewrite** (`locale-planned.test.mjs` enforces the pairing)

### Wave 8 — Content production (1H) *(system done 13 Sep 2026 — W1 #88; batches are next)*
- [x] Proof rules in the schema: a published case study needs `customer.approved: true`, a report needs `sources`; six templates in `docs/phase1/templates/`; per-post OG cards
- [ ] Batches: case studies (Mazcina, Natalia — approvals pending) → comparisons ×4 → FAQ ×10 → guides ×8 → product update → industry report (real data only); intl seed sets after
- Cadence: weekly guide+comparison; monthly case study+product update; quarterly industry report
- Inventory vs Definition of Done is **generated**: `docs/phase1/CONTENT-INVENTORY.md` from `RESOURCE_DOD_*` (resources.ts) + the collections; the unit test fails when it is stale. Templates: `docs/phase1/templates/`.

---

## Definition of Done (Phase 1) — acceptance

### Platform
- [x] Localisation remains config-driven via existing SSOT (`locales.ts` is the SSOT; `locale-plan.ts` was superseded by `ALL_LOCALES` + `status`)
- [x] Reusable solutions + resources templates (AU + all five intl trees)
- [x] Canada reserved without emitting public routes (`check-planned`)

### Content (AU)
- [ ] 20+ guides, 10+ comparisons, 10+ FAQs, 5+ case studies, industry reports (inventory tracked)
- [ ] All eight solution pages live on AU *(built and green on `integration` + staging; production after the integration → main promotion)*

### SEO / conversion
- [x] Metadata + schema + internal linking on new templates (`check-meta`, `check-schema`, `check-internal-links`)
- [x] Every new page: Book Demo CTA, trust, FAQ; mobile-safe (`check-conversion`; no-overflow assertions in both browser suites)

### Expansion
- [x] UK / FR / BE continue on **current bases**; Canada ready to publish from config

---

## Staging *(done 13 Sep 2026 — #85)*
- `biteperk-staging.web.app` auto-deploys from `integration` (`deploy-staging.yml`), `noindex`, generated hosting block (`check-staging-hosting`); the staging origin is on the contact function's allowlist (leads tagged `environment`, kept out of Zoho).

## Out of scope for early waves
- Renaming live locale bases
- Rewriting product catalogue or Vox naming
- Building Canada city pages as published content

## PR discipline
- Base: **`integration`**
- **One PR at a time — never stack PRs.** The rulesets are squash-only with strict up-to-date checks, so a stack cascades (13 Sep 2026: sixteen stacked PRs collapsed into one squash, #72). Validate the full local chain before pushing; merge; then start the next.
- Promote to **`main`** only after soak + green CI
- Deploy: `gh workflow run "Deploy Firebase Hosting" --ref main`
