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
  test(`/kit server-renders the ${surface} surface from the cookie`, async ({ request }) => {
    // The raw server HTML, before any JavaScript runs.
    const html = await (await request.get("/kit", { headers: { cookie: `plop-surface=${surface}` } })).text();
    expect(html).toContain(`data-plop-surface="${surface}"`);
  });
}

test("the /kit surface switcher repaints the kit and survives a reload", async ({ page }) => {
  await page.goto("/kit");
  await page.getByRole("radio", { name: "Kraft" }).check();
  const kit = page.locator(".kit-root");
  await expect(kit).toHaveAttribute("data-plop-surface", "kraft");
  await page.reload();
  await expect(kit).toHaveAttribute("data-plop-surface", "kraft");
});
