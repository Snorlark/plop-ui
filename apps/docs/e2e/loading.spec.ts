import { expect, test } from "@playwright/test";

/**
 * /lab/loading: 150 spinners, 24 skeleton rows and 8 sweeping bars at once.
 * Every looping animation must be one the compositor can run (transform or opacity only), so a page full of
 * loaders never costs the main thread a frame. A stroke-dash or SVG-child animation here once dropped 300
 * spinners to 9 fps.
 */
test("loading pieces only loop transforms and opacity", async ({ page }) => {
  await page.goto("/lab/loading");
  await page.waitForLoadState("networkidle");
  const offenders = await page.getByTestId("loading-lab").evaluate((root) => {
    const ok = new Set(["transform", "opacity", "offset", "easing", "composite", "computedOffset"]);
    return document
      .getAnimations()
      .filter((a) => a.effect instanceof KeyframeEffect && a.effect.target && root.contains(a.effect.target))
      .filter((a) => (a.effect as KeyframeEffect).getTiming().iterations === Infinity)
      .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k).filter((p) => !ok.has(p)).map((p) => `${(a as CSSAnimation).animationName}: ${p}`)));
  });
  expect([...new Set(offenders)]).toEqual([]);
});

/** Frame gaps over two seconds of requestAnimationFrame. */
const frameGaps = () =>
  new Promise<number[]>((resolve) => {
    const t: number[] = [];
    const start = performance.now();
    const tick = (now: number) => {
      t.push(now);
      if (now - start < 2000) requestAnimationFrame(tick);
      else resolve(t.slice(1).map((x, i) => x - t[i]!));
    };
    requestAnimationFrame(tick);
  });

test("a page full of loaders keeps its frame rate", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "frame timing is only steady enough in Chromium");
  // The baseline is an empty page on the same machine: Low Power Mode or a busy CI runner caps both alike.
  await page.goto("/privacy");
  await page.waitForLoadState("networkidle");
  const base = (await page.evaluate(frameGaps)).length / 2;
  await page.goto("/lab/loading");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  const gaps = await page.evaluate(frameGaps);
  const fps = gaps.length / 2;
  expect(fps, `frames per second (an idle page ran ${base})`).toBeGreaterThan(base * 0.8);
  expect(gaps.filter((g) => g > 100).length, "frames over 100 ms").toBeLessThan(3);
});
