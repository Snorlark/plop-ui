import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const live = (page: Page) => page.getByTestId("live");
const pager = (page: Page) => live(page).getByRole("navigation", { name: "Pagination", exact: true });
const pick = (page: Page, name: string) => live(page).getByRole("radio", { name, exact: true }).check({ force: true });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab/pagination");
});

test("fast paging lands on the last page picked, then focuses the results", async ({ page }) => {
  // Keyboard, not clicks: Next shifts sideways as the page window changes, so rapid clicks at a fixed spot can miss it.
  await pager(page).getByRole("button", { name: "Next", exact: true }).focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("Enter");
  await expect(pager(page)).toHaveAttribute("aria-busy", "true");
  await expect(pager(page)).not.toHaveAttribute("aria-busy");
  await expect(pager(page).locator('[aria-current="page"]')).toHaveAccessibleName("Page 7");
  await expect(live(page).getByText("#1072")).toBeVisible();
  await expect(page.locator("#queue-h")).toBeFocused();
});

test("error, empty and slow states use kit components", async ({ page }) => {
  await pick(page, "Error");
  await pager(page).getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(live(page).getByRole("alert")).toContainText("Couldn't load page 2");
  await expect(live(page).getByRole("button", { name: /Try again/ })).toBeVisible();

  await pick(page, "Slow network");
  await pager(page).getByRole("button", { name: "Page 3", exact: true }).click();
  await expect(live(page).locator('li[aria-hidden="true"]').first()).toBeVisible();
  await expect(pager(page).locator('[aria-current="page"]')).toHaveAttribute("aria-busy", "true");

  await pick(page, "No results");
  await expect(live(page).getByRole("navigation")).toHaveCount(0);
  await expect(live(page)).toContainText("No incidents");
});

test("recipes stay in sync: go to page validates, First/Last and Select step together", async ({ page }) => {
  const input = page.locator('input[name="goto"]');
  await input.fill("99");
  await input.press("Enter");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill("14");
  await input.press("Enter");
  await expect(page.getByRole("navigation", { name: "Go to pages" }).locator('[aria-current="page"]')).toHaveAccessibleName("Page 14");

  const ends = page.getByRole("navigation", { name: "Ends", exact: true });
  await ends.getByRole("button", { name: "Last" }).focus();
  await page.keyboard.press("Enter");
  await expect(ends.getByRole("button", { name: "Last" })).toBeDisabled();
  await expect(ends.locator('[aria-current="page"]')).toHaveAccessibleName("Page 40");

  const dropdown = page.getByRole("navigation", { name: "Dropdown pages" });
  await dropdown.getByRole("button", { name: "Next" }).click();
  await expect(dropdown).toContainText("2 of 24");
});

test("no horizontal scroll on a phone, and no axe violations in light or dark", async ({ page }) => {
  test.slow(); // two axe passes over 60+ paginations take over 30s on CI firefox
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const scan = () => new AxeBuilder({ page }).include('[data-testid="pagination-lab"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect((await scan()).violations).toEqual([]);
  await page.getByRole("switch", { name: "Dark" }).click({ force: true });
  await expect(page.getByTestId("pagination-lab").locator("xpath=ancestor::*[@data-plop-theme][1]")).toHaveAttribute("data-plop-theme", "dark");
  expect((await scan()).violations).toEqual([]);
});
