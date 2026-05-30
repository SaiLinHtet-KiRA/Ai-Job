import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads with key elements visible", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /easy2apply/ })).toBeVisible();
    await expect(page.locator("text=Apply Now").first()).toBeVisible();
    await expect(page.locator("text=One Click.").first()).toBeVisible();
    await expect(page.locator("text=Infinite Possibilities.")).toBeVisible();
    await expect(page.locator("text=How It Works")).toBeVisible();
  });

  test("Apply Now button opens modal", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Apply Now").first().click();

    await expect(page.locator("text=Apply for a Job")).toBeVisible();
    await expect(page.getByPlaceholder("John Doe")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("Search job title...")).toBeVisible();
  });

  test("modal validates empty fields and shows errors", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Apply Now").first().click();
    await page.locator("text=Continue").click();

    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Please select a position")).toBeVisible();
  });

  test("modal can be closed", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Apply Now").first().click();
    await expect(page.locator("text=Apply for a Job")).toBeVisible();

    await page.locator("text=Cancel").click();
    await expect(page.locator("text=Apply for a Job")).not.toBeVisible();
  });

  test("advances to step 2 with valid input", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Apply Now").first().click();

    await page.getByPlaceholder("John Doe").fill("Test User");
    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("Search job title...").fill("Software");

    // Wait for title dropdown to appear from API
    const dropdownItem = page.locator("button", { hasText: "Software" });
    await dropdownItem.first().waitFor({ state: "visible", timeout: 5000 });
    await dropdownItem.first().click();

    await page.locator("text=Continue").click();

    // Look for step 2 content instead of exact text (rendered as separate nodes)
    await expect(page.getByPlaceholder("800000")).toBeVisible();
    await expect(page.locator("text=Submit Application")).toBeVisible();
  });
});
