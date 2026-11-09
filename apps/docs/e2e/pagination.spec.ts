import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { SURFACES, THEMES } from "./pages";

const cards = (page: import("@playwright/test").Page) => page.locator("#releases > section[id^='v']");
const pagination = (page: import("@playwright/test").Page) => page.getByRole("navigation", { name: "Pagination", exact: true });

test("changelog pages navigate by keyboard, reload and browser Back", async ({ page }) => {
  await page.goto("/changelog");
  await expect(cards(page)).toHaveCount(4);
  const firstRelease = await cards(page).first().getAttribute("id");
  await expect(pagination(page).getByRole("link", { name: "Page 1", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(pagination(page).getByRole("button", { name: "Previous" })).toBeDisabled();
  await pagination(page).getByRole("link", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/changelog\?page=2#releases$/);
  await expect(pagination(page).getByRole("link", { name: "Page 2", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await cards(page).first().getAttribute("id")).not.toBe(firstRelease);
  const secondRelease = await cards(page).first().getAttribute("id");
  await page.reload();
  await expect(cards(page).first()).toHaveAttribute("id", secondRelease!);
  await page.goBack();
  await expect(page).toHaveURL(/\/changelog$/);
  await expect(cards(page).first()).toHaveAttribute("id", firstRelease!);
  await page.goForward();
  await expect(page).toHaveURL(/page=2#releases$/);
  await expect(cards(page).first()).toHaveAttribute("id", secondRelease!);
});

for (const navigation of ["page", "package"] as const) {
  test(`Back and Forward restore server results while reload hydration is blocked after ${navigation} navigation`, async ({ page }) => {
    let blockHydration = false;
    let resumeHydration!: () => void;
    const hydration = new Promise<void>((resolve) => { resumeHydration = resolve; });
    await page.route("**/_next/static/**", async (route) => {
      if (blockHydration && new URL(route.request().url()).pathname.endsWith(".js")) await hydration;
      // A document navigation can cancel a script request while it is held.
      await route.continue().catch(() => {});
    });
    try {
      await page.goto("/changelog");
      const first = await cards(page).first().getAttribute("id");
      if (navigation === "page") await pagination(page).getByRole("link", { name: "Next", exact: true }).click();
      else {
        await expect(page.getByRole("button", { name: "Show releases", exact: true })).toBeHidden();
        await page.locator("fieldset label", { hasText: /^fonts$/ }).click();
      }
      const destination = navigation === "page" ? /page=2#releases$/ : /pkg=fonts#releases$/;
      await expect(page).toHaveURL(destination);
      const second = await cards(page).first().getAttribute("id");
      expect(second).not.toBe(first);
      blockHydration = true;
      await page.reload({ waitUntil: "commit" });
      await expect(cards(page).first()).toHaveAttribute("id", second!);
      await page.goBack({ waitUntil: "commit" });
      await expect(page).toHaveURL(/\/changelog$/);
      await expect(cards(page).first()).toHaveAttribute("id", first!);
      await expect(pagination(page).getByRole("link", { name: "Page 1", exact: true })).toHaveAttribute("aria-current", "page");
      await page.goForward({ waitUntil: "commit" });
      await expect(page).toHaveURL(destination);
      await expect(cards(page).first()).toHaveAttribute("id", second!);
    } finally {
      resumeHydration();
    }
  });
}

test("package filtering has a native submit button before hydration", async ({ page }) => {
  let resume!: () => void;
  const hydration = new Promise<void>((resolve) => { resume = resolve; });
  await page.route("**/_next/static/**", async (route) => {
    if (new URL(route.request().url()).pathname.endsWith(".js")) await hydration;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto("/changelog", { waitUntil: "commit" });
    const submit = page.getByRole("button", { name: "Show releases", exact: true });
    await expect(submit).toBeVisible();
    await page.locator("fieldset label", { hasText: /^fonts$/ }).click();
    await submit.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/pkg=fonts$/);
    await expect(cards(page).first()).toHaveAttribute("data-pkgs", "fonts");
  } finally {
    resume();
  }
});

test("filters run before pagination, start at page one, and preserve the package in links", async ({ page }) => {
  await page.goto("/changelog?page=2");
  await expect(page.getByRole("button", { name: "Show releases", exact: true })).toBeHidden();
  await page.locator("fieldset label", { hasText: /^react$/ }).click();
  await expect(page).toHaveURL(/\/changelog\?pkg=react#releases$/);
  await expect(pagination(page).getByRole("link", { name: "Page 1", exact: true })).toHaveAttribute("aria-current", "page");
  await pagination(page).getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/pkg=react&page=2#releases$/);
  for (const value of await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-pkgs")))) expect(value).toBe("react");
  await expect(page.getByRole("button", { name: "Show releases", exact: true })).toBeHidden();
  await page.locator("fieldset label", { hasText: /^fonts$/ }).click();
  await expect(page).toHaveURL(/pkg=fonts#releases$/);
  expect(await cards(page).count()).toBeGreaterThan(0);
  for (const value of await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-pkgs")))) expect(value).toBe("fonts");
});

test("timeline and legacy fragments reach releases on older pages", async ({ page, isMobile }) => {
  await page.goto("/changelog");
  if (isMobile) {
    await page.getByRole("button", { name: /Jump to a release/ }).click();
    await page.getByRole("option").last().click();
  } else {
    await page.getByRole("navigation", { name: "Releases", exact: true }).getByRole("link").last().click();
  }
  await expect(page.locator("#v0-1")).toBeVisible();
  await expect(page.locator("#v0-1 [data-fold] > [id]")).toBeVisible();
  await expect(page).toHaveURL(/page=\d+#v0-1$/);
  await page.goto("/changelog#v0-3-5");
  await expect(page.locator("#v0-3-5")).toBeVisible();
  await expect(page).toHaveURL(/page=\d+#v0-3-5$/);
});

test("button mode supports Enter and Space, decorative gaps and narrow wrapping", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/docs/components/pagination");
  const nav = pagination(page);
  await nav.getByRole("button", { name: "Page 2", exact: true }).focus();
  await page.keyboard.press("Enter");
  const second = nav.getByRole("button", { name: "Page 2", exact: true });
  await expect(second).toHaveAttribute("aria-current", "page");
  await expect(second).toBeFocused();
  await page.keyboard.press("Space");
  await expect(second).toHaveAttribute("aria-current", "page");
  await nav.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(nav.getByRole("button", { name: "Page 3", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await nav.locator("button").count()).toBeLessThanOrEqual(9);
  const box = (await nav.boundingBox())!;
  for (const button of await nav.getByRole("button").all()) {
    const size = (await button.boundingBox())!;
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(size.x).toBeGreaterThanOrEqual(box.x - 5);
    expect(size.x + size.width).toBeLessThanOrEqual(box.x + box.width + 8);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("changelog links and filtering work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/changelog");
  await pagination(page).getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2#releases$/);
  await page.locator("fieldset label", { hasText: /^fonts$/ }).click();
  await page.getByRole("button", { name: "Show releases" }).click();
  await expect(page).toHaveURL(/pkg=fonts$/);
  expect(await cards(page).count()).toBeGreaterThan(0);
  for (const value of await cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("data-pkgs")))) expect(value).toBe("fonts");
  await context.close();
});

test("invalid page values stay within available releases", async ({ page }) => {
  await page.goto("/changelog?page=99999");
  await expect(pagination(page).getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  expect(await cards(page).count()).toBeGreaterThan(0);
  await page.goto("/changelog?page=bad");
  await expect(pagination(page).getByRole("link", { name: "Page 1", exact: true })).toHaveAttribute("aria-current", "page");
});

for (const surface of SURFACES) for (const theme of THEMES) {
  test(`pagination axe on ${surface} ${theme} under reduced motion`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "desktop covers the surface matrix");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/playground?c=pagination&surface=${surface}&theme=${theme}`);
    await expect(page.locator(".pg-stage").getByRole("navigation", { name: "Pagination" })).toBeVisible();
    const results = await new AxeBuilder({ page }).include(".pg-stage").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("docs page shows compact, First/Last and loading variants, each its own landmark", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/docs/components/pagination");
  const compact = page.getByRole("navigation", { name: "Compact", exact: true });
  await expect(compact).toContainText("2 of 17");
  await compact.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(compact).toContainText("3 of 17");

  const ends = page.getByRole("navigation", { name: "First and last", exact: true });
  await ends.getByRole("button", { name: "Last", exact: true }).click();
  await expect(ends.locator('[aria-current="page"]')).toHaveAccessibleName("Page 40");
  await expect(ends.getByRole("button", { name: "Last", exact: true })).toBeDisabled();

  const slow = page.getByRole("navigation", { name: "Slow fetch", exact: true });
  await slow.getByRole("button", { name: "Page 4", exact: true }).click();
  await expect(slow).toHaveAttribute("aria-busy", "true");
  await expect(slow).not.toHaveAttribute("aria-busy");
  await expect(slow.locator('[aria-current="page"]')).toHaveAccessibleName("Page 4");
});
