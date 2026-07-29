import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { localesForTarget, pagesForLocale } from "../../src/data/locales";
import { intlCityPaths } from "../../src/data/intl/cities";
import { routes } from "../helpers/routes";

/**
 * Accessibility coverage for the international trees.
 *
 * These pages had NONE until now: tests/a11y/axe.spec.ts runs under
 * playwright.config.ts against dist/ at /au-en/ only. CLAUDE.md records what
 * that cost — "e2e, axe and Lighthouse all ran on the AU leg only, which is
 * exactly how a site with no mobile navigation, a picker menu hanging
 * off-screen and a consent banner linking to a 404 reached production."
 *
 * ── Why a SUBSET of routes, and which one ───────────────────────────────────
 * All 60 global routes render from one file ([...intl].astro), so scanning
 * every route in both themes would be 120 axe runs to exercise ~12 distinct
 * markup shapes. Two risk axes, each covered in O(n):
 *
 *   chrome + copy vary PER LOCALE, template does not → scan all five homes
 *   template varies PER PAGE, markup does not vary per locale → scan one
 *     locale's remaining templates
 *
 * /be-fr carries the template sweep: French exercises lang/hreflang and the
 * longest strings, and it is a secondary market rather than the canonical tree.
 * legal/terms and legal/cookies share legal/privacy's template exactly, so they
 * are skipped. /gb-en/contact/ is the one deliberate duplicate — it is the only
 * page with a form, label/aria failures are the highest-value axe catch, and
 * the form is where an EN/FR divergence could plausibly exist.
 *
 * Heading order is NOT left to this subset: axe rates `heading-order` as
 * `moderate`, which the AU spec's serious/critical gate would let through, so
 * it is gated explicitly below AND swept across all 60 routes without axe.
 */

const THEMES = ["dark", "light"] as const;

const homes = localesForTarget("global").map((l) => `${l.base}/`);

/**
 * The template sweep — one locale, one page per DISTINCT template.
 *
 * Dropped as duplicates, not as gaps:
 *   ""                       already covered by the five homes
 *   legal/terms, cookies     byte-identical template to legal/privacy
 *   products/vox{order,…}    all four detail pages render one branch; voxtable
 *                            stands in for them
 * Derived from pagesForLocale so a NEW page kind fails loudly here (it will
 * appear in the list) rather than silently going unscanned.
 */
const TEMPLATE_LOCALE = "/be-fr";
const DUPLICATE_TEMPLATES = new Set([
  "",
  "legal/terms",
  "legal/cookies",
  "products/voxorder",
  "products/voxconcierge",
  "products/voxdrive",
]);
const templateRoutes = pagesForLocale(
  localesForTarget("global").find((l) => l.base === TEMPLATE_LOCALE)!,
)
  .filter((p) => !DUPLICATE_TEMPLATES.has(p))
  .map((p) => `${TEMPLATE_LOCALE}/${p}/`);

/**
 * City pages are a gb-en-only template today, so deriving templates from
 * /be-fr alone would ship the city page kind with no axe scan in either
 * theme. Take the FIRST published city per non-template locale — the other
 * cities share the template, and the heading/overflow sweeps cover them all.
 */
const cityTemplateRoutes = localesForTarget("global")
  .filter((l) => l.base !== TEMPLATE_LOCALE)
  .map((l) => intlCityPaths(l.base)[0] && `${l.base}/${intlCityPaths(l.base)[0]}/`)
  .filter((r): r is string => Boolean(r));

const AXE_ROUTES = [...homes, ...templateRoutes, ...cityTemplateRoutes, "/gb-en/contact/"];

/**
 * Rules that gate regardless of impact. axe scores these below serious, but
 * they are structural: a page with no h1, two mains, or jumbled headings is
 * broken for screen-reader navigation even when axe calls it `moderate`.
 */
const ALWAYS_GATE = new Set([
  "heading-order",
  "page-has-heading-one",
  "landmark-one-main",
  "region",
]);

async function withTheme(page: Page, theme: (typeof THEMES)[number], route: string) {
  await page.addInitScript((t) => localStorage.setItem("bp-theme", t), theme);
  await page.goto(route, { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

for (const theme of THEMES) {
  test.describe(`intl axe (${theme} theme)`, () => {
    test.use({ colorScheme: theme });

    for (const route of AXE_ROUTES) {
      test(`no serious/critical or structural violations: ${route}`, async ({ page }) => {
        await withTheme(page, theme, route);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();

        const gating = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical" || ALWAYS_GATE.has(v.id),
        );
        const advisory = results.violations.filter((v) => !gating.includes(v));
        if (advisory.length) {
          console.log(
            `[axe advisory] ${route} (${theme}): ` +
              advisory.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes)`).join(", "),
          );
        }

        expect(
          gating,
          gating
            .map(
              (v) =>
                `${v.id} [${v.impact}] ${v.help}\n` +
                v.nodes.slice(0, 5).map((n) => `  ${n.target.join(" ")}`).join("\n"),
            )
            .join("\n\n"),
        ).toEqual([]);
      });
    }
  });
}

/**
 * Heading structure across EVERY global route — cheap enough (one evaluate, no
 * axe) that the axe subset above doesn't become a coverage hole on the one
 * requirement that was called out by name.
 */
test.describe("intl heading structure (all routes)", () => {
  for (const route of routes.filter((r) => !r.endsWith(".html"))) {
    test(`exactly one h1, in order, no skipped levels: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
          Number(h.tagName.slice(1)),
        ),
      );

      expect(levels.length, "page has no headings at all").toBeGreaterThan(0);
      expect(levels.filter((l) => l === 1), "exactly one h1").toHaveLength(1);
      expect(levels[0], "the first heading must be the h1").toBe(1);
      for (let i = 1; i < levels.length; i++) {
        expect(
          levels[i] - levels[i - 1],
          `heading level jumps from h${levels[i - 1]} to h${levels[i]} (position ${i})`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});

type RGBA = [number, number, number, number];

/** Relative luminance → contrast ratio, same arithmetic as check-contrast.mjs. */
function ratio(a: [number, number, number], b: [number, number, number]) {
  const lum = ([r, g, b2]: [number, number, number]) => {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2);
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Composite a possibly-translucent colour over an opaque backdrop.
 *
 * Skipping this is a trap that produces a test which always passes: the FAQ
 * border is `rgba(20,22,26,.1)` in light and `rgba(255,255,255,.08)` in dark,
 * so reading its raw RGB and ignoring alpha scores it as near-black on white
 * (ratio ~18) when the rendered edge is actually ~1.16.
 */
const over = (c: RGBA, bg: [number, number, number]): [number, number, number] => [
  Math.round(c[3] * c[0] + (1 - c[3]) * bg[0]),
  Math.round(c[3] * c[1] + (1 - c[3]) * bg[1]),
  Math.round(c[3] * c[2] + (1 - c[3]) * bg[2]),
];

test.describe("intl FAQ items stay visible", () => {
  for (const theme of THEMES) {
    test.describe(`${theme} theme`, () => {
      test.use({ colorScheme: theme });

      for (const home of homes) {
        /**
         * What this actually guards, having measured it.
         *
         * The received wisdom was that FAQ.astro paints items `var(--ink-1)`,
         * `.intl-band` paints sections the same, and so banding the FAQ section
         * would make every item vanish — with `class="intl-faq"` plus a comment
         * as the only protection.
         *
         * Measured, that is wrong in a way worth recording: the item and its
         * section are ALREADY the same colour in both themes, banded or not
         * (light rgb(255,255,255) both; dark rgb(17,19,23) both). Adding
         * `.intl-band` changes nothing, because --ink-1 is the surface colour
         * on both sides. Fill contrast is 1.00 in every combination.
         *
         * So the border is not a nice-to-have, it is the ONLY thing separating
         * an FAQ item from the page — measured at 1.16 (light) and 1.20 (dark)
         * once alpha is composited. The real regression to catch is therefore
         * someone removing or zeroing that border, not someone adding a band.
         * Threshold 1.1 sits just under both measurements; a transparent or
         * absent border collapses the ratio to exactly 1.00 and fails.
         */
        test(`FAQ item is separated from the page: ${home}`, async ({ page }) => {
          await withTheme(page, theme, home);
          const item = page.locator(".faq-item").first();
          await expect(item).toBeVisible();

          const c = await item.evaluate((el) => {
            const parse = (s: string): [number, number, number, number] => {
              const n = s.match(/[\d.]+/g)!.map(Number);
              return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
            };
            const cs = getComputedStyle(el);
            return {
              item: parse(cs.backgroundColor),
              border: parse(cs.borderTopColor),
              width: parseFloat(cs.borderTopWidth),
            };
          });

          const itemBg: [number, number, number] = [c.item[0], c.item[1], c.item[2]];
          const edge = ratio(over(c.border as RGBA, itemBg), itemBg);

          expect(c.width, "FAQ item has no border, and the border is all that separates it").
            toBeGreaterThanOrEqual(1);
          expect(
            edge,
            `FAQ item border is invisible against the item (ratio ${edge.toFixed(3)}). ` +
              `Nothing else distinguishes the item — its fill matches the page in both themes.`,
          ).toBeGreaterThan(1.1);
        });
      }
    });
  }
});

test.describe("intl FAQ accordion is keyboard-operable", () => {
  for (const home of homes) {
    test(`opens and closes with Enter: ${home}`, async ({ page }) => {
      await page.goto(home, { waitUntil: "domcontentloaded" });
      const details = page.locator(".faq-item").first();
      const summary = details.locator("summary").first();

      await summary.focus();
      await page.keyboard.press("Enter");
      await expect(details).toHaveAttribute("open", "");
      await expect(details.locator(".faq-a").first()).toBeVisible();

      await page.keyboard.press("Enter");
      await expect(details).not.toHaveAttribute("open", "");
    });
  }
});
