import { defineConfig, devices } from "@playwright/test";

/**
 * Browser suite for the GLOBAL build (dist-global/ — the /en /gb-en /fr /be-en
 * /be-fr trees), served by `astro preview` on 4322.
 *
 * Why a second config rather than another project in playwright.config.ts:
 * `webServer` entries all start on every run, so a global preview declared
 * there would fail the AU CI leg, which never builds dist-global. Separate
 * config = each CI matrix leg starts only the server it built.
 *
 * This exists because the international pages had NO browser coverage at all:
 * e2e, axe and Lighthouse ran on the AU leg only, which is exactly how a site
 * with no mobile navigation, a picker menu hanging off-screen and a consent
 * banner linking to a 404 reached production.
 *
 * Run: BUILD_TARGET=global npm run test:intl   (needs npm run build:global)
 */
export default defineConfig({
  testDir: "./tests/intl",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4322",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview:global -- --host 127.0.0.1",
    // The global build serves its locales at the root; the bare origin has no
    // index, so probe a real locale home.
    url: "http://127.0.0.1:4322/en/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    // `testIgnore` on these three is load-bearing, not tidiness. Without it
    // EVERY spec in tests/intl/ runs once per project, so the a11y spec — the
    // most expensive one, since each test is a full axe scan — would run 3×
    // for no added coverage. axe results do not vary by device emulation; the
    // theme is what varies, and the spec loops that itself.
    { name: "intl-desktop", testIgnore: /a11y\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    // Real device emulation — touch, DPR and mobile UA, not just a narrow
    // viewport. Touch-vs-hover branches only behave correctly under this.
    { name: "intl-mobile", testIgnore: /a11y\.spec\.ts/, use: { ...devices["Pixel 7"] } },
    { name: "intl-mobile-safari", testIgnore: /a11y\.spec\.ts/, use: { ...devices["iPhone 14"] } },
    // Mirrors the `a11y` project in playwright.config.ts: one browser, both
    // themes, driven by the spec.
    { name: "intl-a11y", testMatch: /a11y\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
  ],
});
