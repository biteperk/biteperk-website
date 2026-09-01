import { test, expect } from "@playwright/test";
import { p } from "../helpers/routes";

/**
 * Cookie consent — banner + settings modal.
 *
 * The banner is dormant in production (no tracker armed yet), so these
 * tests force it visible with ?cookie-preview=1. Contract lives in
 * src/scripts/consent.ts + src/components/ConsentBanner.astro.
 *
 * Google Ads uses advanced consent mode, while Plausible and LinkedIn remain
 * strict opt-in. These tests cover the denied-before-config command order as
 * well as the storage and UI contract.
 */

const PREVIEW = p("/?cookie-preview=1");

test.describe("cookie consent", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("initializes Google Ads denied before config, then grants after Accept", async ({ page }) => {
    let tagRequests = 0;
    await page.route(/https:\/\/www\.googletagmanager\.com\/gtag\/js.*/, async (route) => {
      tagRequests += 1;
      await route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    });

    await page.goto(PREVIEW);

    const beforeChoice = await page.evaluate(() => {
      const entries = (window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [];
      return {
        calls: entries.map((entry) => Array.from(entry)),
        usesGoogleArgumentsShape: entries.every(
          (entry) => Object.prototype.toString.call(entry) === "[object Arguments]",
        ),
      };
    });
    expect(beforeChoice.usesGoogleArgumentsShape).toBe(true);
    const defaultIndex = beforeChoice.calls.findIndex(
      (call) => call[0] === "consent" && call[1] === "default"
    );
    const configIndex = beforeChoice.calls.findIndex(
      (call) => call[0] === "config" && call[1] === "AW-18397306929"
    );

    expect(tagRequests).toBe(1);
    expect(defaultIndex).toBeGreaterThanOrEqual(0);
    expect(configIndex).toBeGreaterThan(defaultIndex);
    expect(beforeChoice.calls[defaultIndex][2]).toMatchObject({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500,
    });

    await page.locator("[data-consent-accept]").click();
    const granted = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer ?? [])
        .map((entry) => Array.from(entry))
        .filter((call) => call[0] === "consent" && call[1] === "update")
        .at(-1)
    );
    expect(granted?.[2]).toMatchObject({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "denied",
    });
  });

  test("shows once, Accept persists + hides + survives reload/navigation", async ({ page }) => {
    await page.goto(PREVIEW);
    const bar = page.locator("[data-consent-bar]");
    await expect(bar).toBeVisible();

    await page.locator("[data-consent-accept]").click();
    await expect(bar).toBeHidden();

    const stored = await page.evaluate(() => localStorage.getItem("bp-consent"));
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(true);

    // Does not reappear on reload or client-side navigation.
    await page.reload();
    await expect(bar).toBeHidden();
    await page.locator(`nav a[href="${p('/platform/')}"]`).first().click();
    await page.waitForURL("**/platform/");
    await expect(bar).toBeHidden();
  });

  test("Reject writes all-false", async ({ page }) => {
    await page.goto(PREVIEW);
    await page.locator("[data-consent-reject]").click();
    const parsed = JSON.parse(
      (await page.evaluate(() => localStorage.getItem("bp-consent")))!
    );
    expect(parsed.analytics).toBe(false);
    expect(parsed.marketing).toBe(false);
  });

  test("Settings modal: focus-trap, Save persists toggles", async ({ page }) => {
    await page.goto(PREVIEW);
    const trigger = page.locator("[data-consent-settings]");
    // Open via keyboard so focus starts INSIDE the dialog — the real
    // keyboard-user path (WebKit doesn't focus controls on mouse click).
    await trigger.focus();
    await page.keyboard.press("Enter");

    const modal = page.locator("[data-consent-modal]");
    await expect(modal).toBeVisible();

    // Focus trap: 25 Tabs never escapes the dialog.
    for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
    const trapped = await page.evaluate(() =>
      !!document.querySelector("[data-consent-modal]")?.contains(document.activeElement)
    );
    expect(trapped).toBe(true);

    // Turn analytics on, leave marketing off, save.
    await page.locator('[data-consent-toggle="analytics"]').check();
    await expect(page.locator('[data-consent-toggle="marketing"]')).not.toBeChecked();
    await page.locator("[data-consent-save]").click();
    await expect(modal).toBeHidden();
    const parsed = JSON.parse(
      (await page.evaluate(() => localStorage.getItem("bp-consent")))!
    );
    expect(parsed.analytics).toBe(true);
    expect(parsed.marketing).toBe(false);
  });

  test("Esc closes the modal and returns focus to the trigger", async ({ page }) => {
    await page.goto(PREVIEW);
    const trigger = page.locator("[data-consent-settings]");
    // Open via keyboard (the real keyboard-user path) so focus return is
    // deterministic — macOS WebKit doesn't focus buttons on click.
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-consent-modal]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-consent-modal]")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("footer Cookie settings re-opens the modal after a choice", async ({ page }) => {
    await page.goto(PREVIEW);
    await page.locator("[data-consent-accept]").click();
    await expect(page.locator("[data-consent-bar]")).toBeHidden();

    await page.locator("footer [data-cookie-settings]").click();
    await expect(page.locator("[data-consent-modal]")).toBeVisible();
  });
});
