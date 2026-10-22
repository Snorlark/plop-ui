import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { PAGES, SURFACES, THEMES } from "./pages";

async function blocking(page: Page) {
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.help} (${v.nodes.length}x) e.g. ${v.nodes[0]?.target.join(" ")}`);
}

/** Zero serious or critical axe violations on every page of the site. */
for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await blocking(page)).toEqual([]);
  });
}

/** A header menu while it's open. */
test("axe: header menu open", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  else await page.getByRole("button", { name: "Components" }).click();
  expect(await blocking(page)).toEqual([]);
});

/** The kit and the playground render on every paper, light and dark: check them all. */
for (const surface of SURFACES) {
  for (const theme of THEMES) {
    test(`axe: /kit on ${surface} (${theme})`, async ({ page, context, baseURL }) => {
      test.skip(test.info().project.name !== "desktop", "desktop runs the surface matrix");
      await context.addCookies([
        { name: "plop-surface", value: surface, url: baseURL! },
        { name: "plop-theme", value: theme, url: baseURL! },
      ]);
      await page.goto("/kit");
      expect(await blocking(page)).toEqual([]);
    });

    test(`axe: /playground on ${surface} (${theme})`, async ({ page }) => {
      test.skip(test.info().project.name !== "desktop", "desktop runs the surface matrix");
      await page.goto(`/playground?c=button&surface=${surface}&theme=${theme}`);
      expect(await blocking(page)).toEqual([]);
    });
  }
}
