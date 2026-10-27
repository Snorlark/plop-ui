import { expect, test, type Locator, type Page } from "@playwright/test";

/** /lab/stress: components placed the way real apps place them (stretched by grid and flex parents). */

const scope = (page: Page, id: string) => page.getByTestId(id);

test("a stretching grid or flex row doesn't blow sticker controls up", async ({ page }) => {
  await page.goto("/lab/stress");
  for (const id of ["grid-light", "row"]) {
    for (const el of await scope(page, id).locator("button, a").filter({ hasText: /Post sketch|Open the sketchbook|Row button/ }).all()) {
      const b = (await el.boundingBox())!;
      expect(b.height, `${id}: height`).toBeLessThan(90);
    }
    const btn = scope(page, id).getByRole("button", { name: /Post sketch|Row button/ });
    const container = (await scope(page, id).boundingBox())!;
    expect((await btn.boundingBox())!.width).toBeLessThan(container.width * 0.6);
  }
});

/** Points inside a control at rest that fall outside it while hovered: a pointer resting there makes it shake. */
async function loopPoints(page: Page, el: Locator) {
  // Instant: under the site's smooth scrolling the page would still be moving while the points are measured.
  await el.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.mouse.move(1, 1);
  await page.waitForTimeout(400);
  const handle = await el.elementHandle();
  const rest = await page.evaluate((e) => {
    const r = e!.getBoundingClientRect();
    const pts: Array<[number, number]> = [];
    for (let x = r.left; x <= r.right; x += 2) for (let y = r.top; y <= r.bottom; y += 2) {
      const hit = document.elementFromPoint(x, y);
      if (hit && e!.contains(hit)) pts.push([x, y]);
    }
    return pts;
  }, handle);
  const [cx, cy] = rest[Math.floor(rest.length / 2)]!;
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(600);
  return page.evaluate(
    ([e, pts]) => (pts as Array<[number, number]>).filter(([x, y]) => { const hit = document.elementFromPoint(x, y); return !hit || !(e as Element).contains(hit); }).length,
    [handle, rest] as const,
  );
}

test("hovering near a control's edge never makes it shake", async ({ page, isMobile }) => {
  test.skip(isMobile, "hover needs a mouse");
  await page.goto("/lab/stress");
  const s = scope(page, "grid-light");
  for (const name of ["Post sketch", "New sketch", "Sketch actions"]) {
    const el = s.getByRole("button", { name, exact: true });
    expect(await loopPoints(page, el), name).toBe(0);
  }
  expect(await loopPoints(page, s.getByRole("button", { name: /^Brush/ })), "Select").toBe(0);
  expect(await loopPoints(page, s.getByRole("tab", { name: "Ink" })), "Tab").toBe(0);
});
