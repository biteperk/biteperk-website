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

## Consent + tracking (shipped 2026-07-19, staged)

A GDPR/Privacy-Act consent system is live-ready but **inert until IDs are added** — one config file, `src/data/consent.ts`:
- **Go-live analytics:** create the Plausible site for `biteperk.com.au`, then set `plausibleReady = true` (and flip the same in the Cloud Function per the analytics note above).
- **Go-live LinkedIn remarketing:** create the LinkedIn ads account, set `linkedInPartnerId = "…"`, and optionally fill `linkedInConversions` (keyed by goal name) to fire ad conversions. CSP origins (`snap.licdn.com`, `px*.ads.linkedin.com`) are **pre-provisioned** in `firebase.json` so this is a one-line change with no infra edit.
- **Behaviour:** strict opt-in (nothing until Accept), "Reject all" equal-weight; cookieless Plausible; the banner **auto-appears only once a tracker is armed** (`TRACKING_ARMED`) — a tracker-free deploy shows no notice. Preview any time with `?cookie-preview=1`.
- **Marketing value layer:** canonical goal taxonomy + `[data-cta]` normalisation; first-touch lead attribution (`utm_*`/referrer → contact form hidden field → Firestore `attribution` on each lead) so campaign→demo is measurable; an opt-in-rate event on Accept.
- **Cookie Policy:** `/legal/cookies/` (and `/cookies` 301). Privacy policy's website-tracking line updated; customer-call-data promises unchanged.
