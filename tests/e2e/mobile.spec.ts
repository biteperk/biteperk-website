import { test, expect } from "@playwright/test";
import { p } from "../helpers/routes";

/**
 * AU site on REAL emulated devices (Pixel 7 / iPhone 14 projects).
 *
 * Distinct from the viewport-narrowing checks elsewhere: these projects carry
 * touch support, device pixel ratio and a mobile user-agent, so touch-vs-hover
 * branches — `canHover()` in megamenu.ts, `:hover` affordances, tap targets —
 * behave the way a phone actually behaves. A narrow desktop viewport does not
 * exercise any of that.
 */

test("overlay menu opens by tap and carries the primary actions", async ({ page }) => {
  await page.goto(p());
  await page.locator("[data-mobile-menu-trigger]").tap();
  const panel = page.locator("[data-mobile-menu]");
  await expect(panel).toBeVisible();
  await expect(panel.locator('a[data-cta="book-demo"]')).toBeVisible();
  await expect(panel.locator('a[data-cta="call-menu"]')).toBeVisible();
  // Region switching must be reachable on a phone (the nav cluster is hidden).
  await expect(panel.locator(".mm-region")).toHaveCount(6);
});

test("every overlay target is thumb-sized", async ({ page }) => {
  await page.goto(p());
  await page.locator("[data-mobile-menu-trigger]").tap();
  const targets = page.locator("[data-mobile-menu] a, [data-mobile-menu] button");
  for (const t of await targets.all()) {
    if (!(await t.isVisible())) continue;
    const box = await t.boundingBox();
    const label = (await t.innerText()).slice(0, 30) || (await t.getAttribute("aria-label")) || "?";
    expect(box!.height, `target: ${label}`).toBeGreaterThanOrEqual(40);
  }
});

test("contact form is usable: 16px inputs (no iOS zoom) and real targets", async ({ page }) => {
  await page.goto(p("/contact/"));
  // The honeypot is excluded deliberately: it is aria-hidden, tabindex="-1"
  // and positioned off-screen, so no human ever focuses it. Styling it like a
  // real field would only make it easier for bots to spot.
  const inputs = page.locator(
    "form :not([aria-hidden='true']) > label > input[type='text']:not([tabindex='-1'])," +
      "form input[type='email'], form textarea",
  );
  for (const input of await inputs.all()) {
    if (!(await input.isVisible())) continue;
    const size = await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // Safari zooms the page when a focused field is under 16px.
    expect(size, "input font-size must be ≥16px").toBeGreaterThanOrEqual(16);
    const box = await input.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("the phone number is one tap away", async ({ page }) => {
  await page.goto(p());
  await page.locator("[data-mobile-menu-trigger]").tap();
  const call = page.locator('[data-mobile-menu] a[data-cta="call-menu"]');
  await expect(call).toHaveAttribute("href", /^tel:/);
});
