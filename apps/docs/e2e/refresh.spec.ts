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

// Reported on Android (Chrome and Firefox): pages "landing at the bottom". The saved place was keyed by the
// address the visitor arrived on, so after moving around by links and reloading, a reload restored another page's position.
test("a reload restores this page's place, not the page you arrived on", async ({ page }) => {
  const go = (href: string) => page.locator(`a[href='${href}']`).first().evaluate((a: HTMLAnchorElement) => a.click());
  await page.goto("/docs/getting-started");
  await go("/docs/components/button");
  await page.waitForURL(/components\/button/);
  await page.evaluate(() => scrollTo({ top: 3000, behavior: "instant" }));
  await page.waitForTimeout(300);
  // A reload here (pull to refresh) is what used to file this page's 3000 under /docs/getting-started.
  await page.reload();
  await page.waitForTimeout(1800);
  await go("/docs/getting-started");
  await page.waitForURL(/getting-started/);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.reload();
  await page.waitForTimeout(1800);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(50);
});

test("phones: picking a page in Browse the docs folds the list and starts at the title", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the Browse the docs list is phone-only");
  await page.goto("/docs/getting-started");
  const list = page.locator("details.doc-nav-mobile");
  await list.locator("summary").click();
  await list.getByRole("link", { name: "Button", exact: true }).click();
  await page.waitForURL(/components\/button/);
  await expect(list).not.toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBeLessThan(400);
});
