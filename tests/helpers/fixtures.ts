/**
 * Shared Playwright base for every spec (e2e, intl, a11y).
 *
 * The self-hosted Umami tracker is a plain deferred <script src> pointing at
 * Railway (src/layouts/Base.astro). Playwright's default `waitUntil: "load"`
 * waits for that external fetch on EVERY navigation, which makes the whole
 * suite depend on a third-party host and flake when it is slow. This fixture
 * fulfils the tracker request locally with an empty body, so no test ever hits
 * Railway. The tracker is a no-op in tests anyway (data-domains excludes
 * 127.0.0.1); specs that assert analytics behaviour install their own fake
 * `window.umami`.
 *
 * Import `test`/`expect` from here instead of "@playwright/test".
 */
import { test as base } from "@playwright/test";
import { UMAMI_SCRIPT_URL } from "../../src/data/consent";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(UMAMI_SCRIPT_URL, (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
    );
    await use(page);
  },
});

export { expect, devices } from "@playwright/test";
export type { Page, Browser } from "@playwright/test";
