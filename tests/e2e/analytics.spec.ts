import { test, expect } from "../helpers/fixtures";
import { p, AU_BASE } from "../helpers/routes";
import {
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
  ANALYTICS_HOSTS,
} from "../../src/data/consent";

/**
 * Self-hosted Umami tracker (see src/layouts/Base.astro). Assertions derive
 * from src/data/consent.ts so test and config cannot drift. The real tracker
 * is a no-op on 127.0.0.1 (data-domains), so we stub its script and drive the
 * DOM/localStorage directly.
 *
 * data-domains is the production host, NOT localhost, on purpose — that is
 * exactly what keeps Playwright and localhost from sending real pageviews.
 */
const tag = () => `head script[src="${UMAMI_SCRIPT_URL}"]`;

test.beforeEach(async ({ page }) => {
  // Deterministic + offline: never hit Railway from CI.
  await page.route(UMAMI_SCRIPT_URL, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
});

test.describe("umami analytics", () => {
  test("emits exactly one correctly-configured tracker tag in the head", async ({ page }) => {
    await page.goto(p("/"));
    const el = page.locator(tag());
    await expect(el).toHaveCount(1);
    await expect(el).toHaveAttribute("data-website-id", UMAMI_WEBSITE_ID);
    await expect(el).toHaveAttribute("data-domains", ANALYTICS_HOSTS.join(","));
    // AU tree → tag "au-en"; the domains constant excludes localhost.
    await expect(el).toHaveAttribute("data-tag", AU_BASE.slice(1));
    await expect(el).toHaveAttribute("defer", "");
  });

  test("stays a single tag across a client-side (View Transitions) navigation", async ({ page }) => {
    await page.goto(p("/"));
    await expect(page.locator(tag())).toHaveCount(1);
    // Soft-navigate via an in-page link (ClientRouter), then re-check.
    await page.goto(p("/contact/"));
    await expect(page.locator(tag())).toHaveCount(1);
    await expect(page.locator(tag())).toHaveAttribute("data-tag", AU_BASE.slice(1));
  });

  test("rejecting Analytics sets Umami's kill switch", async ({ page }) => {
    await page.goto(p("/?cookie-preview=1"));
    await page.locator("[data-consent-reject]").click();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("umami.disabled")))
      .toBe("1");
  });

  test("a stored opt-out is applied pre-paint (before the tracker runs)", async ({ page }) => {
    // Returning visitor who had opted out: the inline pre-paint script must
    // disable Umami before its deferred script executes.
    await page.addInitScript(() => {
      localStorage.setItem(
        "bp-consent",
        JSON.stringify({ v: 3, analytics: false, marketing: false, ts: Date.now() }),
      );
    });
    await page.goto(p("/"));
    expect(await page.evaluate(() => localStorage.getItem("umami.disabled"))).toBe("1");
  });

  test("a stored analytics grant leaves the tracker enabled (kill switch cleared)", async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate a stale opt-out flag plus a grant: the sync must clear it.
      localStorage.setItem("umami.disabled", "1");
      localStorage.setItem(
        "bp-consent",
        JSON.stringify({ v: 3, analytics: true, marketing: false, ts: Date.now() }),
      );
    });
    await page.goto(p("/"));
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("umami.disabled")))
      .toBeNull();
  });
});
