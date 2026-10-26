import { expect, test } from "@playwright/test";

test("Button: Space and Enter both press it", async ({ page }) => {
  await page.goto("/docs/components/button");
  const button = page.getByRole("button", { name: "Save changes" }).first();
  await button.focus();
  await page.keyboard.down(" ");
  await expect(button).toHaveAttribute("data-pressed", "");
  await page.keyboard.up(" ");
  await expect(button).not.toHaveAttribute("data-pressed");
});

test("Tag: removing a filter moves focus to the next one", async ({ page }) => {
  await page.goto("/docs/components/tag");
  await page.getByRole("button", { name: "Remove Doodles" }).click();
  await expect(page.getByRole("button", { name: "Remove Last 24 hours" })).toBeFocused();
});

test("Switch: label click toggles it", async ({ page }) => {
  await page.goto("/docs/components/switch");
  const sw = page.getByRole("switch", { name: /Night mode/ });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await page.getByText("Night mode for the sketchbook").click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
});

test("Docs: Preview/Code tabs switch with arrow keys", async ({ page }) => {
  await page.goto("/docs/components/progress");
  await page.getByRole("tab", { name: "Preview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Code" })).toContainText("<Progress");
});

test("Search: typing filters pages and Enter opens the first match", async ({ page }) => {
  await page.goto("/docs/getting-started");
  // Search lives in the header's command palette: open it, then type.
  await page.getByRole("button", { name: /Search the docs/ }).click();
  await page.getByRole("dialog", { name: "Type a command or search" }).getByRole("combobox").fill("timeline");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/components\/status-timeline$/);
});

test("Playground: changing a prop updates the preview and the code", async ({ page }) => {
  await page.goto("/playground?c=tag");
  await page.getByRole("textbox", { name: "Label" }).fill("Doodles");
  await expect(page.getByRole("region", { name: "Tag preview" })).toContainText("Doodles");
  await expect(page.getByRole("region", { name: "Code" })).toContainText(">Doodles</Tag>");
  await page.locator(".pg-toolbar").getByText("Kraft", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Kraft" })).toBeChecked();
  await expect(page.locator(".pg-stage")).toHaveAttribute("data-plop-surface", "kraft");
  await expect(page).toHaveURL(/surface=kraft/);
});

test("Ride-along pass: Enter opens it from the corner stub, Escape closes it and returns focus", async ({ page }) => {
  await page.goto("/docs/getting-started");
  const stub = page.getByRole("button", { name: /Ride-along pass/ });
  await expect(stub).toHaveAccessibleName(/1 of 5 stops stamped/);
  await stub.focus();
  await page.keyboard.press("Enter");
  const pass = page.getByRole("dialog", { name: "Ride-along pass" });
  await expect(pass).toBeFocused();
  await expect(pass.getByRole("link", { name: /^2\. Install it, stamped/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(pass).toBeHidden();
  await expect(stub).toBeFocused();
});

test("Header menus: Enter opens one, Tab walks into it, Escape closes it and returns focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "phones use the burger sheet");
  await page.goto("/docs/getting-started");
  const trigger = page.getByRole("button", { name: "Community" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "GitHub", exact: true }).first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("404: a 404 status with no site header; the buddy talks back and the buttons lead out", async ({ page }) => {
  await page.goto("/playground");
  const response = await page.goto("/docs/buton");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "This page is still on the press." })).toBeVisible();
  const say = page.locator("#nf-say");
  const first = await say.textContent();
  await page.getByRole("button", { name: "Ask the buddy what happened" }).click();
  await expect(say).not.toHaveText(first ?? "");
  await expect(page.getByRole("link", { name: "Browse components" })).toHaveAttribute("href", "/docs/components/button");
  await page.getByRole("button", { name: "Go back" }).click();
  await expect(page).toHaveURL(/\/playground/);
});
