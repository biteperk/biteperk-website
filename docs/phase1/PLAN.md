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

### Wave 1 — Platform architecture (1A)
- Extend market config fields needed for expansion readiness: currency, primary phone strategy, address strategy (without inventing fake CA NAP)
- Add `planned` locales (`ca-en`, `ca-fr`) that **do not emit routes** until an explicit `published: true` (or `INTL_LAUNCHED`-style flag) flips
- Document Canada readiness checklist in this folder

### Wave 2 — Solutions engine (1C) — **AU first commercial intent**
- [x] `/au-en/solutions/` index + `/au-en/solutions/{slug}/` for the eight required verticals
- [x] Shared layout: Hero → Problem → Lost revenue → How we solve → Features → Benefits → Story → FAQ → Book demo
- [ ] Wire Products mega-menu / footer only after ≥1 solution page is live *(Wave 3)*
- [ ] Intl: reuse same registry via `[...intl].astro` page registry once AU template is green

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
- [x] Category indexes under `/resources/{segment}/`
- [x] Header/footer “Guides” → “Resources”
- [ ] Deeper internal links from solutions ↔ resources (ongoing with content)
- [ ] Optional later: 301 `/blog/` → `/resources/guides/` once analytics clear

### Wave 5 — Conversion system (1E)
- Shared CTA module (Book Demo primary, See How It Works secondary)
- Page-level checklist gate or component contract: CTA + phone + trust + story + FAQ
- Contact/`product=` query continuity for solutions and resources

### Wave 6 — SEO foundation (1F)
- Audit existing `schema.ts` / SEO component against Organization · FAQ · Article · Breadcrumb · SoftwareApplication
- Ensure every new solutions/resources template emits the set
- Breadcrumb + hub linking rules

### Wave 7 — Canada readiness (1G)
- Add `ca-en` / `ca-fr` as planned locales (noindex, no sitemap, no public picker) when Wave 1 lands
- Ontario / BC / Alberta and Montréal / Québec / Laval / Longueuil as *planned* city slots (unpublished)
- Launch = content + flip publish flags — **no template rewrite**

### Wave 8 — Content production (1H)
- Cadence: weekly guide+comparison; monthly case study+product update; quarterly industry report
- Track inventory vs Definition of Done in `docs/phase1/CONTENT-INVENTORY.md` (add in a later PR)

---

## Definition of Done (Phase 1) — acceptance

### Platform
- [ ] Localisation remains config-driven via existing SSOT (+ locale-plan)
- [ ] Reusable solutions + resources templates
- [ ] Canada reserved without emitting public routes

### Content (AU)
- [ ] 20+ guides, 10+ comparisons, 10+ FAQs, 5+ case studies, industry reports (inventory tracked)
- [ ] All eight solution pages live on AU

### SEO / conversion
- [ ] Metadata + schema + internal linking on new templates
- [ ] Every new page: Book Demo CTA, trust, FAQ; mobile-safe

### Expansion
- [ ] UK / FR / BE continue on **current bases**; Canada ready to publish from config

---

## Out of scope for early waves
- Renaming live locale bases
- Staging Firebase / auto-deploy from `integration`
- Rewriting product catalogue or Vox naming
- Building Canada city pages as published content

## PR discipline
- Base: **`integration`**
- Promote to **`main`** only after soak + green CI
- Deploy: `gh workflow run "Deploy Firebase Hosting" --ref main`
