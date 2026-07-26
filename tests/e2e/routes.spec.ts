import { test, expect } from "@playwright/test";
import { routes } from "../helpers/routes";

/**
 * Every route (generated from cities.ts + blog collection, same source as
 * scripts/gates/check-routes.mjs) renders with an <h1>/<main> and produces zero
 * console errors or uncaught page errors.
 */

for (const route of routes) {
  test(`renders clean: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      // The 404 page itself loads with a 404 status — the browser logs that
      // as a resource error; it isn't a page defect.
      if (route === "/404.html" && msg.text().includes("status of 404")) return;
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

    const res = await page.goto(route, { waitUntil: "networkidle" });
    expect(res, `no response for ${route}`).toBeTruthy();
    // A direct request for the literal /404.html file is a file hit (200)
    // on astro preview; production serves it as the not-found handler with
    // a 404 status. Either is correct — what matters is that it renders.
    if (route === "/404.html") {
      expect([200, 404], `HTTP status for ${route}`).toContain(res!.status());
    } else {
      expect(res!.status(), `HTTP status for ${route}`).toBe(200);
    }

    // The page actually rendered chrome + content.
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();

    expect(errors, `console/page errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });

  // The cheap net for a whole class of device bugs — a too-wide element, an
  // unclamped dropdown, an image without max-width. One evaluate() per route,
  // at the two widths that matter, catching what visual review misses.
  for (const { label, width, height } of [
    { label: "phone", width: 390, height: 844 },
    { label: "tablet", width: 768, height: 1024 },
  ]) {
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
