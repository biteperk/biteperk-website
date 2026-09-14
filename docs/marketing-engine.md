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
- [x] Fill `abn` in `src/data/site.ts` — 36 700 831 303, footer links to ABN Lookup.
- [ ] Verify Google Business Profile (Surry Hills address).
- [x] Analytics decision (resolved 2026-09-14): self-hosted **Umami** on Railway
      replaced Plausible. Cookieless, no personal data, IP hashed → loads for
      every visitor (audience-measurement exemption), opt-out via the banner.
      Config in `src/data/consent.ts` (`UMAMI_*`); tracker in `Base.astro`.

## Consent + tracking (shipped 2026-07-19, staged)

A GDPR/Privacy-Act consent system is live-ready but **inert until IDs are added** — one config file, `src/data/consent.ts`:
- **Analytics (live 2026-09-14):** self-hosted **Umami** (Railway). Cookieless, no personal data, IP hashed — loads for every visitor by default under the audience-measurement exemption; the banner's Analytics toggle is an **opt-out** (`umami.disabled`). Website id / host in `src/data/consent.ts` (`UMAMI_*`); staging uses its own website via `UMAMI_ENV`.
- **Go-live LinkedIn remarketing:** create the LinkedIn ads account, set `linkedInPartnerId = "…"`, and optionally fill `linkedInConversions` (keyed by goal name) to fire ad conversions. CSP origins (`snap.licdn.com`, `px*.ads.linkedin.com`) are **pre-provisioned** in `firebase.json` so this is a one-line change with no infra edit.
- **Behaviour:** analytics (cookieless Umami) loads by default and is opt-out; marketing trackers stay strict opt-in, "Reject all" equal-weight. The banner **auto-appears only once a MARKETING tracker is armed** (`TRACKING_ARMED`) — analytics no longer arms it, so a marketing-tracker-free deploy shows no notice. Preview any time with `?cookie-preview=1`.
- **Marketing value layer:** canonical goal taxonomy + `[data-cta]` normalisation; first-touch lead attribution (`utm_*`/referrer → contact form hidden field → Firestore `attribution` on each lead) so campaign→demo is measurable; an opt-in-rate event on Accept.
- **Cookie Policy:** `/legal/cookies/` (and `/cookies` 301). Privacy policy's website-tracking line updated; customer-call-data promises unchanged.
