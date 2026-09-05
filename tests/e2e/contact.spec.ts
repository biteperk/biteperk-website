import { test, expect, type Page } from "@playwright/test";
import { p } from "../helpers/routes";

/**
 * Contact form states against a MOCKED /api/contact — the real contract is
 * documented in docs/v1-baseline/contact-contract.md:
 *   POST /api/contact, Accept: application/json ⇒ {ok:true} | {ok:false,error}
 *   Honeypot field: _gotcha. Fields: name, email, message, venue?, product?.
 */

async function fillForm(page: Page) {
  // WebKit can make the static form interactive before its module script has
  // attached the submit handler. Wait for the handler's readiness marker so a
  // click cannot fall through to the form's native POST navigation.
  await expect(page.locator(".contact-form")).toHaveAttribute("data-bound", "1");
  await page.fill("#cf-name", "Test Diner");
  await page.fill("#cf-email", "diner@example.com");
  await page.fill("#cf-message", "Automated QA message — please ignore.");
}

async function submitAndWaitForContactResponse(page: Page) {
  const response = page.waitForResponse("**/api/contact");
  await page.click(".contact-submit");
  await response;
}

test.describe("contact form", () => {
  test("reports the Google Ads demo conversion after a confirmed demo submission", async ({ page }) => {
    await page.route(/https:\/\/www\.googletagmanager\.com\/gtag\/js.*/, (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
    );
    await page.addInitScript(() => {
      localStorage.setItem(
        "bp-consent",
        JSON.stringify({ v: 3, analytics: false, marketing: true, ts: Date.now() }),
      );
      const w = window as unknown as {
        __gtagCalls: unknown[][];
        gtag: (...args: unknown[]) => void;
      };
      w.__gtagCalls = [];
      w.gtag = (...args: unknown[]) => w.__gtagCalls.push(args);
    });
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );

    await page.goto(p("/contact/?intent=demo"));
    await fillForm(page);
    await submitAndWaitForContactResponse(page);
    await expect(page.locator(".contact-success")).toBeVisible();

    const conversions = await page.evaluate(() => {
      const calls = (window as unknown as { __gtagCalls: unknown[][] }).__gtagCalls;
      return calls.filter((call) => call[0] === "event" && call[1] === "conversion");
    });
    // transaction_id is the lead's random dedupe key (leadRef) — asserted by
    // shape, not value: it lets offline conversion uploads dedupe the pixel.
    expect(conversions).toEqual([
      [
        "event",
        "conversion",
        {
          send_to: "AW-18397306929/m_x8COqW9OYcELHAwsRE",
          transaction_id: expect.stringMatching(/^[\w-]{8,64}$/),
        },
      ],
    ]);
  });

  test("sends the documented JSON payload and shows success state", async ({ page }) => {
    let captured: Record<string, string> | null = null;
    await page.route("**/api/contact", async (route) => {
      captured = route.request().postDataJSON();
      expect(route.request().headers()["accept"]).toContain("application/json");
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto(p("/contact/"));
    await fillForm(page);
    await page.fill("#cf-venue", "QA Bistro");
    await page.selectOption("#cf-product", "voxtable");
    await submitAndWaitForContactResponse(page);

    await expect(page.locator(".contact-success")).toBeVisible();
    await expect(page.locator(".contact-success h2")).toContainText("Thanks");

    // Contract fields (contact-contract.md): exact names + empty honeypot.
    expect(captured).toMatchObject({
      name: "Test Diner",
      email: "diner@example.com",
      message: "Automated QA message — please ignore.",
      venue: "QA Bistro",
      product: "voxtable",
      _gotcha: "",
    });
  });

  test("shows pending state while the request is in flight", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto(p("/contact/"));
    await fillForm(page);
    const btn = page.locator(".contact-submit");
    const response = page.waitForResponse("**/api/contact");
    await btn.click();
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveAttribute("aria-busy", "true");
    await expect(btn).toHaveText("Sending…");
    await response;
    await expect(page.locator(".contact-success")).toBeVisible();
  });

  test("server validation error surfaces message + email fallback, form stays usable", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 400, json: { ok: false, error: "Please check your email address." } })
    );

    await page.goto(p("/contact/"));
    await fillForm(page);
    await submitAndWaitForContactResponse(page);

    const status = page.locator(".contact-status");
    await expect(status).toBeVisible();
    await expect(status).toHaveClass(/is-error/);
    await expect(status).toContainText("Please check your email address.");
    await expect(status.locator('a[href^="mailto:"]')).toBeVisible();
    // Form is still there and the button re-enabled for a retry.
    await expect(page.locator(".contact-submit")).toBeEnabled();
    await expect(page.locator("#cf-message")).toHaveValue(/Automated QA/);
  });

  test("network failure shows retry guidance with email fallback", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.abort("connectionfailed"));

    await page.goto(p("/contact/"));
    await fillForm(page);
    await page.click(".contact-submit");

    const status = page.locator(".contact-status");
    await expect(status).toBeVisible();
    await expect(status).toHaveClass(/is-error/);
    await expect(status).toContainText("Network error");
    await expect(status.locator('a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator(".contact-submit")).toBeEnabled();
  });

  test("client validation blocks empty required fields (no request sent)", async ({ page }) => {
    let requested = false;
    await page.route("**/api/contact", (route) => {
      requested = true;
      return route.fulfill({ status: 200, json: { ok: true } });
    });

    await page.goto(p("/contact/"));
    await page.click(".contact-submit");
    // Native validation stops submission; name is the first invalid field.
    expect(await page.evaluate(() => !document.querySelector<HTMLInputElement>("#cf-name")!.checkValidity())).toBe(true);
    expect(requested).toBe(false);
    await expect(page.locator(".contact-success")).toHaveCount(0);
  });

  test("?product= preselects the About dropdown", async ({ page }) => {
    await page.goto(p("/contact/?product=voxorder"));
    await expect(page.locator("#cf-product")).toHaveValue("voxorder");
  });

  test("?product=voxstay preselects too — the select is derived from the catalogue", async ({ page }) => {
    await page.goto(p("/contact/?product=voxstay"));
    await expect(page.locator("#cf-product")).toHaveValue("voxstay");
  });
});
