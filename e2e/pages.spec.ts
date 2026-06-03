import { test, expect } from "@playwright/test";

test.describe("Jobs Browse Page", () => {
  test("loads with demo job listings", async ({ page }) => {
    await page.goto("/jobs");

    await expect(page.getByText("Browse Jobs")).toBeVisible();
    await expect(page.getByText("Demo listings")).toBeVisible();
    await expect(
      page.getByText("Senior Frontend Developer"),
    ).toBeVisible();
    await expect(page.getByText("Backend Engineer")).toBeVisible();
  });

  test("shows job salary details", async ({ page }) => {
    await page.goto("/jobs");

    await expect(
      page.getByText("$120k - $150k"),
    ).toBeVisible();
    await expect(
      page.getByText("$100k - $140k"),
    ).toBeVisible();
  });

  test("filters jobs by search", async ({ page }) => {
    await page.goto("/jobs");

    await page
      .getByPlaceholder("Job title or company...")
      .fill("Frontend");

    await expect(
      page.getByText("Senior Frontend Developer"),
    ).toBeVisible();
    await expect(
      page.getByText("Backend Engineer"),
    ).not.toBeVisible();
  });

  test("filters jobs by type", async ({ page }) => {
    await page.goto("/jobs");

    await page.getByRole("combobox").last().selectOption("Contract");

    await expect(
      page.getByText("React Native Developer"),
    ).toBeVisible();
    await expect(
      page.getByText("Senior Frontend Developer"),
    ).not.toBeVisible();
  });
});

test.describe("Applications Page", () => {
  test("loads the applications page", async ({ page }) => {
    await page.goto("/applications");

    await expect(
      page.getByText("My Applications"),
    ).toBeVisible();
    await expect(
      page.getByText("Track your job applications"),
    ).toBeVisible();
  });

  test("shows empty state when no applications", async ({ page }) => {
    await page.goto("/applications");

    await expect(
      page.getByText("No applications yet"),
    ).toBeVisible();
  });
});

test.describe("Roadmap Page", () => {
  test("loads with search input and quick picks", async ({ page }) => {
    await page.goto("/roadmap");

    await expect(
      page.getByText("Learning Roadmap"),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("e.g. Frontend Developer"),
    ).toBeVisible();
    await expect(page.getByText("frontend developer")).toBeVisible();
    await expect(page.getByText("backend developer")).toBeVisible();
  });

  test("shows loading when searching courses", async ({ page }) => {
    await page.goto("/roadmap");

    await page.getByPlaceholder("e.g. Frontend Developer").fill("frontend");
    await page.getByText("Search").click();

    await expect(page.getByText(/Loading courses/)).toBeVisible({
      timeout: 5000,
    });
  });
});
