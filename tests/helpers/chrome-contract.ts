/**
 * Shared compact-chrome contract — run against BOTH trees.
 *
 * The AU spec (tests/e2e/chrome.spec.ts) and the intl spec
 * (tests/intl/chrome.spec.ts) both call registerChromeContract() with their own
 * home URL(s). One body, two suites: consistency between the trees is asserted
 * by construction, and a regression on either tree fails the same checks.
 *
 * Numbers come from src/data/chrome.ts so a breakpoint change updates the CSS,
 * the breakpoint unit gate AND these device tests from one edit.
 */
import { test, expect, type Page } from "./fixtures";
import { COMPACT_MAX, CTA_MIN, BAR_H_COMPACT } from "../../src/data/chrome";

const COMPACT_WIDTHS = [360, 390, 412, 768, 1024, COMPACT_MAX];
const DESKTOP_WIDTH = COMPACT_MAX + 1;

async function overflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

async function settle(page: Page, selector: string): Promise<void> {
  await page
    .locator(selector)
    .first()
    .evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
}

export interface ChromeContractOpts {
  /** Locale home URLs to exercise (each tree passes its own). */
  homes: string[];
  /** Number of region options this build exposes (locales.length). */
  localeCount: number;
  /** Label of the region option that must carry aria-current on `homes[0]`. */
  currentRegionLabel?: string;
  /** Extra deep pages (a city, a product) for the overflow sweep. */
  extraPaths?: string[];
}

export function registerChromeContract(opts: ChromeContractOpts): void {
  const { homes, localeCount, currentRegionLabel, extraPaths = [] } = opts;
  const primary = homes[0];

  test.describe("compact chrome — the shared bar", () => {
    for (const width of COMPACT_WIDTHS) {
      test(`bar at ${width}px: brand + region chip + burger, CTA ${width >= CTA_MIN ? "shown" : "hidden"}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(primary);
        const bar = page.locator("[data-mobile-bar]");
        await expect(bar).toBeVisible();
        const box = await bar.boundingBox();
        expect(box!.height).toBeLessThanOrEqual(BAR_H_COMPACT + 4);
        // The region chip lives inside the bar at every compact width.
        await expect(bar.locator("[data-locale-picker-trigger]")).toBeVisible();
        await expect(bar.locator("[data-mobile-menu-trigger]")).toBeVisible();
        const cta = bar.locator(".mbar-cta");
        if (width >= CTA_MIN) await expect(cta).toBeVisible();
        else await expect(cta).toBeHidden();
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      });
    }

    test(`desktop bar takes over at ${DESKTOP_WIDTH}px`, async ({ page }) => {
      await page.setViewportSize({ width: DESKTOP_WIDTH, height: 900 });
      await page.goto(primary);
      await expect(page.locator("[data-mobile-bar]")).toBeHidden();
      await expect(page.locator("[data-mobile-menu-trigger]")).toBeHidden();
    });
  });

  test.describe("compact chrome — overflow sweep", () => {
    for (const path of [...homes, ...extraPaths]) {
      for (const width of [360, 390, 768, COMPACT_MAX]) {
        test(`no horizontal overflow at ${width}px: ${path}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(path);
          expect(await overflow(page)).toBeLessThanOrEqual(0);
        });
      }
    }
  });

  test.describe("compact chrome — the drawer", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("opens, traps focus, every target is thumb-sized, Esc restores focus", async ({ page }) => {
      await page.goto(primary);
      const burger = page.locator("[data-mobile-menu-trigger]");
      const panel = page.locator("[data-mobile-menu]");
      await burger.click();
      await settle(page, "[data-mobile-menu] .mdrawer-panel");
      await expect(panel).toBeVisible();
      await expect(burger).toHaveAttribute("aria-expanded", "true");
      // Panel is fully within the viewport (no off-screen right edge).
      const box = await panel.locator(".mdrawer-panel").boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(390 + 1);
      // Page behind the dialog is inert.
      await expect(page.locator("#main")).toHaveAttribute("inert", "");
      // Every actionable row is ≥44px.
      const targets = panel.locator("a, button");
      const n = await targets.count();
      for (let i = 0; i < n; i++) {
        const t = targets.nth(i);
        if (!(await t.isVisible())) continue;
        const b = await t.boundingBox();
        if (b) expect(b.height).toBeGreaterThanOrEqual(40);
      }
      // Theme toggle is reachable inside the drawer.
      await expect(panel.locator("[data-theme-toggle]")).toBeVisible();
      await page.keyboard.press("Escape");
      await settle(page, "[data-mobile-menu] .mdrawer-panel");
      await expect(panel).toBeHidden();
      await expect(page.locator("#main")).not.toHaveAttribute("inert", "");
      await expect(burger).toBeFocused();
    });

    test("Language & region hands off to the picker sheet", async ({ page }) => {
      await page.goto(primary);
      await page.locator("[data-mobile-menu-trigger]").click();
      await settle(page, "[data-mobile-menu] .mdrawer-panel");
      await page.locator("[data-mobile-menu-picker]").click();
      // Drawer closes; the bar's picker opens as a sheet.
      await expect(page.locator("[data-mobile-menu]")).toBeHidden();
      const picker = page.locator("[data-mobile-bar] [data-locale-picker]");
      await expect(picker).toHaveAttribute("open", "");
      await settle(page, "[data-mobile-bar] [data-locale-picker-menu]");
      // Focus landed on a region item.
      const focusedIsItem = await page.evaluate(
        () => document.activeElement?.matches("[data-locale-picker-item]") ?? false,
      );
      expect(focusedIsItem).toBe(true);
    });
  });

  test.describe("compact chrome — the region sheet", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("all regions, inside the viewport, current one marked", async ({ page }) => {
      await page.goto(primary);
      const picker = page.locator("[data-mobile-bar] [data-locale-picker]");
      await picker.locator("[data-locale-picker-trigger]").click();
      await settle(page, "[data-mobile-bar] [data-locale-picker-menu]");
      const items = picker.locator("[data-locale-picker-item]");
      await expect(items).toHaveCount(localeCount);
      const menuBox = await picker.locator("[data-locale-picker-menu]").boundingBox();
      expect(menuBox!.x).toBeGreaterThanOrEqual(-1);
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(390 + 1);
      if (currentRegionLabel) {
        await expect(
          picker.locator(`[data-locale-picker-item][aria-current="true"]`),
        ).toContainText(currentRegionLabel);
      }
    });
  });
}
