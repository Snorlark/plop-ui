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

test.describe("board-first layout", () => {
  test.skip(({ isMobile }) => isMobile, "sizes are set per test");

  for (const [w, h] of [[1280, 720], [375, 740]] as const) {
    test(`board and tray fit without scrolling at ${w}×${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await fresh(page);
      const b = (await board(page).boundingBox())!;
      expect(b.y + b.height).toBeLessThanOrEqual(h);
      expect(b.height).toBeGreaterThan(h * 0.3);
      const tile = page.getByRole("button", { name: "Add Button", exact: true });
      const t = (await tile.boundingBox())!;
      expect(t.y + t.height).toBeLessThanOrEqual(h);
    });
  }

  test("stickers on the board are not tab stops", async ({ page }) => {
    await fresh(page);
    for (const name of ["Add Button", "Add Switch", "Add Checkbox"]) await page.getByRole("button", { name, exact: true }).click();
    await expect.poll(() => count(page)).toBe(3);
    await board(page).focus();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("[role=application]"))).toBe(false);
  });

  test("clicking a sticker selects it instead of using it", async ({ page }) => {
    await fresh(page);
    await page.getByRole("button", { name: "Add Switch", exact: true }).click();
    await board(page).focus();
    await page.keyboard.press("Escape");
    const sw = board(page).getByRole("switch", { includeHidden: true });
    const before = await sw.getAttribute("aria-checked");
    await board(page).locator("[data-sticker]").first().click();
    await expect(board(page)).toHaveAttribute("aria-label", /Switch.*selected/);
    expect(await sw.getAttribute("aria-checked")).toBe(before);
  });

  test("the radius slider rounds the board and its code", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "reads the clipboard");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    await page.getByRole("slider", { name: /Radius/ }).fill("0");
    const btn = board(page).locator("[data-sticker] button").first();
    await expect.poll(() => btn.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("0px");
    await page.getByRole("button", { name: "Copy board code" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toMatch(/roundness=\{0\}/);
  });

  test("no Ride-along badge on the Playground", async ({ page }) => {
    await fresh(page);
    await expect(page.getByRole("button", { name: /New here\?/ })).toHaveCount(0);
  });
});

test.describe("editor beside the sticker", () => {
  test.skip(({ isMobile }) => isMobile, "sizes are set per test");
  const editor = (page: Page) => page.getByRole("dialog", { name: /Button|Switch/ });

  test("opens next to the selected sticker", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    const s = (await board(page).locator("[data-sticker]").first().boundingBox())!;
    const e = (await editor(page).boundingBox())!;
    const overlaps = s.x < e.x + e.width && e.x < s.x + s.width && s.y < e.y + e.height && e.y < s.y + s.height;
    expect(overlaps).toBe(false);
    const beside = Math.abs(e.x - (s.x + s.width)) <= 40 || Math.abs(e.x + e.width - s.x) <= 40;
    expect(beside).toBe(true);
    expect(e.x).toBeGreaterThanOrEqual(0);
    expect(e.x + e.width).toBeLessThanOrEqual(1280);
  });

  test("stays inside the board near its edge", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    await board(page).focus();
    for (let i = 0; i < 9; i++) await page.keyboard.press("Shift+ArrowRight");
    for (let i = 0; i < 9; i++) await page.keyboard.press("Shift+ArrowDown");
    const b = (await board(page).boundingBox())!;
    const e = (await editor(page).boundingBox())!;
    expect(e.x).toBeGreaterThanOrEqual(b.x - 1);
    expect(e.y).toBeGreaterThanOrEqual(b.y - 1);
    expect(e.x + e.width).toBeLessThanOrEqual(b.x + b.width + 1);
    expect(e.y + e.height).toBeLessThanOrEqual(b.y + b.height + 1);
  });

  test("phones get a bottom sheet", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 740 });
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    const sheet = editor(page);
    await expect(sheet).toBeVisible();
    const e = (await sheet.boundingBox())!;
    expect(e.y + e.height).toBeGreaterThan(740 - 4);
    expect(e.width).toBeGreaterThan(375 - 40);
  });

  test("typing in the editor doesn't drive the board", async ({ page }) => {
    await fresh(page);
    await page.getByRole("button", { name: "Add Button", exact: true }).click();
    const words = editor(page).getByLabel("Words");
    await words.fill("Post it");
    await words.press("Backspace");
    await words.press("ControlOrMeta+z");
    await expect.poll(() => count(page)).toBe(1);
    await expect(board(page)).toContainText(/Post i/);
  });
});
