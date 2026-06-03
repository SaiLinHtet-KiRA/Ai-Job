import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads with key elements visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /easy2apply/ })).toBeVisible();
    await expect(page.locator("text=Get Started Free")).toBeVisible();
    await expect(page.locator("text=Check CV Score — Free")).toBeVisible();
    await expect(page.locator("text=Your full job search, in one place")).toBeVisible();
  });

  test("Get Started button links to login", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Get Started Free").first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("CV Score button links to cv-check", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Check CV Score — Free").first().click();
    await expect(page).toHaveURL(/\/cv-check/);
  });

  test("shows AI-Powered Job Search Platform badge", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator("text=AI-Powered Job Search Platform"),
    ).toBeVisible();
  });
});
