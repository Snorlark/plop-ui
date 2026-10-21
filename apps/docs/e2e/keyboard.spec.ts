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
