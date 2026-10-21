import { defineConfig, devices } from "@playwright/test";

const PORT = 3107;

/**
 * Runs against a production build (`next build && next start`), which is
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
  ],
  webServer: {
    command: `pnpm next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
