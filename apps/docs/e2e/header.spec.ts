import { expect, test, type Page } from "@playwright/test";

/** The header's mega menu on wide screens (phones get the sheet instead). */

const trigger = (page: Page, name: string) => page.locator("header").getByRole("button", { name: new RegExp(`^${name}`) }).first();

test("switching menus swaps the links in place instead of blanking and fading them back", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the sheet");
  await page.goto("/");
  await trigger(page, "Components").hover();
  await expect(trigger(page, "Components")).toHaveAttribute("aria-expanded", "true");
  await page.waitForTimeout(600);
  await trigger(page, "Guides").hover();
  const panel = page.locator(`#${await trigger(page, "Guides").getAttribute("aria-controls")}`);
  await expect(panel).toBeVisible();
  // The first frame the new menu shows: every link already readable (opacity is multiplied down the tree).
  const faintest = await panel.evaluate((el) =>
    Math.min(
      ...[...el.querySelectorAll("a")].map((a) => {
        let o = 1;
        for (let n: Element | null = a; n && n !== el.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o;
      }),
    ),
  );
  expect(faintest).toBeGreaterThan(0.9);
});

test("moving down into the open menu across another trigger doesn't replay or close it", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the sheet");
  // The menu's hover delays run on a paused clock, stepped by hand: on a busy runner, real time between two mouse
  // moves can outlast the switch delay and legitimately open the menu the pointer only brushed.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-01-01T00:01:00"));
  const center = async (name: string) => {
    const b = (await trigger(page, name).boundingBox())!;
    return [b.x + b.width / 2, b.y + b.height / 2] as const;
  };
  await page.mouse.move(...(await center("Components")));
  await page.clock.runFor(200);
  await page.mouse.move(...(await center("Guides")));
  await page.clock.runFor(200);
  await expect(trigger(page, "Guides")).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator(`#${await trigger(page, "Guides").getAttribute("aria-controls")}`);
  const card = (await panel.getByText("Seeded wobble").boundingBox())!;
  // On the way down to the card the pointer brushes the next trigger, then lands in the open sheet.
  await page.mouse.move(...(await center("Playground")));
  await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
  await page.clock.runFor(400);
  await expect(trigger(page, "Guides")).toHaveAttribute("aria-expanded", "true");
  await expect(panel).not.toHaveAttribute("data-fresh");
  await expect(panel).not.toHaveAttribute("data-leaving");
});

test("the bar sliding back in under a resting pointer doesn't open a menu", async ({ page, isMobile, browserName }) => {
  test.skip(isMobile, "phones use the sheet");
  // Firefox under Playwright handles scroll events a step late, so the bar hides and shows out of step with this script.
  test.skip(browserName !== "chromium", "scroll timing; the fix itself is engine-agnostic");
  await page.goto("/");
  const caret = trigger(page, "Components");
  const shown = () => page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().bottom > 1);
  const scrollTo = async (y: number, visible: boolean) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await expect.poll(shown).toBe(visible);
    await page.waitForTimeout(400); // the bar's slide
  };
  // A first jump can land before hydration, unseen by the bar; it reacts from the next one.
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  await scrollTo(1000, false);
  await scrollTo(800, true);
  const b = (await caret.boundingBox())!;
  const [x, y] = [b.x + b.width / 2, b.y + b.height / 2];
  await scrollTo(1200, false);
  // Park the pointer where the trigger comes back, then scroll up without moving it.
  await page.mouse.move(x, y);
  await scrollTo(1000, true);
  expect(await caret.evaluate((el, [x, y]) => el.contains(document.elementFromPoint(x, y)), [x, y] as const)).toBe(true);
  await page.waitForTimeout(300);
  await expect(caret).toHaveAttribute("aria-expanded", "false");
  // A real move still opens it.
  await page.mouse.move(x + 1, y);
  await expect(caret).toHaveAttribute("aria-expanded", "true");
});
