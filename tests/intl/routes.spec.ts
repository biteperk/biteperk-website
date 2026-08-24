import { test, expect } from "@playwright/test";
import { routes } from "../helpers/routes";

/**
 * Every page of the global build, at the two widths that matter most, with a
 * horizontal-overflow assertion.
 *
 * The overflow check is the cheap net for a whole class of device bugs: a
 * too-wide element, an unclamped dropdown, an image without a max-width. It
 * costs one evaluate() per route and catches things no visual review reliably
 * does. `routes` derives from locales.ts (BUILD_TARGET=global), so new markets
 * and new pages are covered the day they ship.
 */

const WIDTHS = [
  { label: "phone", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
];

test.beforeEach(async ({ page }) => {
  // The generic route sweep gates console errors produced by Biteperk code.
  // Google's cross-origin reCAPTCHA iframe calls the Storage Access API and
  // headless Chromium reports its expected denial as console.error, even
  // though the widget still works. Stub only the vendor loader here to keep
  // that third-party diagnostic from masking first-party failures. The
  // dedicated contact spec verifies the widget contract and submitted token.
  await page.route("https://www.google.com/recaptcha/api.js**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
});

for (const route of routes) {
  test(`renders clean: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (route === "/404.html" && m.text().includes("status of 404")) return;
      if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res, `no response for ${route}`).toBeTruthy();
    if (route === "/404.html") {
      expect([200, 404]).toContain(res!.status());
    } else {
      expect(res!.status(), `HTTP status for ${route}`).toBe(200);
      await expect(page.locator("main, article").first()).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
    }
    expect(errors, `console errors on ${route}`).toEqual([]);
  });

  for (const { label, width, height } of WIDTHS) {
    test(`no horizontal overflow @${label}: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(route, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${route} scrolls sideways at ${width}px`).toBeLessThanOrEqual(0);
    });
  }
}
