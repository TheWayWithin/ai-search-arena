import { test, expect } from "@playwright/test";

// Known data: 1 published cycle "2026-03" / "March 2026 Benchmark"
// Tools with scores: brightedge, semrush, seoclarity, wordlift
// Segments: smb-marketing, agency-consulting, enterprise-seo

test.describe("Navigation", () => {
  test("header contains Cycles link that navigates to /cycles", async ({ page }) => {
    await page.goto("/");
    const cyclesLink = page.getByRole("link", { name: "Cycles" });
    await expect(cyclesLink).toBeVisible();
    await cyclesLink.click();
    await expect(page).toHaveURL("/cycles");
  });
});

test.describe("/cycles archive page", () => {
  test("shows heading and at least one published cycle", async ({ page }) => {
    await page.goto("/cycles");
    await expect(page.getByRole("heading", { name: "Benchmark Cycles" })).toBeVisible();

    // Should show the March 2026 cycle
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
  });

  test("displays publication date, tool count, and methodology version", async ({ page }) => {
    await page.goto("/cycles");
    const card = page.getByRole("link", {
      name: /March 2026 Benchmark/,
    });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Published");
    await expect(card).toContainText("tools evaluated");
    await expect(card).toContainText("Methodology v");
  });

  test("cycle card links to /leaderboard?cycle=2026-03", async ({ page }) => {
    await page.goto("/cycles");
    const card = page.getByRole("link", {
      name: /March 2026 Benchmark/,
    });
    await expect(card).toHaveAttribute("href", "/leaderboard?cycle=2026-03");
    await card.click();
    await expect(page).toHaveURL("/leaderboard?cycle=2026-03");
  });
});

test.describe("/leaderboard with cycle param", () => {
  test("loads default leaderboard (latest cycle)", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    // Shows cycle info
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
  });

  test("cycle selector is hidden when only 1 cycle exists", async ({ page }) => {
    await page.goto("/leaderboard");
    // CycleSelector returns null when cycles.length <= 1
    const selects = page.locator("select");
    await expect(selects).toHaveCount(0);
  });

  test("?cycle=2026-03 shows March 2026 data", async ({ page }) => {
    await page.goto("/leaderboard?cycle=2026-03");
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
    // Ranked tools should be visible
    await expect(page.getByRole("link", { name: "BrightEdge" })).toBeVisible();
  });

  test("?cycle=2026-03&segment=enterprise-seo composes both params", async ({ page }) => {
    await page.goto("/leaderboard?cycle=2026-03&segment=enterprise-seo");
    await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
    // The Enterprise SEO pill should be active (has bg-arena-slate class)
    const pill = page.getByRole("link", { name: "Enterprise SEO" });
    await expect(pill).toBeVisible();
    await expect(pill).toHaveClass(/bg-arena-slate/);
  });

  test("segment pills preserve cycle param in href", async ({ page }) => {
    await page.goto("/leaderboard?cycle=2026-03");
    const pill = page.getByRole("link", { name: "Enterprise SEO" });
    await expect(pill).toHaveAttribute("href", /cycle=2026-03/);
  });
});

test.describe("/tools/[slug] with cycle param", () => {
  test("loads tool detail with default cycle", async ({ page }) => {
    await page.goto("/tools/brightedge");
    await expect(page.getByRole("heading", { name: "BrightEdge" })).toBeVisible();
    await expect(page.getByText("Dimension Scores — March 2026 Benchmark")).toBeVisible();
  });

  test("?cycle=2026-03 shows cycle-specific heading", async ({ page }) => {
    await page.goto("/tools/brightedge?cycle=2026-03");
    await expect(page.getByText("Dimension Scores — March 2026 Benchmark")).toBeVisible();
  });

  test("cycle selector hidden when only 1 cycle exists", async ({ page }) => {
    await page.goto("/tools/brightedge");
    const selects = page.locator("select");
    await expect(selects).toHaveCount(0);
  });
});

test.describe("/compare with cycle param", () => {
  test("compare page loads with cycle param", async ({ page }) => {
    await page.goto("/compare?tools=brightedge,semrush&cycle=2026-03");
    await expect(page.getByRole("heading", { name: "Compare Tools" })).toBeVisible();
    // Cycle info shown
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
    // Both tools visible
    await expect(page.getByRole("link", { name: "BrightEdge" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Semrush" })).toBeVisible();
  });

  test("compare page without cycle param defaults to latest", async ({ page }) => {
    await page.goto("/compare?tools=brightedge,semrush");
    await expect(page.getByText("March 2026 Benchmark")).toBeVisible();
  });
});
