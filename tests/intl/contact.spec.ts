import { expect, test } from "@playwright/test";
import { googleAdsGlobalDemoContactConversionId } from "../../src/data/consent";

/**
 * The Zoho CRM + conversion-tracking flow used to be /en-only; it now applies
 * to every international locale (src/pages/[...intl].astro). Covering /en plus
 * one English-language market (gb-en) and both French trees (fr, be-fr)
 * catches a regression in the shared markup that a single-locale test would
 * miss — e.g. a locale-specific copy override that silently drops the product
 * field or the crmForm hidden input.
 *
 * No CAPTCHA, by design (3 Sep 2026): Google reCAPTCHA loaded before any
 * consent on every EU/UK contact page and sent visitor IPs to Google. The
 * negative assertion below — zero requests to any Google reCAPTCHA host — is
 * what keeps it from quietly coming back; the privacy and cookie copy on all
 * five trees now says "no CAPTCHA", so a reintroduction would be a false
 * statement on a legal page, not just a product change.
 */
const LOCALES = [
  { base: "/en", venue: "QA Bistro", success: /Thanks/ },
  { base: "/gb-en", venue: "QA Bistro London", success: /Thanks/ },
  { base: "/fr", venue: "QA Bistro Paris", success: /Merci/ },
  { base: "/be-fr", venue: "QA Bistro Bruxelles", success: /Merci/ },
];

const RECAPTCHA_HOST = /(^|\.)(google\.com|gstatic\.com|recaptcha\.net)\/recaptcha\//;

for (const { base, venue, success } of LOCALES) {
  test(`${base} contact submits every field, loads no CAPTCHA, and reports its consent-aware Google Ads conversion`, async ({
    page,
  }) => {
    let submittedBody: Record<string, string> = {};
    const recaptchaRequests: string[] = [];

    await page.addInitScript(() => {
      localStorage.setItem(
        "bp-consent",
        JSON.stringify({ v: 3, analytics: false, marketing: false, ts: Date.now() }),
      );
      const w = window as unknown as {
        __gtagCalls: unknown[][];
        gtag: (...args: unknown[]) => void;
      };
      w.__gtagCalls = [];
      w.gtag = (...args: unknown[]) => w.__gtagCalls.push(args);
    });

    page.on("request", (request) => {
      if (RECAPTCHA_HOST.test(request.url())) recaptchaRequests.push(request.url());
    });

    await page.route("**/api/contact", async (route) => {
      submittedBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto(`${base}/contact/`);
    const form = page.locator(".intl-form");
    await expect(form).toHaveAttribute("data-astro-reload", "");
    await expect(page.locator(".g-recaptcha")).toHaveCount(0);

    // No product pre-selected: a visitor who never touches the dropdown
    // must not be silently recorded as a VoxTable enquiry.
    await expect(page.locator("#if-product")).toHaveValue("");

    await page.fill("#if-name", "Test Diner");
    await page.fill("#if-email", "diner@example.com");
    await page.fill("#if-venue", venue);
    await page.selectOption("#if-product", "voxorder");
    await page.fill("#if-message", "Automated QA message — please ignore.");

    await form.locator('button[type="submit"]').click();
    const done = page.locator(".intl-form-success");
    await expect(done).toBeVisible();
    // In the tree's language (French trees got "Thanks — we'll be in touch."
    // until 13 Sep 2026), announced through the live region that stays in the
    // form, and holding focus since the submit button is gone.
    await expect(done.locator("h2")).toHaveText(success);
    await expect(page.locator(".intl-form-status")).toBeVisible();
    await expect(page.locator(".intl-form-status")).toHaveText(success.source === "Merci" ? /Réponse/ : /reply/);
    expect(await page.evaluate(() => document.activeElement?.className)).toBe("intl-form-success");
    await expect(page).toHaveURL(new RegExp(`${base}/contact/$`));

    expect(submittedBody).toMatchObject({
      name: "Test Diner",
      email: "diner@example.com",
      venue,
      message: "Automated QA message — please ignore.",
      product: "voxorder",
      crmForm: "zoho-global",
      locale: base,
      _gotcha: "",
    });
    expect(submittedBody).not.toHaveProperty("g-recaptcha-response");
    expect(recaptchaRequests).toEqual([]);

    const conversions = await page.evaluate(() => {
      const calls = (window as unknown as { __gtagCalls: unknown[][] }).__gtagCalls;
      return calls.filter((call) => call[0] === "event" && call[1] === "conversion");
    });
    // Offline-only Ads (PR #57): no web pixel while the conversion id is null.
    // The pixel contract is kept for the day it is re-armed, derived from
    // consent.ts so test and config cannot drift. transaction_id is the lead's
    // random dedupe key (leadRef) — asserted by shape, not value: it lets
    // offline conversion uploads dedupe the pixel.
    if (googleAdsGlobalDemoContactConversionId === null) {
      expect(conversions).toEqual([]);
      return;
    }
    expect(conversions).toEqual([
      [
        "event",
        "conversion",
        {
          send_to: googleAdsGlobalDemoContactConversionId,
          transaction_id: expect.stringMatching(/^[\w-]{8,64}$/),
        },
      ],
    ]);
  });
}
