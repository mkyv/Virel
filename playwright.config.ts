import { defineConfig, devices } from "@playwright/test";

// Smoke tests E2E para el boilerplate.
// Local: `npm run test:e2e` (levanta `npm run dev` y reusa si ya está corriendo).
// CI: instala browsers con `npx playwright install --with-deps`, luego corre los tests.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // SITE_URL es required por sitemap.ts / robots.ts. En tests usamos uno mock.
    env: { SITE_URL: "http://localhost:3000" },
  },
});
