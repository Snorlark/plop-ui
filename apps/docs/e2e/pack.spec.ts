import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The middle of an element, where a person would grab it (tilted stickers' box corners are outside them).
 * Waits until it stops moving first: the tear strip springs back for a moment after a short pull, and a
 * grab measured mid-spring lands on the page behind it.
 */
async function center(el: Locator) {
  let last = "";
  await expect
    .poll(async () => {
      const box = await el.boundingBox();
      const now = JSON.stringify(box && [Math.round(box.x), Math.round(box.y)]);
      const still = now === last;
      last = now;
      return still;
    }, { intervals: [100] })
    .toBe(true);
  const b = (await el.boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
async function dragBy(page: Page, el: Locator, dx: number, dy: number) {
  const c = await center(el);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(c.x + (dx * i) / 10, c.y + (dy * i) / 10);
  await page.mouse.up();
}

test("Sticker pack: tear it open with the button from the keyboard, press and drag the stickers, put them back", async ({ page, isMobile }) => {
  test.skip(isMobile, "dragging uses a mouse");
  await page.goto("/");
  const pack = page.locator(".pack");
  const strip = page.getByRole("button", { name: "Tear it open" });
  await expect(pack).toHaveAttribute("data-state", "sealed");
  // Sealed: the stickers are behind the plastic, out of reach.
  await expect(page.locator(".pack__sheet")).toHaveJSProperty("inert", true);

  // Retry: a press that lands before hydration does nothing on a slow runner.
  await expect(async () => {
    await strip.focus();
    await page.keyboard.press("Enter");
    await expect(pack).not.toHaveAttribute("data-state", "sealed", { timeout: 1000 });
  }).toPass();
  await expect(pack).toHaveAttribute("data-state", "open");
  await expect(page.locator(".pack__sheet a, .pack__sheet button").first()).toBeFocused();

  // A press still does the real thing.
  const sw = page.locator(".pack__sheet").getByRole("switch");
  const before = await sw.getAttribute("aria-checked");
  await sw.click();
  await expect(sw).not.toHaveAttribute("aria-checked", before!);

  // A drag moves the sticker and is not a press.
  const sticker = page.locator(".pack-sticker").filter({ has: page.getByRole("switch") });
  const start = await center(sticker);
  const checked = await sw.getAttribute("aria-checked");
  await dragBy(page, sticker, -160, 120);
  await expect.poll(async () => (await center(sticker)).x).toBeLessThan(start.x - 100);
  await expect(sw).toHaveAttribute("aria-checked", checked!);

  // Put them back: sealed again, focus back on the strip.
  await page.getByRole("button", { name: "Put them back" }).click();
  await expect(pack).toHaveAttribute("data-state", "sealed");
  await expect(strip).toBeFocused();
});

test("Sticker pack: pulling the top strip a little snaps back; pulling it far tears the pack open", async ({ page, isMobile }) => {
  test.skip(isMobile, "pulling uses a mouse");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const pack = page.locator(".pack");
  const strip = page.locator(".pack__tear");
  await strip.scrollIntoViewIfNeeded();
  // A short pull: it follows, then springs back and the pack stays sealed.
  await dragBy(page, strip, 30, -20);
  await expect(pack).toHaveAttribute("data-state", "sealed");
  // A long pull: it rips off. Retry: a pull that starts before hydration does nothing on a slow runner.
  await expect(async () => {
    await dragBy(page, strip, 120, -160);
    await expect(pack).not.toHaveAttribute("data-state", "sealed", { timeout: 1000 });
  }).toPass();
  await expect(pack).toHaveAttribute("data-state", "open");
});
