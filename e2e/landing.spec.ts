import { test, expect } from "@playwright/test";

test.describe("Landing", () => {
  test("home loads in default locale (en)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("locale switcher navigates to /es", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Language").selectOption("es");
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("privacy policy renders MDX content", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page.getByRole("heading", { name: /privacy policy/i })).toBeVisible();
  });
});
