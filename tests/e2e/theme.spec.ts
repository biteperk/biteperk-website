import { test, expect, type Page } from "@playwright/test";

/**
 * Theme toggle: persistence across reload, no FOUC (data-theme is set by
 * the inline pre-paint script and never flips after load), and re-assert
 * on client-side navigation (astro:after-swap).
 *
 * Storage contract (Base.astro inline script + src/scripts/theme.ts):
 *   localStorage["bp-theme"] = "light" | "dark", absent = follow system.
 */

const KEY = "bp-theme";

declare global {
  interface Window {
    __themeLog: (string | null)[];
  }
}

/**
 * Record the value of data-theme on every animation frame, starting with
 * the frame right before first paint — any FOUC (missing or flipped theme
 * at paint time) shows up as a second distinct value in the log.
 */
async function instrumentThemeLog(page: Page, storedTheme?: string) {
  await page.addInitScript(
    ({ key, stored }) => {
      if (stored) localStorage.setItem(key, stored);
      window.__themeLog = [];
      const rec = () => {
        const el = document.documentElement;
        if (el) window.__themeLog.push(el.dataset.theme ?? null);
        requestAnimationFrame(rec);
      };
      requestAnimationFrame(rec);
    },
    { key: KEY, stored: storedTheme }
  );
}

test.describe("theme", () => {
  test("no FOUC: stored theme is applied before first paint and never flips", async ({ page }) => {
    for (const stored of ["light", "dark"] as const) {
      await instrumentThemeLog(page, stored);
      await page.goto("/", { waitUntil: "networkidle" });
      const log = await page.evaluate(() => window.__themeLog);
      expect(log.length, "pre-paint script should set data-theme").toBeGreaterThan(0);
      // First value observed (set during <head> parse) is already correct,
      // and it never changes afterwards — i.e. no visible theme flip.
      expect(new Set(log)).toEqual(new Set([stored]));
      await expect(page.locator("html")).toHaveAttribute("data-theme", stored);
    }
  });

  test("system default applies when nothing is stored", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("toggle switches theme and persists across reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    const toggle = page.locator("[data-theme-toggle]:visible").first();
    await expect(toggle).toBeVisible(); // un-hidden by JS
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("light");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");

    // Toggle back.
    await page.locator("[data-theme-toggle]:visible").first().click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("theme survives client-side navigation (astro:after-swap re-assert)", async ({ page }) => {
    await instrumentThemeLog(page, "light");
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    // Client-side nav via the View Transitions router. Use a link that's
    // visible in the desktop bar (Contact is mobile-menu-only now).
    await page.locator('nav a[href="/platform/"]').first().click();
    await page.waitForURL("**/platform/");
    await expect(html).toHaveAttribute("data-theme", "light");

    // The swap must never have shown any other theme.
    const log = await page.evaluate(() => window.__themeLog);
    expect(new Set(log)).toEqual(new Set(["light"]));
  });
});
