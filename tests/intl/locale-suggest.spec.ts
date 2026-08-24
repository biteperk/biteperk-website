import { test, expect, type Browser, type Page } from "@playwright/test";

/**
 * Locale suggestion chip (LocaleSuggest.astro + scripts/locale-suggest.ts).
 *
 * The contract worth protecting is mostly about what it must NOT do: never
 * redirect, never nag someone already in their market, never appear for a
 * visitor we have no market for. Getting this wrong is the classic
 * international-site annoyance, so it's pinned here.
 *
 * `navigator.languages` is injected rather than set through the context's
 * `locale` option: engines don't agree on how a locale maps to that list
 * (WebKit reports ["fr-FR"] for a fr-BE context), so relying on it would test
 * the browser's emulation instead of our matching.
 */

async function pageWithLanguages(browser: Browser, languages: string[]): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((langs) => {
    Object.defineProperty(navigator, "languages", { get: () => langs });
    Object.defineProperty(navigator, "language", { get: () => langs[0] });
    localStorage.setItem(
      "bp-consent",
      JSON.stringify({ v: 2, analytics: false, marketing: false, ts: Date.now() })
    );
  }, languages);
  return ctx.newPage();
}

const chip = async (page: Page) => {
  // `networkidle` does not guarantee that Astro's deferred client module has
  // executed, particularly in WebKit under a busy parallel CI run. Wait for
  // the initializer's own bound marker before reading the link it replaces.
  await expect(page.locator("[data-locale-suggest]")).toHaveAttribute("data-ls-bound", "1");
  return page.evaluate(() => {
    const el = document.querySelector<HTMLElement>("[data-locale-suggest]");
    return {
      visible: !!el && !el.hidden,
      href: el?.querySelector("[data-ls-go]")?.getAttribute("href") ?? null,
      text: el?.querySelector("[data-ls-text]")?.textContent ?? null,
    };
  });
};

test("offers the UK site to a UK browser that landed on /en", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["en-GB", "en"]);
  await page.goto("/en/", { waitUntil: "networkidle" });
  const r = await chip(page);
  expect(r.visible).toBe(true);
  expect(r.href).toBe("/gb-en/");
  // …and it is an OFFER: we are still on /en, nothing redirected.
  expect(new URL(page.url()).pathname).toBe("/en/");
  await page.context().close();
});

test("speaks the target language — Belgian French gets /be-fr in French", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["fr-BE", "fr"]);
  await page.goto("/en/", { waitUntil: "networkidle" });
  const r = await chip(page);
  expect(r.href).toBe("/be-fr/");
  expect(r.text).toMatch(/votre région/i);
  await page.context().close();
});

test("browser preference order wins — fr before fr-BE picks France", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["fr-FR", "fr-BE"]);
  await page.goto("/en/", { waitUntil: "networkidle" });
  expect((await chip(page)).href).toBe("/fr/");
  await page.context().close();
});

test("never nags someone already in their market (incl. ccTLD arrivals)", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["en-GB", "en"]);
  await page.goto("/gb-en/", { waitUntil: "networkidle" });
  expect((await chip(page)).visible).toBe(false);
  await page.context().close();
});

test("stays silent for a visitor we have no market for (e.g. the US)", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["en-US"]);
  await page.goto("/en/", { waitUntil: "networkidle" });
  expect((await chip(page)).visible).toBe(false);
  await page.context().close();
});

test("dismissal sticks across navigations", async ({ browser }) => {
  const page = await pageWithLanguages(browser, ["en-GB", "en"]);
  await page.goto("/en/", { waitUntil: "networkidle" });
  await page.locator("[data-ls-dismiss]").click();
  expect((await chip(page)).visible).toBe(false);

  await page.goto("/en/about/", { waitUntil: "networkidle" });
  expect((await chip(page)).visible, "must not come back after dismissal").toBe(false);
  await page.context().close();
});
