import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false,
  forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  reporter: "list", timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"],
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI, timeout: 120_000,
    env: { OPENAI_API_KEY: "", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
