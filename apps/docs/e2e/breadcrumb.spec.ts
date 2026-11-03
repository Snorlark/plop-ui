import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/docs/components/breadcrumb", "/docs/components/button", "/docs/getting-started"]) {
  test(`breadcrumb above the title on ${path}`, async ({ page }) => {
    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
    await expect(nav.locator("ol")).toBeVisible();
    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveText(path === "/docs/getting-started" ? "Installation" : (await page.locator("h1").textContent())!.trim());
    await expect(current).not.toHaveJSProperty("tagName", "A");
    const navBox = await nav.boundingBox();
    const headingBox = await page.locator("h1").boundingBox();
    expect(navBox!.y + navBox!.height).toBeLessThanOrEqual(headingBox!.y);
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/");
  });
}

test("narrow trail hides parents until keyboard disclosure; resize restores them", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/docs/components/button");
  const nav = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
  const docs = nav.getByRole("link", { name: "Docs", exact: true, includeHidden: true });
  await expect(docs).toBeHidden();
  const toggle = nav.getByRole("button");
  await expect(toggle).toHaveAccessibleName("Show intermediate pages");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toBeFocused();
  await expect(docs).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(docs).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Space");
  await expect(docs).toBeHidden();
  await expect(toggle).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(docs).not.toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(docs).toBeVisible();
  await expect(toggle).toBeHidden();
  await docs.click();
  await expect(page).toHaveURL(/\/docs\/what-is-plopui$/);
});


test("breadcrumb docs pass axe under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/breadcrumb");
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page }).include("#main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});
