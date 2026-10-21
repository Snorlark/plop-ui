import { expect, test } from "@playwright/test";
import { PAGES, SURFACES } from "./pages";

for (const path of PAGES) {
  test(`no hydration warnings or console errors on ${path}`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || /hydrat/i.test(msg.text())) problems.push(`${msg.type()}: ${msg.text()}`);
    });
    page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
}

for (const surface of SURFACES) {
  test(`first paint uses the ${surface} surface from the cookie`, async ({ context, request, baseURL }) => {
    await context.addCookies([{ name: "plop-surface", value: surface, url: baseURL! }]);
    // The raw server HTML, before any JavaScript runs.
    const html = await (await request.get("/docs/getting-started", { headers: { cookie: `plop-surface=${surface}` } })).text();
    expect(html).toMatch(new RegExp(`<html[^>]*data-plop-surface="${surface}"`));
  });
}

test("the surface switcher repaints the page and survives a reload", async ({ page }) => {
  await page.goto("/docs/surfaces");
  await page.getByRole("radio", { name: "Kraft" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-plop-surface", "kraft");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-plop-surface", "kraft");
});
