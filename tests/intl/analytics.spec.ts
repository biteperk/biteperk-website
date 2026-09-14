import { expect, test } from "../helpers/fixtures";
import { localesForTarget } from "../../src/data/locales";
import {
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
  ANALYTICS_HOSTS,
} from "../../src/data/consent";

/**
 * Every international locale home carries the Umami tracker, tagged with its
 * own locale base so reports segment per market. The list is derived from
 * locales.ts, so a locale added later (Canada, USA, …) is covered here with no
 * edit. Runs once (desktop) — the tag is viewport-independent; the intl config
 * ignores this spec on the two mobile projects.
 */
const sel = `head script[src="${UMAMI_SCRIPT_URL}"]`;

test.beforeEach(async ({ page }) => {
  await page.route(UMAMI_SCRIPT_URL, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
});

for (const locale of localesForTarget("global")) {
  test(`${locale.base} home emits one Umami tag tagged "${locale.base.slice(1)}"`, async ({ page }) => {
    await page.goto(`${locale.base}/`);
    const el = page.locator(sel);
    await expect(el).toHaveCount(1);
    await expect(el).toHaveAttribute("data-website-id", UMAMI_WEBSITE_ID);
    await expect(el).toHaveAttribute("data-domains", ANALYTICS_HOSTS.join(","));
    await expect(el).toHaveAttribute("data-tag", locale.base.slice(1));
  });
}
