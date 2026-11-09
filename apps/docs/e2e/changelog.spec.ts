import { expect, test } from "@playwright/test";

// The changelog: one card per minor version, the newest open and older ones folded behind a button, a timeline
// on the side (a Select on phones) and a package filter made of the kit's radios.

const folded = (page: import("@playwright/test").Page, id: string) => page.locator(`#${id} [data-fold] > [id]`);

test("a folded release opens from its button", async ({ page }) => {
  await page.goto("/changelog");
  const card = page.locator("section[id^='v']").last();
  const button = card.getByRole("button", { name: /^Show/ });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(card.locator("[data-fold] > [id]")).toBeHidden();
  await button.click();
  await expect(card.getByRole("button", { name: "Hide changes" })).toHaveAttribute("aria-expanded", "true");
  await expect(card.locator("[data-fold] > [id]")).toBeVisible();
});

test("picking a release from the timeline (a Select on phones) opens it and marks it", async ({ page, isMobile }) => {
  await page.goto("/changelog");
  const id = (await page.locator("section[id^='v']").last().getAttribute("id"))!;
  if (isMobile) {
    await page.getByRole("button", { name: /Jump to a release/ }).click();
    const version = id.slice(1).replaceAll("-", ".");
    await page.getByRole("option").filter({ hasText: version }).first().click();
  } else {
    const nav = page.getByRole("navigation", { name: "Releases" });
    await nav.locator(`a[href$='#${id}']`).click();
    await expect(nav.locator("a[aria-current]")).toHaveAttribute("href", new RegExp(`#${id}$`));
  }
  await expect(folded(page, id)).toBeVisible();
  await expect(page.locator(`#${id}`).getByRole("heading", { level: 2 })).toBeInViewport();
});

test("the package filter shows only releases that touch that package", async ({ page }) => {
  await page.goto("/changelog");
  const cards = page.locator("section[id^='v']:visible");
  const all = await cards.count();
  const newest = await cards.first().getAttribute("id");
  // The kit's Radio draws over its real input, so pick it the way a person does: by its label.
  const pick = async (name: string) => {
    await expect(page.getByRole("button", { name: "Show releases", exact: true })).toBeHidden();
    await page.locator("fieldset label", { hasText: new RegExp(`^${name}$`) }).click();
  };
  await pick("fonts");
  await expect(page.getByRole("radio", { name: "fonts" })).toBeChecked();
  await expect(page).toHaveURL(/pkg=fonts#releases$/);
  await expect(cards.first()).toHaveAttribute("data-pkgs", /fonts/);
  expect(await cards.count()).toBeGreaterThan(0);
  for (const pkgs of await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-pkgs")))) expect(pkgs).toContain("fonts");
  await pick("Everything");
  await expect(cards.first()).toHaveAttribute("id", newest!);
  await expect(cards).toHaveCount(all);
});

test("a link to a release opens the card that holds it, arriving or in the page", async ({ page }) => {
  await page.goto("/");
  await page.goto("/changelog#v0-3-5");
  await expect(folded(page, "v0-3")).toBeVisible();
  await page.evaluate(() => (location.hash = "v0-1"));
  await expect(folded(page, "v0-1")).toBeVisible();
});
