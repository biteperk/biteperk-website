import { test, expect, devices } from "@playwright/test";

/**
 * Keyboard flows for the Products mega-menu (desktop) and the mobile
 * menu (focus trap, Esc, backdrop). Contracts live in
 * src/scripts/megamenu.ts and src/scripts/mobile-menu.ts.
 */

test.describe("mega-menu (desktop keyboard)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("Enter opens + focuses first item, Esc closes + returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.locator("[data-megamenu-trigger]");
    const panel = page.locator("[data-megamenu-panel]");

    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    // Keyboard open focuses the first menu item.
    await expect(panel.locator('a[role="menuitem"]').first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("arrow keys cycle menu items, Home/End jump", async ({ page }) => {
    await page.goto("/");
    const trigger = page.locator("[data-megamenu-trigger]");
    const panel = page.locator("[data-megamenu-panel]");
    const items = panel.locator('a[role="menuitem"]');

    await trigger.focus();
    await page.keyboard.press("ArrowDown"); // open + focus first
    await expect(items.first()).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(items.first()).toBeFocused();
    // Wrap upwards from first → last.
    await page.keyboard.press("ArrowUp");
    await expect(items.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(items.last()).toBeFocused();
  });

  test("mega-menu is closed after client-side navigation", async ({ page }) => {
    await page.goto("/");
    const trigger = page.locator("[data-megamenu-trigger]");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const firstItem = page.locator('[data-megamenu-panel] a[role="menuitem"]').first();
    await expect(firstItem).toBeFocused();
    await page.keyboard.press("Enter"); // navigate to the product page
    await page.waitForURL("**/products/**");
    await expect(page.locator("[data-megamenu-trigger]")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("[data-megamenu-panel]")).toBeHidden();
  });
});

test.describe("mobile menu", () => {
  // Reduced motion: we're testing menu *behaviour*; the site's animations are
  // opt-in behind prefers-reduced-motion, and disabling them keeps elements
  // stable for Playwright's actionability checks.
  test.use({ viewport: devices["iPhone 13"].viewport, reducedMotion: "reduce" });

  test("opens from burger, traps focus, Esc closes and restores focus", async ({ page, browserName }) => {
    await page.goto("/");
    const burger = page.locator("[data-mobile-menu-trigger]");
    const panel = page.locator("[data-mobile-menu]");

    await expect(burger).toBeVisible();
    await burger.click();
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    // Body scroll is locked while open.
    await expect(page.locator("body")).toHaveClass(/no-scroll/);
    // Focus moved into the panel.
    expect(
      await page.evaluate(() =>
        document.querySelector("[data-mobile-menu]")!.contains(document.activeElement)
      )
    ).toBe(true);

    // Tab around well past the focusable count — focus must stay trapped.
    // (WebKit skips links on plain Tab; Alt+Tab matches user tab-navigation.)
    const tabKey = browserName === "webkit" ? "Alt+Tab" : "Tab";
    for (let i = 0; i < 25; i++) await page.keyboard.press(tabKey);
    expect(
      await page.evaluate(() =>
        document.querySelector("[data-mobile-menu]")!.contains(document.activeElement)
      )
    ).toBe(true);

    await page.keyboard.press("Escape");
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await expect(page.locator("body")).not.toHaveClass(/no-scroll/);
    await expect(burger).toBeFocused();
  });

  test("close button and link clicks close the menu", async ({ page }) => {
    await page.goto("/");
    const burger = page.locator("[data-mobile-menu-trigger]");
    const panel = page.locator("[data-mobile-menu]");

    await burger.click();
    await expect(panel).toBeVisible();
    await page.locator("[data-mobile-menu-close]").click();
    await expect(panel).toBeHidden();

    // Re-open, then navigate via a link — menu must close.
    await burger.click();
    await expect(panel).toBeVisible();
    await panel.locator('a[href="/contact/"]').first().click();
    await page.waitForURL("**/contact/");
    await expect(page.locator("[data-mobile-menu]")).toBeHidden();
  });
});
