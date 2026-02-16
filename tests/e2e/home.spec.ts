import { test, expect } from "@playwright/test";

test("home page shows live auctions", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /live auctions/i })
  ).toBeVisible();
  await expect(page.locator("a", { hasText: "Current bid" }).first()).toBeVisible();
});

test("status switcher shows pending auctions context", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Pending" })
    .click();
  await expect(page).toHaveURL(/status=pending/);
  await expect(page.getByRole("heading", { name: "Pending" })).toBeVisible();
});

test("status switcher shows closed auctions context", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("banner").getByRole("link", { name: "Closed" }).click();
  await expect(page).toHaveURL(/status=closed/);
  await expect(page.getByRole("heading", { name: "Closed" })).toBeVisible();
});

test("search keeps selected status", async ({ page }) => {
  await page.goto("/?status=closed");
  await page.locator("input[name='query']").fill("kit");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/status=closed/);
  await expect(page).toHaveURL(/query=kit/);
});

test("category link preserves selected status", async ({ page }) => {
  await page.goto("/?status=pending");
  await page.getByRole("link", { name: "Tech" }).click();
  await expect(page).toHaveURL(/status=pending/);
  await expect(page).toHaveURL(/category=Tech/);
});
