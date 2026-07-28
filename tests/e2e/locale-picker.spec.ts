import { test, expect } from "@playwright/test";
import { p } from "../helpers/routes";
import { locales } from "../../src/data/locales";

/**
 * Region/language picker (LocalePicker.astro + scripts/locale-picker.ts).
 *
 * This component shipped a production nav collision with zero test coverage —
 * these are the regression contracts:
 *   - 6 locales render, the current one marked, all others reachable
 *   - page-aware switching (localeSwitchUrl): shared pages carry across the
 *     switch; AU-only pages fall back to the target locale home
 *   - keyboard semantics layered on the native <details> (Esc, arrows)
 *   - the mobile overlay menu carries its own Region section
 *
 * Runs against the AU build (astro preview serves dist/); the global build's
 * equivalents are asserted by the unit tests (localeSwitchUrl) and the
 * hreflang gate.
 */

test.describe("locale picker (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("6 locales, current marked, opens and closes cleanly", async ({ page }) => {
    await page.goto(p());
    const picker = page.locator("[data-locale-picker]");
    const trigger = picker.locator("[data-locale-picker-trigger]");

    await trigger.click();
    const items = picker.locator("[data-locale-picker-item]");
    // Derived: the picker lists every locale, AU included.
    await expect(items).toHaveCount(locales.length);
    await expect(items.filter({ hasText: "Australia — English" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    // Escape closes and returns focus to the trigger.
    await page.keyboard.press("Escape");
    await expect(picker).not.toHaveAttribute("open", "");
    // Outside click also closes.
    await trigger.click();
    await expect(picker).toHaveAttribute("open", "");
    await page.locator("h1").click();
    await expect(picker).not.toHaveAttribute("open", "");
  });

  test("shared pages carry across the switch; AU-only pages fall back to home", async ({
    page,
  }) => {
    // /contact/ exists in every locale → every alternate carries it.
    await page.goto(p("/contact/"));
    const items = page.locator("[data-locale-picker-item]");
    await expect(items.filter({ hasText: "France — Français" })).toHaveAttribute(
      "href",
      "https://biteperk.com/fr/contact/",
    );
    await expect(items.filter({ hasText: "Belgium — English" })).toHaveAttribute(
      "href",
      "https://biteperk.com/be-en/contact/",
    );

    // Product pages are SHARED as of the intl product tree — every locale emits
    // /products/<slug>/, so the picker carries the visitor to the equivalent
    // product page rather than dumping them on a home page. (This assertion used
    // to expect the fallback, back when products were AU-only.)
    await page.goto(p("/products/voxtable/"));
    await expect(
      page.locator("[data-locale-picker-item]").filter({ hasText: "United Kingdom" }),
    ).toHaveAttribute("href", "https://biteperk.com/gb-en/products/voxtable/");

    // A genuinely AU-only page still falls back to the locale home — cities are
    // an Australian concept and exist in no global tree.
    await page.goto(p("/sydney/"));
    await expect(
      page.locator("[data-locale-picker-item]").filter({ hasText: "United Kingdom" }),
    ).toHaveAttribute("href", "https://biteperk.com/gb-en/");
  });

  test("arrow keys open the menu and rove through items", async ({ page }) => {
    await page.goto(p());
    const trigger = page.locator("[data-locale-picker-trigger]");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const items = page.locator("[data-locale-picker-item]");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(items.last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});

test.describe("locale picker (mobile overlay)", () => {
  test.use({ viewport: { width: 390, height: 844 }, contextOptions: { reducedMotion: "reduce" } });

  test("the overlay menu carries a Region section with all 6 locales", async ({ page }) => {
    await page.goto(p());
    await page.locator("[data-mobile-menu-trigger]").click();
    const regions = page.locator(".mm-region");
    // Derived — see above.
    await expect(regions).toHaveCount(locales.length);
    await expect(regions.filter({ hasText: "Australia — English" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(regions.filter({ hasText: "Belgique — Français" })).toBeVisible();
  });
});
