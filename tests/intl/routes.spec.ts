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
