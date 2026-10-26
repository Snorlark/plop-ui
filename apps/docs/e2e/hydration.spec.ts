import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

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
