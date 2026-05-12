import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("signin page shows Google + email options", async ({ page }) => {
    await page.goto("/signin");
    await expect(
      page.getByRole("button", { name: /continue with email/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /google/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("signup page shows the same form + link back to signin", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("button", { name: /continue with email/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
  });

  test("dashboard redirects to signin when not authenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });
});
