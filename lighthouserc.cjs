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
 * WHAT COMPRESSION DID AND DID NOT FIX (corrected against the first CI run
 * of this change — the local numbers above led me to the wrong conclusion).
 * On CI it roughly HALVED FCP: the AU home went ~2600 → 1430ms, and the
 * document now transfers at 40,639 bytes instead of 261KB. It barely moved
 * LCP: the AU home measured 2511 on that run's first pass and 2535 on the
 * uploaded median, against 2519 before. It passed only on the retry step.
 *
 * The reason is in the phase breakdown, and it is worth knowing before
 * anyone optimises bytes again. AU home, compressed, on the runner:
 *
 *     TTFB 468 · Load Delay 0 · Load Time 215 · Render Delay 1852  = 2535
 *
 * The hero AVIF is fully downloaded 65ms in. Then nothing paints for another
 * 1.85 SECONDS. TBT is 0, so this is not blocking script — it is layout and
 * paint of a large DOM against a large stylesheet on a throttled 2-core
 * runner (observed main thread: Style & Layout 240ms, Parse HTML & CSS 72ms,
 * Other 518ms, before Lantern's 4× CPU multiplier). /fr/ is the same shape:
 * FCP 1394, Render Delay 1776, LCP 2234 — with a TEXT LCP and no image at
 * all. Render delay of ~1800ms is the floor on every page here.
 *
 * So brotli fixed the transfer, and transfer was never what LCP was waiting
 * for. Compressing further, or shaving image bytes, cannot move this number.
 * Reducing the WORK can: less DOM and less CSS per page (the AU home ships
 * 261KB of HTML, 133KB of it inline CSS). That is issue #32, and it is a real
 * user-facing win too — Lighthouse mobile emulates a moto g power, which is
 * what a lot of the guests calling these venues are holding.
 *
 * `serve` is a pinned devDependency (NOT `npx serve`) so CI installs a known
 * version with `npm ci` instead of resolving one over the network mid-run.
 *
 * Note: script:size asserts on TRANSFER size, which is now compressed — so
 * that budget got looser in real terms when this changed. See the note on it.
 */
/**
 * Split the URL list across parallel CI jobs.
 *
 * `LHCI_SHARD` is "n/total" (e.g. "1/2"), set per matrix job by web.yml. Unset
 * — which is every local run — returns the whole list, so `npm run lhci` on a
 * laptop still measures all 12 URLs and behaves exactly as it did before.
 *
 * Contiguous slices, not round-robin: the list is ordered by template and
 * grouping neighbours keeps a shard's failures legible ("both product pages"
 * rather than "two unrelated URLs").
 *
 * Malformed input throws rather than silently measuring the wrong subset — a
 * shard that quietly asserts nothing is worse than a red build.
 */
function shardUrls(all) {
  const raw = process.env.LHCI_SHARD;
  if (!raw) return all;
  const m = /^(\d+)\/(\d+)$/.exec(raw.trim());
  if (!m) {
    console.error(`lighthouserc: LHCI_SHARD must look like "1/2", got ${JSON.stringify(raw)}.`);
    process.exit(1);
  }
  const index = Number(m[1]);
  const total = Number(m[2]);
  if (total < 1 || index < 1 || index > total) {
    console.error(`lighthouserc: LHCI_SHARD "${raw}" is out of range (need 1 <= n <= total, total >= 1).`);
    process.exit(1);
  }
  const size = Math.ceil(all.length / total);
  const slice = all.slice((index - 1) * size, index * size);
  if (slice.length === 0) {
    console.error(
      `lighthouserc: LHCI_SHARD "${raw}" selects no URLs from ${all.length} — ` +
        `more shards than URLs asserts nothing at all.`,
    );
    process.exit(1);
  }
  console.log(`lighthouserc: shard ${raw} → ${slice.length} of ${all.length} URLs`);
  return slice;
}

/** Every URL the budget covers. Sharded by shardUrls() above. */
const ALL_URLS = [
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
  // A French city page — the template is now built out to ten French cities.
  // Lyon carries the deprioritized hero, the lazy story shot and a nine-card
  // cross-link grid: the heaviest image page on the FR tree, so it anchors the
  // perf contract for the whole /fr city build-out. One representative city is
  // enough — adding all ten would balloon the Lighthouse run for no new signal.
  "http://localhost:4173/fr/lyon/",
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
];

module.exports = {
  ci: {
    collect: {
      // Production parity: brotli/gzip, clean URLs, directory indexes.
      startServerCommand: "npx serve dist-site --listen 4173 --no-clipboard",
      startServerReadyPattern: "Accepting connections",
      // Representative page of each template. The port is explicit now that
      // we start our own server (startServerCommand), not LHCI's.
      url: shardUrls(ALL_URLS),
      // Median of 5: single runs on shared 2-core CI runners produce coin-flip
      // TBT/perf numbers (observed 619ms TBT with 26KB of JS), and 5 is the
      // more accurate measurement.
      //
      // It went 5 → 3 on 6 Sep 2026 and back to 5 the same day, which is worth
      // explaining rather than looking like churn. 5 was reverted because a
      // 12-URL pass took ~12.5 min INSIDE a serial job that had already spent
      // 10 minutes in Playwright, and the retry step doubled it past the
      // timeout. It is back because the job is now parallel AND sharded: each
      // matrix job measures 6 URLs, ~7.6 min, with its own 25-minute budget.
      //
      // The number that made 5 look expensive — the AU home at 2514–2537ms —
      // was never variance. It is deterministic and CPU-bound (issue #32), and
      // sits under the 2600 budget either way. More runs make it read more
      // consistently, not more favourably.
      numberOfRuns: 5,
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
        // 2600ms, RAISED FROM 2500 on 6 Sep 2026 by Sam's decision, with the
        // diagnosis this file's own rule demands done first (issue #32).
        //
        // 2500 was Google's "good" LCP threshold and the right target. The AU
        // home measures 2511–2537 on the runner and will not come down for
        // any of the levers that were actually tried — all measured, 5 runs
        // each, all negative:
        //
        //   brotli/compression   FCP ~2600→1430, LCP unchanged
        //   −27KB of chrome CSS  +1ms
        //   hero AVIF → WebP     +74ms (worse; AVIF is helping)
        //   content-visibility   already on 12 sections
        //   dead CSS             <1KB, nothing to delete
        //   hero image bytes     irrelevant — downloaded at 13ms
        //
        // FCP is 1578–1580 and Render Delay 1877–1952 in EVERY variant. The
        // number does not respond to bytes, codec or stylesheet size; what is
        // left is CPU-bound layout of the whole page (observed main thread:
        // Other 518ms, Style & Layout 240ms, before Lantern's 4× multiplier).
        // That is a design change to the above-fold hero, not an optimisation
        // pass, and it was not worth blocking every PR in the repo on.
        //
        // KNOW WHAT THIS COSTS. It buys unblocked CI, not a faster site —
        // real users see exactly what they saw before. Worst-median LCP per
        // URL on the run this was set from (34012014050), and the slack each
        // page gains that it did not ask for:
        //
        //   /au-en/                    2537   -37 →  +63   (the only failure)
        //   /au-en/blog/what-missed…   2348   152 →  252
        //   /au-en/contact/            2329   171 →  271
        //   /au-en/sydney/             2297   203 →  303
        //   /gb-en/london/             2282   218 →  318
        //   /gb-en/ /fr/ /be-*/ /en/   2227–2258  ~250 → ~350
        //   /au-en/products/voxtable/  2081   419 →  519
        //   /fr/products/voxstay/      2062   438 →  538
        //
        // Eleven healthy pages just got 100ms of slack to accommodate one sick
        // one: a change that quietly adds ~100ms to /gb-en/ now passes where
        // it used to fail. And 2600 is adequate, not generous — the AU home's
        // observed spread is 26ms, so 63ms of headroom is ~2.4× it. It remains
        // the tightest page here and another runner drift puts it back.
        //
        // The rule below still stands and is not softened by this: the fix is
        // to make /au-en/ cheaper to lay out and then bring this back to 2500.
        // Do not raise it again to make a number pass.
        "largest-contentful-paint": ["error", { maxNumericValue: 2600 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.02 }],
        // 300ms sits between Google's "good" (200) and "needs
        // improvement" (600) boundaries — strict but achievable on
        // throttled shared CI runners; the site ships ~26KB of JS.
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Google-owned scripts are blocked during collection above, so this
        // is a budget for JavaScript shipped by this repository.
        //
        // 61440 was a RAW-byte budget (the old server sent no encoding).
        // Transfer size is now compressed, so the same number would have gone
        // ~3× looser overnight. Re-tightened to 24576 (24KB) against a
        // measured 16950 worst case. This is the one budget the compression
        // change actually altered the meaning of — see issue #32.
        "resource-summary:script:size": ["error", { maxNumericValue: 24576 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
