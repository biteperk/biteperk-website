/**
 * Lighthouse CI budgets (Phase 7 gate). Runs against dist-site/ via a
 * COMPRESSING static server (see below), mobile emulation (Lighthouse
 * default).
 *
 * MUST be dist-site/, not dist/: the AU build carries Astro base /au-en, so
 * its pages sit flat in dist/ while referencing /au-en/_astro/**. Served at
 * the root, every stylesheet, font and script 404s and the run measures an
 * unstyled page. dist-site/ is the merged tree the biteperk.com host actually
 * serves (au-en/** + en/** + fr/**), so the URLs below resolve exactly as in
 * production. Build it with `npm run build:site`.
 *
 * Budgets: perf ≥95 (mobile), LCP ≤2.5s, CLS ≤0.02, first-party JS ≤60KB.
 *
 * COMPRESSION (rev. 6 Sep 2026 — issue #32). This used `staticDistDir`, whose
 * server is @lhci/cli's bare `express.static`: NO gzip, NO brotli. Firebase
 * Hosting serves brotli. The AU home is 261KB raw and 32.5KB brotli — an 8×
 * difference, ~1.15s of transfer at the 1.6Mbps Lighthouse mobile throttle —
 * so every LCP here was measured against a page a real visitor never receives.
 * Measured locally, same build and machine, uncompressed → compressed:
 * /fr 2404→1977ms, /gb-en 2553→2044ms, AU home FCP 2932→1429ms.
 *
 * That pessimism is why the AU home has been failing at 2514–2526ms against
 * this 2500 budget while its bytes went DOWN (the last green main, 144bab6,
 * built a 259,259-byte AU home; today's is 261,244 — 2KB, ~10ms). The page did
 * not regress; it sits ON the line, and which side a given runner lands on is
 * luck. Serving what production serves is the fix; raising the budget is not,
 * and the assertion block below says why.
 *
 * `serve` is a pinned devDependency (NOT `npx serve`) so CI installs a known
 * version with `npm ci` instead of resolving one over the network mid-run.
 *
 * Note: script:size asserts on TRANSFER size, which is now compressed — so
 * that budget got looser in real terms when this changed. See the note on it.
 */
module.exports = {
  ci: {
    collect: {
      // Production parity: brotli/gzip, clean URLs, directory indexes.
      startServerCommand: "npx serve dist-site --listen 4173 --no-clipboard",
      startServerReadyPattern: "Accepting connections",
      // Representative page of each template. The port is explicit now that
      // we start our own server (startServerCommand), not LHCI's.
      url: [
        "http://localhost:4173/au-en/",
        "http://localhost:4173/au-en/products/voxtable/",
        "http://localhost:4173/au-en/sydney/",
        "http://localhost:4173/au-en/blog/what-missed-calls-cost-your-restaurant/",
        "http://localhost:4173/au-en/contact/",
        // The market trees are in the same merged build and must stay inside
        // the perf contract — they carry hero imagery and a market band, and
        // their visitors are the furthest from the Sydney origin.
        "http://localhost:4173/gb-en/",
        // The city-page template (Jul 2026): photographic split hero
        // (deprioritized cityscape beside the headline — text stays the LCP
        // element), one lazy story image, the district chips and the
        // seven-card cross-link grid. London stands in for all eight cities.
        "http://localhost:4173/gb-en/london/",
        "http://localhost:4173/fr/",
        // /en is the x-default and had the largest perf delta of any tree when
        // heroes landed (0 images → a priority-loaded LCP hero), so it is the
        // one most worth measuring. /be-en covers the second French/Flemish
        // market and the shared Belgian hero.
        "http://localhost:4173/en/",
        "http://localhost:4173/be-en/",
        // /be-fr was the one locale home not measured; it carries the longest
        // French copy of the five. The VoxStay product page is the only intl
        // product page with a portrait hero photo (Sep 2026).
        "http://localhost:4173/be-fr/",
        "http://localhost:4173/fr/products/voxstay/",
      ],
      // Median of 3: single runs on shared 2-core CI runners produce
      // coin-flip TBT/perf numbers (observed 619ms TBT with 26KB of JS).
      //
      // 5 was tried on 6 Sep 2026 and reverted the same day: it is the more
      // accurate measurement, and it accurately measured the AU home at
      // 2514–2526ms against a 2500 budget on an UNCOMPRESSED server. The
      // compression fix above is what actually addressed that; 5 runs is worth
      // restoring once these budgets have been re-tightened against real
      // compressed CI numbers (issue #32). Cost to weigh then: a 5-run pass is
      // ~12.5 min on the runner, and the retry step doubles it — which is what
      // the AU job's 40-minute timeout exists for.
      numberOfRuns: 3,
      settings: {
        skipAudits: ["uses-http2"], // static server is h1
        // Advanced consent mode deliberately loads Google's tag while storage
        // is denied. Its third-party payload is independently versioned and
        // was making the 60KB first-party regression budget read ~175KB while
        // also introducing external-network variance into LCP. Keep synthetic
        // CI focused on code this repository controls; the consent E2E test
        // separately asserts that the live tag request and command order exist.
        blockedUrlPatterns: ["https://www.googletagmanager.com/gtag/js*"],
      },
    },
    assert: {
      // One strict set for every URL, AU and market trees alike. The market
      // trees were briefly pinned looser while a CI-only CLS was unexplained.
      // It was font swap, in two parts, both now fixed: the metrics-matched
      // fallback in global.css named only fonts absent from Ubuntu (so the
      // override never applied on CI), and `font-display: swap` guaranteed a
      // reflow whenever Inter lost the race regardless. Inter is now
      // `optional` (astro.config.mjs) and CLS measures 0.000 everywhere.
      //
      // Do not re-introduce a per-tree budget to make a number pass —
      // diagnose it. The recipe in global.css reproduces CI's Linux +
      // Lighthouse combination to 17 significant figures; heed its warning
      // about `serve -s`, which silently measures the home page instead.
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        // 2500ms = Google's official "good" LCP threshold. The original
        // 2000 budget was authored for the minimal v1 site; the v2 design
        // deliberately ships a cinematic full-viewport hero. Real
        // optimisations applied first (inlined CSS, responsive preload,
        // async decode, content-visibility on below-fold sections).
        //
        // DELIBERATELY UNCHANGED while compression lands, and therefore
        // temporarily loose: the same pages that measured 2103–2496ms
        // uncompressed-locally now have ~1.2s more headroom, so 2500 no longer
        // bites. It must be re-tightened to the observed compressed CI maximum
        // plus a margin, in a follow-up on real CI numbers rather than a guess
        // that turns main red again. Tracked in issue #32 — do not leave it.
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
        // 300ms sits between Google's "good" (200) and "needs
        // improvement" (600) boundaries — strict but achievable on
        // throttled shared CI runners; the site ships ~26KB of JS.
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Google-owned scripts are blocked during collection above, so this
        // is a budget for JavaScript shipped by this repository.
        //
        // 61440 was a RAW-byte budget (the old server sent no encoding).
        // Transfer size is now compressed, so the same number would be ~3×
        // looser in real terms. Re-tightened to 24576 (24KB) against measured
        // compressed transfer — see issue #32 for the before/after table.
        "resource-summary:script:size": ["error", { maxNumericValue: 24576 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
