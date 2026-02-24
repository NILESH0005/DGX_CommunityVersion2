import { test, expect } from "@playwright/test";

test("User can open login page", async ({ page }) => {
  await page.goto("http://117.55.242.133:3000/");

  // Click Login link (BEST PRACTICE)
  await page.getByRole("link", { name: /login/i }).click();

  // Assertion (VERY IMPORTANT)
  await expect(page).toHaveURL(/login/);
});
