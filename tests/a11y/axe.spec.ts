import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "../helpers/routes";

/**
 * axe-core scan of every route in BOTH themes. Gate: zero serious/critical
 * violations. (Moderate/minor are reported in the test output but don't
 * fail the build — tighten later if desired.)
 */

for (const theme of ["dark", "light"] as const) {
  test.describe(`axe (${theme} theme)`, () => {
    test.use({ colorScheme: theme });

    for (const route of routes) {
      test(`no serious/critical violations: ${route}`, async ({ page }) => {
        // Explicit stored theme so the scan is deterministic per project.
        await page.addInitScript((t) => localStorage.setItem("bp-theme", t), theme);
        await page.goto(route, { waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
          .analyze();

        const gating = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );
        const advisory = results.violations.filter(
          (v) => v.impact !== "serious" && v.impact !== "critical"
        );
        if (advisory.length) {
          console.log(
            `[axe advisory] ${route} (${theme}): ` +
              advisory.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes)`).join(", ")
          );
        }

        expect(
          gating,
          gating
            .map(
              (v) =>
                `${v.id} [${v.impact}] ${v.help}\n` +
                v.nodes.slice(0, 5).map((n) => `  ${n.target.join(" ")}`).join("\n")
            )
            .join("\n\n")
        ).toEqual([]);
      });
    }
  });
}

/**
 * Heading structure across every AU route — the same sweep the intl suite runs.
 *
 * Deliberately NOT left to axe: `heading-order` is rated `moderate`, and the
 * gate above only fails on serious/critical, so three separate level skips
 * lived on this site unnoticed — h1→h3 on the home (TrustRow), h1→h3 on every
 * product page (the features cards), and h2→h4 in the footer. axe reported all
 * of them as advisory the whole time.
 *
 * One evaluate() per route, no axe, so it is cheap enough to run everywhere.
 */
test.describe("heading structure (all AU routes)", () => {
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
