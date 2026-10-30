import { defineConfig, devices } from "@playwright/test";

const PORT = 3107;

/**
 * Runs against a production build in .next-e2e (`pnpm test:e2e` builds it), which is
 * where hydration mismatches show up for real. Uses installed Chrome locally;
 * CI installs Playwright's Chromium (PLAYWRIGHT_CHANNEL unset).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? (process.env.CI ? undefined : "chrome"),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
    // Other engines: Firefox, and WebKit for Safari on macOS and iPhone. `channel` only applies to Chromium.
    // One retry in CI: Firefox shows a rare hydration mismatch (React #418, about 1 in 130 loads) that also happens on main; see issue #63.
    // WebKit on CI's Linux runners rarely fails an axe check mid-load (footer color-contrast on /playground, iPhone)
    // that never reproduced in 60 isolated runs.
    { name: "firefox", use: { ...devices["Desktop Firefox"], channel: undefined }, retries: process.env.CI ? 1 : 0 },
    { name: "safari", use: { ...devices["Desktop Safari"], channel: undefined }, retries: process.env.CI ? 1 : 0 },
    { name: "iphone", use: { ...devices["iPhone 14"], channel: undefined }, retries: process.env.CI ? 1 : 0 },
  ],
  webServer: {
    command: `pnpm next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_TELEMETRY_DISABLED: "1", NEXT_DIST_DIR: ".next-e2e" },
  },
});
