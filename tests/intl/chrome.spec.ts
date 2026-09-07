import { test, expect, type Page } from "@playwright/test";
import { INTL_NAV } from "../../src/data/intl/nav";
import { localesForTarget, locales } from "../../src/data/locales";
import { intlCitiesForBase } from "../../src/data/intl/cities";

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

/**
 * Every rendered locale home, so a market can't silently regress alone —
 * DERIVED, because a hardcoded list stops covering the sixth market the moment
 * it ships, which is the exact failure this constant exists to prevent. Same
 * reasoning that moved the nav count onto INTL_NAV.length below.
 */
const LOCALE_HOMES = localesForTarget("global").map((l) => `${l.base}/`);

async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

/**
 * Wait for an element's entrance to finish before measuring it.
 *
 * Load-bearing for anything that slides in. The drawer animates
 * `transform: translateX(100%) → 0`; measured mid-slide its links sit
 * partially off-screen (571px right edge in a 390px viewport at ~60% of the
 * transition), which reads exactly like a layout bug and is not one.
 * `getAnimations()` covers CSSTransition as well as CSSAnimation, so this
 * works for the drawer's transition and the picker/city sheets' keyframes.
 */
async function settle(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)),
  );
}

test.describe("intl chrome — phone", () => {
  test.use({ viewport: PHONE });

  for (const home of LOCALE_HOMES) {
    test(`navigation is reachable without the footer: ${home}`, async ({ page }) => {
      await page.goto(home);
      // The original defect was `display:none` with no replacement — no mobile
      // navigation at all. From 6 Sep 2026 the replacement is a slide-over
      // drawer (IntlMobileMenu) behind a burger, so this asserts the JOURNEY
      // rather than the old wrapped link row: the links are legitimately
      // hidden in the bar now, and a test that only checked `.intl-links`
      // would pass on a page with no way to open anything.
      const burger = page.locator("[data-mobile-menu-trigger]");
      await expect(burger).toBeVisible();
      await expect(burger).toHaveAttribute("aria-expanded", "false");

      // The bar must stay one row. 57px = 56 min-height + its bottom border;
      // the two-row bar this replaced was ~105px, 12% of an iPhone viewport.
      const bar = await page.locator(".intl-nav").boundingBox();
      expect(bar!.height, "the phone bar must stay a single row").toBeLessThanOrEqual(60);

      await burger.click();
      await expect(page.locator(".imm")).toBeVisible();
      await expect(burger).toHaveAttribute("aria-expanded", "true");
      await settle(page, ".imm-panel");

      // Count DERIVED from INTL_NAV, the same list IntlLayout renders from, so
      // adding a nav item cannot leave this asserting the old number. It was
      // hardcoded at 4 once and had already gone stale (3 → 4 with products).
      const links = page.locator(".imm-link");
      await expect(links).toHaveCount(INTL_NAV.length);
      for (const link of await links.all()) {
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box!.height, "drawer link must be a 44px touch target").toBeGreaterThanOrEqual(44);
        expect(box!.x, "drawer link must not sit off-screen").toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, "drawer link must not overflow").toBeLessThanOrEqual(PHONE.width);
      }

      // The CTA the bar drops below 400px lives in here, so it is never lost.
      await expect(page.locator(".imm-cta")).toBeVisible();

      // Escape closes and focus returns to the trigger — the drawer is a modal
      // dialog and a keyboard user must not be stranded inside it.
      await page.keyboard.press("Escape");
      await expect(page.locator(".imm")).toBeHidden();
      await expect(burger).toBeFocused();
      await expect(burger).toHaveAttribute("aria-expanded", "false");
    });
  }

  test("region picker opens fully inside the viewport", async ({ page }) => {
    await page.goto("/gb-en/");
    await page.locator("[data-locale-picker-trigger]").click();
    const menu = page.locator("[data-locale-picker-menu]");
    await expect(menu).toBeVisible();
    // The sheet slides up from below the viewport (240ms). toBeVisible()
    // resolves on its first painted frame, so under load boundingBox() can
    // sample it mid-slide and report it as overflowing the bottom edge —
    // exactly the false failure this measured on a busy machine. Wait for
    // the entrance to settle; a no-op under prefers-reduced-motion.
    await menu.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)),
    );
    const box = (await menu.boundingBox())!;
    // It used to hang ~43px off the right edge on a 390px screen.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(PHONE.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(PHONE.height);
    // Derived: the picker offers every locale, AU included.
    await expect(page.locator("[data-locale-picker-item]")).toHaveCount(locales.length);
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
    // Moved into the drawer on phones (6 Sep 2026) so the 56px bar can hold
    // brand + picker + burger. Still one tap from the top of any page — the
    // parity this test protects is REACHABILITY, not which element holds it.
    await expect(page.locator(".intl-actions [data-theme-toggle]")).toBeHidden();
    await page.locator("[data-mobile-menu-trigger]").click();
    await settle(page, ".imm-panel");
    await expect(page.locator(".imm [data-theme-toggle]")).toBeVisible();
  });
});

test.describe("intl chrome — the 400–719px squeeze band", () => {
  // 390 hides the header CTA and 768 leaves the wrap band, so no viewport
  // exercised the one range where brand + picker chip + CTA + burger share a
  // single 56px row. 412×915 is a real device (Pixel 7-class). /be-fr is the
  // worst case: the widest chip ("BE · FR" — the only market whose chip
  // carries a language suffix) beside the French CTA label.
  test.use({ viewport: { width: 412, height: 915 } });

  test("bar holds one row with the CTA present and nothing overflows: /be-fr", async ({ page }) => {
    await page.goto("/be-fr/");
    await expect(page.locator(".intl-cta-btn")).toBeVisible();
    const bar = await page.locator(".intl-nav").boundingBox();
    expect(bar!.height, "the bar must stay a single row with the CTA back").toBeLessThanOrEqual(60);
    expect(await horizontalOverflow(page)).toBe(0);
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

  // Informed consent means a notice the visitor can read. Until 6 Sep 2026
  // the bar was hardcoded English on every tree. toHaveText reads
  // textContent, so this holds whether or not the bar is currently shown.
  for (const [home, accept] of [
    ["/fr/", "Tout accepter"],
    ["/be-fr/", "Tout accepter"],
    ["/gb-en/", "Accept all"],
    ["/be-en/", "Accept all"],
  ] as const) {
    test(`consent notice speaks the tree's language: ${home}`, async ({ page }) => {
      await page.goto(home);
      await expect(page.locator("[data-consent-accept]")).toHaveText(accept);
    });
  }
});

test.describe("trust facts", () => {
  test.use({ viewport: PHONE });

  // Every locale home and contact page carries the facts strip; the UK tree
  // names Biteperk Ltd, the others the Australian company. Never an address.
  for (const l of localesForTarget("global")) {
    for (const page_ of ["", "contact/"]) {
      test(`facts strip on ${l.base}/${page_}`, async ({ page }) => {
        await page.goto(`${l.base}/${page_}`);
        const facts = page.locator("[data-trust-facts]");
        await expect(facts).toHaveCount(1);
        await expect(facts).toContainText(l.market === "gb" ? "Biteperk Ltd" : "Biteperk Pty Ltd");
        await expect(facts).not.toContainText(/City Road|Elizabeth Street|Surry Hills/);
        await expect(facts.locator("a[href$='/legal/privacy/']")).toHaveAttribute(
          "href",
          `${l.base}/legal/privacy/`,
        );
      });
    }
  }
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
    // The drawer is a PHONE affordance. Above 720px the bar shows real links,
    // so the burger must be gone — otherwise both navigations ship at once.
    await expect(page.locator("[data-mobile-menu-trigger]")).toBeHidden();
    expect(await horizontalOverflow(page)).toBe(0);
  });
});

test.describe("intl chrome — Cities nav dropdown", () => {
  // TABLET, not phone (rev. 6 Sep 2026): the bar's Cities dropdown is hidden
  // ≤720px now that the drawer carries the city list. Asserting it on a phone
  // would be asserting a control that is deliberately not there.
  test.use({ viewport: TABLET });

  test("opens fully inside the viewport with every city listed", async ({ page }) => {
    await page.goto("/gb-en/");
    await page.locator("[data-city-nav-trigger]").click();
    const menu = page.locator("[data-city-nav-menu]");
    await expect(menu).toBeVisible();
    // Same slide-up entrance as the region picker — settle before measuring.
    await menu.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)),
    );
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(TABLET.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(TABLET.height);
    // Derived, same rule as INTL_NAV.length above: publishing a ninth city
    // must not require a test edit.
    await expect(page.locator("[data-city-nav-item]")).toHaveCount(
      intlCitiesForBase("/gb-en").length,
    );
  });

  test("absent on trees without published cities", async ({ page }) => {
    // /en is the x-default and never emits city pages, so it is the stable
    // city-less tree. Was /fr until 7 Sep 2026, when Paris published and made
    // /fr city-bearing — every tree but /en now carries the Cities trigger.
    await page.goto("/en/");
    await expect(page.locator("[data-city-nav]")).toHaveCount(0);
  });

  // /be-en is the FIRST non-UK city-bearing tree (Brussels, 6 Sep 2026). Until
  // it existed, every positive city assertion in this file ran against /gb-en,
  // so nothing checked the chrome against non-UK label lengths — and the
  // `[data-has-cities]` 1080px wrap band exists precisely because the Cities
  // trigger widens the actions row. This is the counterpart assertion.
  test("opens on /be-en/ too, with the Belgian city listed", async ({ page }) => {
    await page.goto("/be-en/");
    await page.locator("[data-city-nav-trigger]").click();
    const menu = page.locator("[data-city-nav-menu]");
    await expect(menu).toBeVisible();
    await settle(page, "[data-city-nav-menu]");
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(TABLET.width);
    await expect(page.locator("[data-city-nav-item]")).toHaveCount(
      intlCitiesForBase("/be-en").length,
    );
    expect(await horizontalOverflow(page), "the bar must not overflow").toBe(0);
  });
});

test.describe("intl chrome — cities on a phone live in the drawer", () => {
  test.use({ viewport: PHONE });

  test("every published city is reachable from the drawer on /gb-en/", async ({ page }) => {
    await page.goto("/gb-en/");
    await page.locator("[data-mobile-menu-trigger]").click();
    await settle(page, ".imm-panel");
    const chips = page.locator(".imm-city");
    // Derived, same rule as everywhere here: a ninth city must not need a test
    // edit. This is the assertion that keeps the bar's hidden dropdown honest —
    // hiding CityNav on phones is only acceptable because these exist.
    await expect(chips).toHaveCount(intlCitiesForBase("/gb-en").length);
    for (const chip of await chips.all()) {
      const box = (await chip.boundingBox())!;
      expect(box.height, "city chip must be a 44px touch target").toBeGreaterThanOrEqual(44);
      expect(box.x + box.width).toBeLessThanOrEqual(PHONE.width);
    }
  });

  test("no city section on a tree without cities", async ({ page }) => {
    // /en, the x-default, is the only tree with no city pages (was /fr until
    // Paris published on 7 Sep 2026).
    await page.goto("/en/");
    await page.locator("[data-mobile-menu-trigger]").click();
    await expect(page.locator(".imm-city")).toHaveCount(0);
  });
});
