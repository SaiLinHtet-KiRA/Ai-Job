import { test, expect } from "@playwright/test";

test.describe("CV Check Page", () => {
  test("loads with hero section visible", async ({ page }) => {
    await page.goto("/cv-check");

    await expect(
      page.getByText("Free CV analysis"),
    ).toBeVisible();
    await expect(
      page.getByText("Drop your CV here"),
    ).toBeVisible();
  });

  test("shows how it works section", async ({ page }) => {
    await page.goto("/cv-check");

    await page.locator("#how-it-works").scrollIntoViewIfNeeded();
    await expect(page.locator("#how-it-works").getByText("Upload your CV")).toBeVisible();
    await expect(page.locator("#how-it-works").getByText("AI analyzes instantly")).toBeVisible();
    await expect(page.locator("#how-it-works").getByText("Get actionable feedback")).toBeVisible();
  });

  test("shows social proof section with stats", async ({ page }) => {
    await page.goto("/cv-check");

    await page.locator("text=CVs analyzed").scrollIntoViewIfNeeded();
    await expect(page.locator("text=CVs analyzed")).toBeVisible();
    await expect(page.locator("text=user satisfaction")).toBeVisible();
  });

  test("shows features section", async ({ page }) => {
    await page.goto("/cv-check");

    await page.locator("#features").scrollIntoViewIfNeeded();
    await expect(page.locator("#features").getByText("ATS Score")).toBeVisible();
    await expect(page.locator("#features").getByText("Strengths")).toBeVisible();
    await expect(page.locator("#features").getByText("Weaknesses")).toBeVisible();
    await expect(page.locator("#features").getByText("Missing keywords")).toBeVisible();
  });

  test("shows about us section", async ({ page }) => {
    await page.goto("/cv-check");

    await page.locator("#about-us").scrollIntoViewIfNeeded();
    await expect(page.locator("#about-us").getByText("About us")).toBeVisible();
    await expect(page.locator("#about-us").getByText("AI-first approach")).toBeVisible();
  });

  test("shows FAQ section", async ({ page }) => {
    await page.goto("/cv-check");

    await page.locator("text=Common questions").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Is this really free?")).toBeVisible();
    await expect(page.locator("text=Do I need to create an account?")).toBeVisible();
  });
});
