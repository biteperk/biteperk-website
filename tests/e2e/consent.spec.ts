import { test, expect } from "@playwright/test";
import { p } from "../helpers/routes";

/**
 * Cookie consent — banner + settings modal.
 *
 * The banner is dormant in production (no tracker armed yet), so these
 * tests force it visible with ?cookie-preview=1. Contract lives in
 * src/scripts/consent.ts + src/components/ConsentBanner.astro.
 *
 * Strict opt-in: nothing is asserted about tracking network calls here
 * (Plausible/LinkedIn are both un-armed); the behavioural contract is
 * storage + UI. A separate manual devtools check covers "no beacon
 * before consent" once a tracker is armed locally.
 */

const PREVIEW = p("/?cookie-preview=1");

test.describe("cookie consent", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

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
