import { test, expect, type Page } from "@playwright/test";
import { INTL_NAV } from "../../src/data/intl/nav";

/**
 * Device contracts for the international chrome (IntlLayout + LocalePicker).
 *
 * Every assertion here corresponds to a defect that was live in production on
 * /gb-en /fr /be-en /be-fr — these pages had never been opened at phone width
 * by a test. Keep them; they are the regression net for the whole market
 * experience, not decoration.
 */

const PHONE = { width: 390, height: 844 };
const TABLET = { width: 768, height: 1024 };

/** Every rendered locale home, so a market can't silently regress alone. */
const LOCALE_HOMES = ["/en/", "/gb-en/", "/fr/", "/be-en/", "/be-fr/"];

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("intl chrome — phone", () => {
  test.use({ viewport: PHONE });

  for (const home of LOCALE_HOMES) {
    test(`navigation is reachable without the footer: ${home}`, async ({ page }) => {
      await page.goto(home);
      // Was `display:none` with no replacement — the whole defect in one line.
      // The count is DERIVED from INTL_NAV, the same list IntlLayout renders
      // from, so adding a nav item can no longer leave this test asserting the
      // old number. It was hardcoded at 4 and had already been stale once (the
      // bar went 3 → 4 when the product tree shipped).
      const links = page.locator(".intl-links a");
      await expect(links).toHaveCount(INTL_NAV.length);
      for (const link of await links.all()) {
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box!.height, "nav pill must be a 44px touch target").toBeGreaterThanOrEqual(44);
        expect(box!.x + box!.width, "nav pill must not overflow").toBeLessThanOrEqual(PHONE.width);
      }
    });
  }

  test("region picker opens fully inside the viewport", async ({ page }) => {
    await page.goto("/gb-en/");
    await page.locator("[data-locale-picker-trigger]").click();
    const menu = page.locator("[data-locale-picker-menu]");
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    // It used to hang ~43px off the right edge on a 390px screen.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(PHONE.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(PHONE.height);
    await expect(page.locator("[data-locale-picker-item]")).toHaveCount(6);
  });

  test("footer links are real touch targets", async ({ page }) => {
    await page.goto("/be-fr/");
    for (const link of await page.locator(".intl-footer-links a").all()) {
      const box = await link.boundingBox();
      expect(box!.height, `footer target: ${await link.innerText()}`).toBeGreaterThanOrEqual(44);
    }
  });

  test("theme toggle is available (parity with the AU chrome)", async ({ page }) => {
    await page.goto("/fr/");
    await expect(page.locator(".intl-actions [data-theme-toggle]")).toBeVisible();
  });
});

test.describe("consent notice", () => {
  test.use({ viewport: PHONE });

  for (const home of LOCALE_HOMES) {
    test(`cookie policy link resolves in-locale: ${home}`, async ({ page }) => {
      await page.goto(home);
      const href = await page
        .locator(".intl-footer-links a")
        .filter({ hasText: /cookie/i })
        .first()
        .getAttribute("href");
      expect(href, "footer must link to this locale's cookie policy").toBe(
        `${home.replace(/\/$/, "")}/legal/cookies/`,
      );
      // …and it must actually be a page, not a 404. This is the assertion that
      // would have caught the banner linking at a policy that existed nowhere.
      const res = await page.goto(href!);
      expect(res!.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("consent can be withdrawn as easily as it is given (GDPR art. 7(3))", async ({ page }) => {
    await page.goto("/gb-en/");
    await expect(page.locator("[data-cookie-settings]").first()).toBeVisible();
  });
});

test.describe("intl chrome — tablet keeps the desktop layout", () => {
  test.use({ viewport: TABLET });

  test("single-row sticky header with the CTA intact", async ({ page }) => {
    await page.goto("/gb-en/");
    const links = page.locator(".intl-links a");
    const tops = await Promise.all(
      (await links.all()).map(async (l) => (await l.boundingBox())!.y),
    );
    expect(Math.max(...tops) - Math.min(...tops), "links share one row").toBeLessThan(2);
    await expect(page.locator(".intl-cta-btn")).toBeVisible();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});
