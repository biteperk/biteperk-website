import { defineConfig, devices } from "@playwright/test";

/**
 * E2E + a11y suite. Runs against `astro preview`, which serves dist/ —
 * so `npm run build` must have run first (CI does; locally run it once).
 *
 * Projects:
 *   - chromium / webkit: functional tests (tests/e2e)
 *   - a11y:              axe-core scans (tests/a11y), chromium only
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321",
    // The AU build is served under /au-en, so the bare origin 404s and
    // Playwright would never see the server come up. Probe a real page.
    // Test paths carry the base too — build them with p() from
    // tests/helpers/routes.ts rather than hand-writing "/contact/".
    url: "http://127.0.0.1:4321/au-en/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      testDir: "./tests/e2e",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      testDir: "./tests/e2e",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
    // Real device emulation — touch, DPR, mobile UA. Both projects above are
    // DESKTOP devices, so before these existed no test ever exercised the
    // touch-vs-hover branches (megamenu's canHover(), :hover affordances) the
    // way a phone does; "mobile" specs only narrowed the viewport.
    // Scoped to mobile.spec.ts: the desktop specs deliberately drive the
    // mega-menu and the 1280px nav, neither of which exists on a phone.
    {
      name: "mobile-chrome",
      testDir: "./tests/e2e",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      testDir: "./tests/e2e",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["iPhone 14"] },
    },
    // Gecko has its own layout/flexbox rounding — the third major engine, and
    // the one no test covered. Routes only: it's a rendering safety net, not a
    // third copy of the interaction suites.
    {
      name: "firefox",
      testDir: "./tests/e2e",
      testMatch: /routes\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "a11y",
      testDir: "./tests/a11y",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
