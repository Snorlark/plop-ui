import { expect, test } from "@playwright/test";

// A page nobody is touching should do no work: looping scenes play only while they're on screen (#67).
// Counts layouts and style recalcs over 2 s through the Chrome DevTools Protocol, so Chromium only.
for (const path of ["/docs/getting-started", "/docs/components/button", "/playground"]) {
  test(`idle: ${path} does no layout or style work with the footer off screen`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "needs the Chrome DevTools Protocol");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Performance.enable");
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
    const a = await metrics();
    await page.waitForTimeout(2000);
    const z = await metrics();
    // Before #67 the footer alone caused 60 layouts and ~580 style recalcs a second here.
    expect(z.LayoutCount! - a.LayoutCount!, "layouts in 2 s").toBeLessThan(10);
    expect(z.RecalcStyleCount! - a.RecalcStyleCount!, "style recalcs in 2 s").toBeLessThan(20);
  });
}

// On screen the factory plays. Its loops are CSS keyframes (#85): one style pass a frame, where the old
// SMIL loops took about ten (~1,300 recalcs in 2 s). Chromium still lays out the SVG each frame while a
// shape inside it moves, so this guards style work, not layouts.
test("footer on screen: the factory's loops cost one style pass a frame", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "needs the Chrome DevTools Protocol");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await page.goto("/docs/getting-started");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.locator("footer .fx").first().waitFor({ state: "attached" });
  await page.waitForTimeout(1500);
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const a = await metrics();
  await page.waitForTimeout(2000);
  const z = await metrics();
  expect(z.RecalcStyleCount! - a.RecalcStyleCount!, "style recalcs in 2 s").toBeLessThan(300);
});

test("footer: the pause button stops the factory's loops", async ({ page }) => {
  await page.goto("/docs/getting-started");
  await page.locator("footer").scrollIntoViewIfNeeded();
  const loop = page.locator("footer .fx").first();
  await loop.waitFor({ state: "attached" });
  const state = () => loop.evaluate((el) => getComputedStyle(el).animationPlayState);
  await expect.poll(state).toContain("running");
  await page.getByRole("button", { name: "Pause the factory" }).click();
  await expect.poll(state).toContain("paused");
});
