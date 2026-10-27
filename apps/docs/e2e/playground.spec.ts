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
    // The rounded corners live on the sticker's paper layer, not on the <button> itself.
    const paper = board(page).locator("[data-sticker] [class*=Sticker_paper]").first();
    expect(await paper.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).not.toBe("0px");
    await page.getByRole("slider", { name: /Radius/ }).fill("0");
    await expect.poll(() => paper.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("0px");
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

for (const [w, h] of [[1280, 720], [375, 740]] as const)
test(`new stickers don't land on each other at ${w}×${h}`, async ({ page, isMobile }) => {
  test.skip(isMobile, "sizes are set per test");
  await page.setViewportSize({ width: w, height: h });
  await fresh(page);
  for (const name of ["Add Button", "Add Button with Bix", "Add IconButton", "Add Switch", "Add Checkbox"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await board(page).focus();
    await page.keyboard.press("Escape");
  }
  const boxes = await board(page).locator("[data-sticker] > *").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
  expect(boxes).toHaveLength(5);
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!, b = boxes[j]!;
      const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const smaller = Math.min(a.width * a.height, b.width * b.height);
      expect((w * h) / smaller, `stickers ${i} and ${j}`).toBeLessThanOrEqual(0.2);
    }
});

test.describe("every component", () => {
  test.skip(({ isMobile }) => isMobile, "desktop board");
  const SHELF: Record<string, string> = {
    Tooltip: "Actions", Menu: "Actions",
    StatusDot: "Status",
    TicketCard: "Cards", UnitCard: "Cards", StickyNote: "Cards",
    TextField: "Forms", TextArea: "Forms", SearchField: "Forms", RadioGroup: "Forms",
    Select: "Pickers", MultiSelect: "Pickers", Tabs: "Pickers",
    Heading: "Words & doodles",
  };

  test("every component can go on the board, with its code", async ({ page }) => {
    await fresh(page);
    let n = 0;
    for (const [name, shelf] of Object.entries(SHELF)) {
      await page.getByRole("radio", { name: shelf, exact: true }).check();
      await page.getByRole("button", { name: `Add ${name}`, exact: true }).click();
      await expect.poll(() => count(page)).toBe(++n);
      const editor = page.getByRole("dialog", { name });
      await editor.locator("summary", { hasText: "Code" }).click();
      await expect(editor.locator("pre")).toContainText(`<${name}`);
      await editor.getByRole("button", { name: "Done" }).click();
    }
  });

  test("every visible word is editable", async ({ page }) => {
    await fresh(page);
    const cases: Array<[string, string, string, string]> = [
      ["Actions", "IconButton", "Label", "Start a doodle"],
      ["Status", "StatusTimeline", "Steps", "Draft, Done"],
      ["Cards", "TicketCard", "Title", "Sketch #77"],
      ["Pickers", "Select", "Label", "Pick a pen"],
      ["Actions", "Menu", "Items", "Rename, Share"],
    ];
    for (const [shelf, name, field, text] of cases) {
      await page.getByRole("radio", { name: shelf, exact: true }).check();
      await page.getByRole("button", { name: `Add ${name}`, exact: true }).click();
      const editor = page.getByRole("dialog", { name });
      await editor.getByLabel(field, { exact: true }).fill(text);
      const sticker = board(page).locator("[data-sticker]").last();
      if (name === "IconButton") await expect(sticker.locator(`[aria-label="${text}"]`)).toHaveCount(1);
      else if (name === "Menu") {
        // A closed menu shows only its button; its items are checked in the code below.
      }
      else await expect(sticker).toContainText(text.split(",")[0]!);
      if (name === "Menu") {
        await editor.locator("summary", { hasText: "Code" }).click();
        await expect(editor.locator("pre")).toContainText("Rename");
      }
      await editor.getByRole("button", { name: "Done" }).click();
    }
  });
});

test.describe("tweak a component", () => {
  test.skip(({ isMobile }) => isMobile, "desktop layout");
  const picker = (page: Page) => page.getByRole("navigation", { name: "Components" });

  test("lists every component", async ({ page }) => {
    await page.goto("/playground?tool=tweak");
    for (const name of ["Button", "IconButton", "Tag", "Switch", "Checkbox", "StatusTimeline", "Callout", "Progress", "Avatar", "TextField", "Toast",
      "Tooltip", "RadioGroup", "Tabs", "TicketCard", "UnitCard", "StickyNote", "Select", "MultiSelect", "Menu", "TextArea", "SearchField", "StatusDot", "Heading"])
      await expect(picker(page).getByRole("button", { name, exact: true })).toHaveCount(1);
  });

  test("the preview stays in view while editing", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/playground?tool=tweak&c=button");
    await page.getByRole("button", { name: /^Burst/ }).scrollIntoViewIfNeeded();
    const p = (await page.getByRole("region", { name: "Button preview" }).boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y + 40).toBeLessThanOrEqual(720);
  });

  test("Burst uses the kit's Select, no native select", async ({ page }) => {
    await page.goto("/playground?tool=tweak&c=button");
    await expect(page.getByRole("button", { name: /^Burst/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Props" }).locator("select")).toHaveCount(0);
  });

  test("radius rounds the preview and shows in the code", async ({ page }) => {
    await page.goto("/playground?tool=tweak&c=button");
    const paper = page.getByRole("region", { name: "Button preview" }).locator("[class*=Sticker_paper]").first();
    expect(await paper.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).not.toBe("0px");
    // Retry: a value set before hydration doesn't reach React on a slow first load.
    await expect(async () => {
      await page.getByRole("slider", { name: "Radius" }).fill("0");
      await expect(page.locator(".pg-radius output")).toHaveText("0×", { timeout: 1000 });
    }).toPass();
    await expect.poll(() => paper.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe("0px");
    await expect(page.getByRole("region", { name: "Code" }).locator("pre")).toContainText("roundness={0}");
  });
});
