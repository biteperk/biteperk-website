import { expect, test } from "@playwright/test";

test("global contact submits every field and reports its Google Ads conversion", async ({ page }) => {
  let submittedBody: Record<string, string> = {};

  await page.addInitScript(() => {
    localStorage.setItem(
      "bp-consent",
      JSON.stringify({ v: 2, analytics: false, marketing: true, ts: Date.now() }),
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

  await page.goto("/en/contact/");
  const form = page.locator(".intl-form");
  await expect(form).toHaveAttribute("data-astro-reload", "");

  await page.fill("#if-name", "Test Diner");
  await page.fill("#if-email", "diner@example.com");
  await page.fill("#if-venue", "QA Bistro");
  await page.fill("#if-message", "Automated QA message — please ignore.");

  await form.locator('button[type="submit"]').click();
  await expect(page.locator(".intl-form-success")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/contact\/$/);

  expect(submittedBody).toMatchObject({
    name: "Test Diner",
    email: "diner@example.com",
    venue: "QA Bistro",
    message: "Automated QA message — please ignore.",
    product: "general",
    _gotcha: "",
  });

  const conversions = await page.evaluate(() => {
    const calls = (window as unknown as { __gtagCalls: unknown[][] }).__gtagCalls;
    return calls.filter((call) => call[0] === "event" && call[1] === "conversion");
  });
  expect(conversions).toEqual([
    ["event", "conversion", { send_to: "AW-18397306929/bn2iCLeH5-YcELHAwsRE" }],
  ]);
});
