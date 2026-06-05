import { test, expect } from "@playwright/test";

test.describe("Protected Pages Redirect", () => {
  test("jobs page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page).toHaveURL(/\/login/);
  });

  test("applications page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/applications");
    await expect(page).toHaveURL(/\/login/);
  });

  test("roadmap page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Public Pages", () => {
  test("jobs page shows browse heading after redirect to login", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("login page shows sign up link", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign up")).toBeVisible();
  });
});
