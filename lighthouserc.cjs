/**
 * Lighthouse CI budgets (Phase 7 gate). Runs against dist-site/ via LHCI's
 * static server, mobile emulation (Lighthouse default).
 *
 * MUST be dist-site/, not dist/: the AU build carries Astro base /au-en, so
 * its pages sit flat in dist/ while referencing /au-en/_astro/**. Served at
 * the root, every stylesheet, font and script 404s and the run measures an
 * unstyled page. dist-site/ is the merged tree the biteperk.com host actually
 * serves (au-en/** + en/** + fr/**), so the URLs below resolve exactly as in
 * production. Build it with `npm run build:site`.
 *
 * Budgets: perf ≥95 (mobile), LCP ≤2.5s, CLS ≤0.02, first-party JS ≤60KB.
 * Note: script:size is transfer size; LHCI's static server doesn't gzip,
 * so this asserts on raw bytes — stricter than the 60KB-gz budget.
 */
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist-site",
      // Representative page of each template; port is injected by LHCI.
      url: [
        "http://localhost/au-en/",
        "http://localhost/au-en/products/voxtable/",
        "http://localhost/au-en/sydney/",
        "http://localhost/au-en/blog/what-missed-calls-cost-your-restaurant/",
        "http://localhost/au-en/contact/",
        // The market trees are in the same merged build and must stay inside
        // the perf contract — they carry hero imagery and a market band, and
        // their visitors are the furthest from the Sydney origin.
        "http://localhost/gb-en/",
        // The city-page template (Jul 2026): photographic split hero
        // (deprioritized cityscape beside the headline — text stays the LCP
        // element), one lazy story image, the district chips and the
        // seven-card cross-link grid. London stands in for all eight cities.
        "http://localhost/gb-en/london/",
        "http://localhost/fr/",
        // /en is the x-default and had the largest perf delta of any tree when
        // heroes landed (0 images → a priority-loaded LCP hero), so it is the
        // one most worth measuring. /be-en covers the second French/Flemish
        // market and the shared Belgian hero.
        "http://localhost/en/",
        "http://localhost/be-en/",
      ],
      // Median of 3: single runs on shared 2-core CI runners produce
      // coin-flip TBT/perf numbers (observed 619ms TBT with 26KB of JS).
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
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
        // 300ms sits between Google's "good" (200) and "needs
        // improvement" (600) boundaries — strict but achievable on
        // throttled shared CI runners; the site ships ~26KB of JS.
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Google-owned scripts are blocked during collection above, so this
        // remains a strict budget for JavaScript shipped by this repository.
        "resource-summary:script:size": ["error", { maxNumericValue: 61440 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
