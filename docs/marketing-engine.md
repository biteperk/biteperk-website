# BitePerk marketing engine — operating cadence

The on-site engine (city pages, guides, schema, llms.txt) is code-gated:
`check-cities.mjs` / `check-routes.mjs` / `check-schema.mjs` / `check-contrast.mjs`
run in CI, so content ships safely. This doc is the recurring off-site + content
rhythm that turns it into rankings and leads.

## Weekly
- **One guide** (`src/content/blog/*.md`) alternating: (a) national money topic
  ("what missed calls cost…"), (b) city-support topic interlinked with its city page
  ("Melbourne restaurant no-show rates", "Brisbane wet-season booking playbook").
  Set `seoTitle` if the H1 would truncate in SERPs; link the relevant `/[city]/`
  page in the body and add the slug to that city's `relatedGuides`.
- Answer every review/enquiry within 24h (response time is a local-pack signal).

## Monthly
- **Google Business Profile (Sydney)**: 2 posts, fresh photos, Q&A seeding.
  (GBP verification is the single highest-leverage pending item.)
- **Review requests**: run the templates in docs/review-requests.md after happy
  support interactions; target 2–3 new Google reviews/month.
- **Citations**: work through docs/directory-citations.md tiers — NAP byte-identical
  to `src/data/site.ts` everywhere (Yellow Pages AU, TrueLocal, StartLocal, Clutch,
  hospitality directories).
- **Search Console mining**: queries with impressions-but-low-CTR → new FAQ entries
  on the matching city page (each city's `faqs` array); pages slipping to page 2 →
  refresh that guide's content + internal links.

## Quarterly
- **Next city tier** once current six index and rank: Canberra, Newcastle,
  Wollongong, Hobart. One `cities.ts` entry each with hand-written copy
  (`published: false` until the copy passes `check-cities.mjs`), plus OG card.
- **CWV audit** (Search Console field data + Lighthouse), schema re-validation
  (Rich Results Test on home / a product / two cities / a guide).
- Refresh llms.txt facts if pricing/products/privacy changed.

## Launch blockers (one-time, still open)
- [ ] Fill `abn: "TODO"` in `src/data/site.ts` (footer + trust signal).
- [ ] Verify Google Business Profile (Haymarket address).
- [ ] Analytics decision: Plausible self-proxied under `/js/` (keeps CSP
      `script-src 'self'`) — needs a Plausible account before wiring.
