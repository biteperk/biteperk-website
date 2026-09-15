import { test, expect } from "../helpers/fixtures";
import { registerChromeContract } from "../helpers/chrome-contract";
import { INTL_NAV } from "../../src/data/intl/nav";
import { localesForTarget, locales } from "../../src/data/locales";
import { intlCitiesForBase } from "../../src/data/intl/cities";
import { PRODUCT_SLUGS } from "../../src/data/product-slugs";

/**
 * Device contracts for the international chrome. Since 15 Sep 2026 the compact
 * bar + drawer are SHARED with the AU tree (src/components/chrome/), so the
 * cross-cutting behaviour lives in helpers/chrome-contract.ts and is asserted
 * identically on both trees. This file adds the intl-only pieces: the desktop
 * link/dropdown bar (≥1181) and the drawer's data-derived section contents.
 */

const LOCALE_HOMES = localesForTarget("global").map((l) => `${l.base}/`);
const DESKTOP = { width: 1280, height: 800 };

// The shared contract, run across every locale home. localeCount is the FULL
// live set (au-en included — the picker offers the Australian site too).
registerChromeContract({
  homes: LOCALE_HOMES,
  localeCount: locales.length,
  currentRegionLabel: "International — English", // /en/ is homes[0]
  extraPaths: ["/gb-en/london/", "/gb-en/products/voxtable/"],
});

test.describe("intl chrome — desktop bar (≥1181)", () => {
  test.use({ viewport: DESKTOP });

  test("shows the link row and hides the burger", async ({ page }) => {
    await page.goto("/gb-en/");
    await expect(page.locator(".intl-links")).toBeVisible();
    await expect(page.locator(".intl-links > a").first()).toBeVisible();
    await expect(page.locator("[data-mobile-bar]")).toBeHidden();
    await expect(page.locator("[data-mobile-menu-trigger]")).toBeHidden();
    // Region chip is in the desktop bar here (a second, hidden one lives in the
    // compact bar) — assert the visible one is the desktop actions' picker.
    await expect(page.locator(".intl-actions [data-locale-picker-trigger]")).toBeVisible();
  });

  test("Products dropdown and Cities dropdown open on gb-en", async ({ page }) => {
    await page.goto("/gb-en/");
    const prod = page.locator("[data-intl-prodnav]");
    await prod.locator("summary").click();
    await expect(prod.locator("[data-intl-prodnav-menu]")).toBeVisible();
    const cities = page.locator("[data-city-nav]");
    await cities.locator("summary").click();
    await expect(cities.locator("[data-city-nav-menu]")).toBeVisible();
  });
});

test.describe("intl chrome — drawer contents", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("gb-en drawer has products (with pills), pages and city chips", async ({ page }) => {
    await page.goto("/gb-en/");
    await page.locator("[data-mobile-menu-trigger]").click();
    const panel = page.locator("[data-mobile-menu]");
    await expect(panel).toBeVisible();

    const products = panel.locator('[data-drawer-section="products"] .mdrawer-link');
    await expect(products).toHaveCount(PRODUCT_SLUGS.length);
    await expect(
      panel.locator('[data-drawer-section="products"] .mdrawer-pill').first(),
    ).toBeVisible();

    const pages = panel.locator('[data-drawer-section="pages"] .mdrawer-link');
    // INTL_NAV minus the Products entry (its own section).
    const expectedPages = INTL_NAV.filter((i) => i.key !== "products").length;
    await expect(pages).toHaveCount(expectedPages);

    const cities = panel.locator('[data-drawer-section="cities"] .mdrawer-link');
    await expect(cities).toHaveCount(intlCitiesForBase("/gb-en").length);
  });

  test("en drawer has no cities section (the x-default tree has none)", async ({ page }) => {
    await page.goto("/en/");
    await page.locator("[data-mobile-menu-trigger]").click();
    await expect(page.locator("[data-mobile-menu]")).toBeVisible();
    await expect(page.locator('[data-drawer-section="cities"]')).toHaveCount(0);
  });
});
