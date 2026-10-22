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
  await page.getByRole("button", { name: "Remove Barangay 3" }).click();
  await expect(page.getByRole("button", { name: "Remove Last 24 hours" })).toBeFocused();
});

test("Switch: label click toggles it", async ({ page }) => {
  await page.goto("/docs/components/switch");
  const sw = page.getByRole("switch", { name: /Night mode/ });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await page.getByText("Night mode for dispatch console").click();
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
  await page.getByRole("textbox", { name: "Label" }).fill("Flooded");
  await expect(page.getByRole("region", { name: "Tag preview" })).toContainText("Flooded");
  await expect(page.getByRole("region", { name: "Code" })).toContainText(">Flooded</Tag>");
  await page.locator(".pg-toolbar").getByText("Kraft", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Kraft" })).toBeChecked();
  await expect(page.locator(".pg-stage")).toHaveAttribute("data-plop-surface", "kraft");
  await expect(page).toHaveURL(/surface=kraft/);
});
