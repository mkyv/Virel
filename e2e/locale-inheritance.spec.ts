import { test, expect } from "@playwright/test";

test.describe("Locale inheritance landing → app", () => {
  test("visiting /es sets NEXT_LOCALE cookie to 'es'", async ({ page }) => {
    await page.goto("/es");
    const cookies = await page.context().cookies();
    const nextLocale = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocale?.value).toBe("es");
  });

  test("visiting / sets NEXT_LOCALE cookie to 'en'", async ({ page }) => {
    await page.goto("/");
    const cookies = await page.context().cookies();
    const nextLocale = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(nextLocale?.value).toBe("en");
  });

  test("after visiting /es, /signin renders in spanish", async ({ page }) => {
    await page.goto("/es");
    // Sanity: confirm landing is in spanish
    await expect(
      page.getByRole("link", { name: /Ingresar/i })
    ).toBeVisible();

    await page.goto("/signin");
    // Title should be "Ingresar a Virel"
    await expect(
      page.getByRole("heading", { name: /Ingresar a Virel/i })
    ).toBeVisible();
  });

  test("after visiting /, /signin renders in english", async ({ page }) => {
    await page.goto("/");
    await page.goto("/signin");
    await expect(
      page.getByRole("heading", { name: /Log in to Virel/i })
    ).toBeVisible();
  });

  test("clicking the locale switcher to ES then going to /signin renders spanish", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Language").selectOption("es");
    await expect(page).toHaveURL(/\/es/);
    await page.goto("/signin");
    await expect(
      page.getByRole("heading", { name: /Ingresar a Virel/i })
    ).toBeVisible();
  });

  test("home link in /signin returns to landing with the same locale", async ({
    page,
  }) => {
    // Coming from /es: home link in /signin should go to /es, not /.
    await page.goto("/es");
    await page.goto("/signin");
    await page.getByRole("link", { name: /Inicio/i }).click();
    await expect(page).toHaveURL(/\/es$/);
  });

  test("home link in /signin stays in / when locale is default (en)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.goto("/signin");
    await page.getByRole("link", { name: /Home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("cookie persistence: cookie='es' redirects '/' to '/es' on next visit", async ({
    browser,
  }) => {
    // Simula "el user vuelve después de N días": context con cookie ya seteada.
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "es",
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/");
    // next-intl debería redirigir a /es porque la cookie no es defaultLocale.
    await expect(page).toHaveURL(/\/es$/);
    await context.close();
  });

  test("cookie persistence: cookie='en' keeps '/' as-is (no redirect)", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "NEXT_LOCALE",
        value: "en",
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/");
    // En default locale, no debe haber prefix.
    await expect(page).toHaveURL(/localhost:3000\/$/);
    await context.close();
  });
});
