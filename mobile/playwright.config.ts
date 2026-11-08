import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  use: {
    ...devices["Pixel 7"],
    baseURL: "http://127.0.0.1:8082",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  webServer: {
    command: "python3 -m http.server 8082 --bind 127.0.0.1 --directory dist",
    url: "http://127.0.0.1:8082",
    reuseExistingServer: !process.env.CI,
  },
});
