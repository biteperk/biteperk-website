import { test, expect } from "@playwright/test";
import { routes } from "../helpers/routes";

/**
 * Every route (generated from cities.ts + blog collection, same source as
 * scripts/check-routes.mjs) renders with an <h1>/<main> and produces zero
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
    // The 404 page is (correctly) served with a 404 status.
    expect(res!.status(), `HTTP status for ${route}`).toBe(route === "/404.html" ? 404 : 200);

    // The page actually rendered chrome + content.
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();

    expect(errors, `console/page errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}
