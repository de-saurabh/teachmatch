import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @teachmatch/web dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    cwd: "../..",
  },
});
