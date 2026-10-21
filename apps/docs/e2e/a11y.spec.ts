import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES, SURFACES } from "./pages";

const THEMES = ["light", "dark"] as const;

/** Zero serious or critical axe violations on every page, on every surface, light and dark. */
for (const path of PAGES) {
  for (const surface of SURFACES) {
    for (const theme of THEMES) {
      test(`axe: ${path} on ${surface} (${theme})`, async ({ page, context, baseURL }) => {
        test.skip(test.info().project.name !== "desktop" && (surface !== "poster" || theme !== "light"), "phone runs the default surface only");
        await context.addCookies([
          { name: "plop-surface", value: surface, url: baseURL! },
          { name: "plop-theme", value: theme, url: baseURL! },
        ]);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(
          blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length}x) e.g. ${v.nodes[0]?.target.join(" ")}`),
        ).toEqual([]);
      });
    }
  }
}
