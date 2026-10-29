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

test("moving down into the open menu across another trigger doesn't replay or close it", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the sheet");
  await page.goto("/");
  await trigger(page, "Components").hover();
  await expect(trigger(page, "Components")).toHaveAttribute("aria-expanded", "true");
  await trigger(page, "Guides").hover();
  await expect(trigger(page, "Guides")).toHaveAttribute("aria-expanded", "true");
  await page.waitForTimeout(500);
  const panel = page.locator(`#${await trigger(page, "Guides").getAttribute("aria-controls")}`);
  // On the way down to the card the pointer brushes the next trigger, then lands in the open sheet.
  await trigger(page, "Playground").hover();
  await page.waitForTimeout(40);
  await panel.getByText("Seeded wobble").hover();
  await page.waitForTimeout(300);
  await expect(trigger(page, "Guides")).toHaveAttribute("aria-expanded", "true");
  await expect(panel).not.toHaveAttribute("data-fresh");
  await expect(panel).not.toHaveAttribute("data-leaving");
});
