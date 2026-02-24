import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",

  // Run only matching tests (optional)
  testMatch: ["**/*.test.ts"],

  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ["html", { open: "never" }],
    ["list"]
  ],

  use: {
    baseURL: "http://117.55.242.133:3000",
    headless: true,

    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",

    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
  },

  projects: [
    {
      name: "Chromium",
      use: { browserName: "chromium" },
    },
  ],
});
