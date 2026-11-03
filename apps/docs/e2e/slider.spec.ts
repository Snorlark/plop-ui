import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SURFACES, THEMES } from "./pages";

test("native keyboard adjustment, press feedback and disabled tab order", async ({ page, browserName }) => {
  await page.goto("/docs/components/slider");
  const pressure = page.getByRole("slider", { name: "Pencil pressure" });
  await pressure.focus();
  await expect(pressure).toBeFocused();
  await page.keyboard.down("ArrowRight");
  await expect(pressure).toHaveValue("41");
  await expect(pressure).toHaveAttribute("data-pressed", "");
  await page.keyboard.up("ArrowRight");
  await expect(pressure).not.toHaveAttribute("data-pressed");
  await page.keyboard.press("Home");
  await expect(pressure).toHaveValue("0");
  await page.keyboard.press("ArrowLeft");
  await expect(pressure).toHaveValue("0");
  await page.keyboard.press("End");
  await expect(pressure).toHaveValue("100");
  await page.keyboard.press("ArrowRight");
  await expect(pressure).toHaveValue("100");
  // Safari uses Option+Tab for all controls when full keyboard access is off.
  const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
  await page.keyboard.press(tab);
  const radius = page.getByRole("slider", { name: "Radius" });
  await expect(radius).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(radius).toHaveValue("0.9");
  await expect(radius).toHaveAttribute("aria-valuetext", "0.9×");
  await expect(page.getByText("0.9×", { exact: true })).toBeVisible();
  await page.keyboard.press(tab);
  await expect(page.getByRole("slider", { name: "Volume" })).not.toBeFocused();
});

test("native pointer and touch track interaction updates the marker and value", async ({ page, isMobile }) => {
  await page.goto("/docs/components/slider");
  const slider = page.getByRole("slider", { name: "Pencil pressure" });
  await slider.scrollIntoViewIfNeeded();
  const box = (await slider.boundingBox())!;
  const x = box.x + 16 + (box.width - 32) * 0.8;
  const y = box.y + box.height / 2;
  if (isMobile) await page.touchscreen.tap(x, y);
  else {
    await page.mouse.move(box.x + 16 + (box.width - 32) * 0.4, y);
    await page.mouse.down();
    await page.mouse.move(x, y, { steps: 8 });
    await page.mouse.up();
  }
  await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(60);
  await expect.poll(async () => Number(await slider.inputValue())).toBeLessThan(100);
  const value = await slider.inputValue();
  await expect(page.getByText(value, { exact: true })).toBeVisible();
  const clip = slider.locator("..").locator("clipPath rect");
  expect(Number(await clip.getAttribute("width"))).toBeCloseTo(Number(value) * 3 + 10, 4);
});

for (const tool of ["board", "tweak"]) {
  test(`Playground ${tool} radius uses Slider and updates the provider`, async ({ page }) => {
    await page.goto(`/playground?tool=${tool}`);
    const slider = page.getByRole("slider", { name: "Radius", exact: true });
    await expect(slider.locator("..").locator("svg")).toBeAttached();
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("2");
    await expect(slider).toHaveAttribute("aria-valuetext", "2×");
    const target = tool === "board" ? page.getByRole("application", { name: /Sticker board/ }) : page.locator(".pg-stage");
    await expect(target).toHaveCSS("--plop-roundness", "2");
    await page.keyboard.press("Home");
    await expect(target).toHaveCSS("--plop-roundness", "0");
  });
}

test("reduced motion keeps adjustment immediate without thumb transforms", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/slider");
  const slider = page.getByRole("slider", { name: "Pencil pressure" });
  await slider.focus();
  await page.keyboard.down("ArrowRight");
  await expect(slider).toHaveValue("41");
  const pseudo = await slider.evaluate((el) => {
    const thumb = getComputedStyle(el, navigator.userAgent.includes("Firefox") ? "::-moz-range-thumb" : "::-webkit-slider-thumb");
    return { transition: thumb.transitionDuration, transform: thumb.transform };
  });
  // Chromium/WebKit do not expose native thumb styles consistently; Firefox does.
  if (pseudo.transform) expect(pseudo.transform).toBe("none");
  await page.keyboard.up("ArrowRight");
  const results = await new AxeBuilder({ page }).include("#main").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
});

for (const surface of SURFACES) for (const theme of THEMES) {
  test(`slider contrast on ${surface} ${theme}`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "one browser covers the surface matrix");
    await page.goto(`/playground?c=slider&surface=${surface}&theme=${theme}`);
    await expect(page.locator(".pg-stage").getByRole("slider")).toBeVisible();
    const results = await new AxeBuilder({ page }).include(".pg-stage").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}


test("marker fill ends at the native thumb at 17% and 72%", async ({ page }) => {
  await page.goto("/docs/components/slider");
  const slider = page.getByRole("slider", { name: "Pencil pressure" });
  for (const value of [17, 72]) {
    await slider.focus();
    await page.keyboard.press("Home");
    for (let i = 0; i < value; i++) await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue(String(value));
    // Sample the actual painted marker, catching dash wrapping and fill lagging behind the thumb.
    const png = await slider.locator("..").locator("svg").screenshot();
    const colors = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      return [0.05, 0.6, 0.95].map((ratio) => Array.from(ctx.getImageData(Math.round(image.width * ratio), Math.floor(image.height / 2), 1, 1).data));
    }, png.toString("base64"));
    const isInk = (pixel: number[]) => pixel[2]! > pixel[0]! * 2;
    expect(isInk(colors[0]!)).toBe(true);
    expect(isInk(colors[1]!)).toBe(value === 72);
    expect(isInk(colors[2]!)).toBe(false);
  }
});
