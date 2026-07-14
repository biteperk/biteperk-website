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
