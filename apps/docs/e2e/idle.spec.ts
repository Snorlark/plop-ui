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
