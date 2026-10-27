import { expect, test, type Page } from "@playwright/test";

/** The Playground's sticker board: undo, layout, the editor, placement, every component. */

const board = (page: Page) => page.getByRole("application", { name: /Sticker board/ });
const count = async (page: Page) => Number((await board(page).getAttribute("aria-label"))!.match(/(\d+) sticker/)![1]);

async function fresh(page: Page) {
  await page.goto("/playground?tool=board");
  await page.evaluate(() => localStorage.removeItem("plop-board-v1"));
  await page.reload();
  await expect(board(page)).toBeVisible();
}

test.describe("sticker board", () => {
  test.skip(({ isMobile }) => isMobile, "desktop covers the board; the phone sheet has its own test");

  test("undo and redo an added sticker", async ({ page }) => {
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    await expect.poll(() => count(page)).toBe(1);
    await board(page).focus();
    await page.keyboard.press("ControlOrMeta+z");
    await expect.poll(() => count(page)).toBe(0);
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect.poll(() => count(page)).toBe(1);
  });

  test("one drag is one undo step", async ({ page }) => {
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    const sticker = board(page).locator("[data-sticker]").first();
    const before = await sticker.evaluate((el) => (el as HTMLElement).style.left);
    const b = (await sticker.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2);
    await page.mouse.up();
    expect(await sticker.evaluate((el) => (el as HTMLElement).style.left)).not.toBe(before);
    await board(page).focus();
    await page.keyboard.press("ControlOrMeta+z");
    await expect.poll(() => sticker.evaluate((el) => (el as HTMLElement).style.left)).toBe(before);
    await expect.poll(() => count(page)).toBe(1);
  });

  test("clear is undoable", async ({ page }) => {
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    await page.getByRole("button", { name: "Add IconButton", exact: true }).click();
    await expect.poll(() => count(page)).toBe(2);
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect.poll(() => count(page)).toBe(0);
    // The toast and its screen-reader announcement both carry the words.
    await expect(page.getByText("Board cleared. Undo brings it back.").first()).toBeVisible();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect.poll(() => count(page)).toBe(2);
  });

  test("an old saved board still loads", async ({ page }) => {
    await page.goto("/playground?tool=board");
    await page.evaluate(() =>
      localStorage.setItem(
        "plop-board-v1",
        JSON.stringify({ paper: "kraft", items: [{ id: "s1", kind: "button", x: 50, y: 50, tilt: -2, scale: 1, z: 1, props: { label: "Old one", variant: "ink", mood: "none" } }] }),
      ),
    );
    await page.reload();
    await expect.poll(() => count(page)).toBe(1);
    await expect(board(page)).toContainText("Old one");
  });
});
