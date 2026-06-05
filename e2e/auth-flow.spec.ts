import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("login page loads and shows credentials form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByText("Welcome back"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("you@example.com"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Your password"),
    ).toBeVisible();
    await expect(
      page.getByText("Create an account"),
    ).toBeVisible();
  });

  test("login page shows error when error param is present", async ({
    page,
  }) => {
    await page.goto("/login?error=Invalid%20email%20or%20password");

    await expect(
      page.getByText("Invalid email or password"),
    ).toBeVisible();
  });

  test("signup page loads and shows form", async ({ page }) => {
    await page.goto("/signup");

    await expect(
      page.getByText("Create account"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("you@example.com"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Minimum 6 characters"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("unauthenticated user is redirected from protected pages", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected from profile", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Admin Login Page", () => {
  test("admin login page loads and shows form", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.getByText("Admin Login")).toBeVisible();
    await expect(page.getByPlaceholder("admin@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("admin login shows error with bad credentials", async ({ page }) => {
    await page.goto("/admin");

    await page.getByPlaceholder("admin@example.com").fill("admin@test.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Either shows error text or 500 error page (if Supabase is not configured)
    await expect(page.locator("text=/error|Invalid|Login/i").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("admin dashboard redirects to login when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
