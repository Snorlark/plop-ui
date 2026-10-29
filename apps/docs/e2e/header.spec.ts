import { expect, test, type Page } from "@playwright/test";

/** The header's mega menu on wide screens (phones get the sheet instead). */

const trigger = (page: Page, name: string) => page.locator("header").getByRole("button", { name: new RegExp(`^${name}`) }).first();

test("switching menus swaps the links in place instead of blanking and fading them back", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the sheet");
  await page.goto("/");
  await trigger(page, "Components").hover();
  await expect(trigger(page, "Components")).toHaveAttribute("aria-expanded", "true");
  await page.waitForTimeout(600);
  await trigger(page, "Guides").hover();
  const panel = page.locator(`#${await trigger(page, "Guides").getAttribute("aria-controls")}`);
  await expect(panel).toBeVisible();
  // The first frame the new menu shows: every link already readable (opacity is multiplied down the tree).
  const faintest = await panel.evaluate((el) =>
    Math.min(
      ...[...el.querySelectorAll("a")].map((a) => {
        let o = 1;
        for (let n: Element | null = a; n && n !== el.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      }),
    ),
  );
  expect(faintest).toBeGreaterThan(0.9);
});
