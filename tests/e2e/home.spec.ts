import { test, expect } from "@playwright/test";

test("home page shows live auctions", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /live auctions/i })
  ).toBeVisible();
  await expect(page.locator("a", { hasText: "Current bid" }).first()).toBeVisible();
});
