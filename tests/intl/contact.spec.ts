import { expect, test } from "@playwright/test";

/**
 * The Zoho CRM + reCAPTCHA + conversion-tracking flow used to be /en-only;
 * it now applies to every international locale (src/pages/[...intl].astro).
 * Covering /en plus one English-language market (gb-en) and both French
 * trees (fr, be-fr) catches a regression in the shared markup that a
 * single-locale test would miss — e.g. a locale-specific copy override that
 * silently drops the product field or the crmForm hidden input.
 */
const LOCALES = [
  { base: "/en", venue: "QA Bistro" },
  { base: "/gb-en", venue: "QA Bistro London" },
  { base: "/fr", venue: "QA Bistro Paris" },
  { base: "/be-fr", venue: "QA Bistro Bruxelles" },
];

for (const { base, venue } of LOCALES) {
  test(`${base} contact submits every field and reports its consent-aware Google Ads conversion`, async ({
    page,
  }) => {
    let submittedBody: Record<string, string> = {};

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

    await page.route("**/api/contact", async (route) => {
      submittedBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    // Avoid a third-party dependency in browser tests. The production widget
    // creates this same hidden response field after its challenge succeeds.
    await page.route("https://www.google.com/recaptcha/**", (route) => route.abort());

    await page.goto(`${base}/contact/`);
    const form = page.locator(".intl-form");
    await expect(form).toHaveAttribute("data-astro-reload", "");

    // No product pre-selected: a visitor who never touches the dropdown
    // must not be silently recorded as a VoxTable enquiry.
    await expect(page.locator("#if-product")).toHaveValue("");

    await page.fill("#if-name", "Test Diner");
    await page.fill("#if-email", "diner@example.com");
    await page.fill("#if-venue", venue);
    await page.selectOption("#if-product", "voxorder");
    await page.fill("#if-message", "Automated QA message — please ignore.");
    await page.locator(".g-recaptcha").evaluate((widget) => {
      const token = document.createElement("input");
      token.type = "hidden";
      token.name = "g-recaptcha-response";
      token.value = "test-recaptcha-token";
      widget.append(token);
    });

    await form.locator('button[type="submit"]').click();
    await expect(page.locator(".intl-form-success")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${base}/contact/$`));

    expect(submittedBody).toMatchObject({
      name: "Test Diner",
      email: "diner@example.com",
      venue,
      message: "Automated QA message — please ignore.",
      product: "voxorder",
      crmForm: "zoho-global",
      _gotcha: "",
      "g-recaptcha-response": "test-recaptcha-token",
    });

    const conversions = await page.evaluate(() => {
      const calls = (window as unknown as { __gtagCalls: unknown[][] }).__gtagCalls;
      return calls.filter((call) => call[0] === "event" && call[1] === "conversion");
    });
    expect(conversions).toEqual([
      ["event", "conversion", { send_to: "AW-18397306929/bn2iCLeH5-YcELHAwsRE" }],
    ]);
  });
}
