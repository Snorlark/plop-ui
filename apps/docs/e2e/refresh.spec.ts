import { expect, test } from "@playwright/test";

/**
 * Refresh bug: reloading the home page scrolled down to "The whole pack" flashed the hero. WebKit (Safari)
 * paints the first frame at the top and restores the scroll a moment later; Chromium restores first.
 * Every frame after a reload must be either hidden or at the restored place.
 */
test("reloading mid-page never shows the top of the page first", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop scroll");
  await page.addInitScript(() => {
    const w = window as unknown as { __frames: Array<[number, boolean]> };
    w.__frames = [];
    const tick = () => {
      const hidden = document.documentElement.hasAttribute("data-restoring") || !document.body || getComputedStyle(document.body).visibility === "hidden";
      w.__frames.push([Math.round(scrollY), hidden]);
      if (w.__frames.length < 60) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/");
  await page.getByText("Thirty pieces.").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const at = await page.evaluate(() => scrollY);
  expect(at).toBeGreaterThan(600);
  for (let i = 0; i < 3; i++) {
    await page.reload();
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => (window as unknown as { __frames: Array<[number, boolean]> }).__frames);
    const shownAtTop = frames.filter(([y, hidden]) => !hidden && y < at - 200);
    expect(shownAtTop, `reload ${i}: ${JSON.stringify(frames.slice(0, 8))}`).toHaveLength(0);
    expect(Math.abs((await page.evaluate(() => scrollY)) - at)).toBeLessThan(40);
  }
});
