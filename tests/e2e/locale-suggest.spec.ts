import { test, expect, type Browser, type Page } from "../helpers/fixtures";
import { UMAMI_SCRIPT_URL } from "../../src/data/consent";
import { p } from "../helpers/routes";

/**
 * LocaleSuggest on the AU tree (moved to Base.astro so both trees carry it,
 * 15 Sep 2026). An en-GB visitor who lands on the Australian site should be
 * OFFERED the UK site — never redirected — and a deliberate region choice
 * (localStorage `bp-locale`) must suppress the offer entirely.
 */

async function pageWith(browser: Browser, languages: string[], storage?: Record<string, string>): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(UMAMI_SCRIPT_URL, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await ctx.addInitScript(([langs, store]) => {
    Object.defineProperty(navigator, "languages", { get: () => langs });
    Object.defineProperty(navigator, "language", { get: () => (langs as string[])[0] });
    localStorage.setItem("bp-consent", JSON.stringify({ v: 3, analytics: false, marketing: false, ts: Date.now() }));
    for (const [k, v] of Object.entries((store ?? {}) as Record<string, string>)) localStorage.setItem(k, v);
  }, [languages, storage] as const);
  return ctx.newPage();
}

test("offers the UK site to a UK browser that landed on the AU tree", async ({ browser }) => {
  const page = await pageWith(browser, ["en-GB", "en"]);
  await page.goto(p(), { waitUntil: "networkidle" });
  await expect(page.locator("[data-locale-suggest]")).toHaveAttribute("data-ls-bound", "1");
  const el = page.locator("[data-locale-suggest]");
  await expect(el).toBeVisible();
  await expect(el.locator("[data-ls-go]")).toHaveAttribute("href", "/gb-en/");
  // It is an OFFER — still on the AU site, nothing redirected.
  expect(new URL(page.url()).pathname).toBe(p());
  await page.context().close();
});

test("a deliberate region choice (bp-locale) suppresses the offer", async ({ browser }) => {
  const page = await pageWith(browser, ["en-GB", "en"], { "bp-locale": "/au-en" });
  await page.goto(p(), { waitUntil: "networkidle" });
  await expect(page.locator("[data-locale-suggest]")).toHaveAttribute("data-ls-bound", "1");
  await expect(page.locator("[data-locale-suggest]")).toBeHidden();
  await page.context().close();
});

test("never nags an Australian visitor already on the AU tree", async ({ browser }) => {
  const page = await pageWith(browser, ["en-AU", "en"]);
  await page.goto(p(), { waitUntil: "networkidle" });
  await expect(page.locator("[data-locale-suggest]")).toHaveAttribute("data-ls-bound", "1");
  await expect(page.locator("[data-locale-suggest]")).toBeHidden();
  await page.context().close();
});

test("never stacks under the consent bar", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(UMAMI_SCRIPT_URL, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "languages", { get: () => ["en-GB", "en"] });
    Object.defineProperty(navigator, "language", { get: () => "en-GB" });
  });
  const page = await ctx.newPage();
  // ?cookie-preview=1 forces the consent bar visible even on a dormant site.
  await page.goto(p() + "?cookie-preview=1", { waitUntil: "networkidle" });
  await expect(page.locator("[data-consent-bar]")).toBeVisible();
  // The offer would match (en-GB) but must step aside for the consent bar.
  await expect(page.locator("[data-locale-suggest]")).toBeHidden();
  await ctx.close();
});
