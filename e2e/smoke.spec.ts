import { test, expect } from "@playwright/test";

/**
 * Phase 0 smoke test — the canary for the whole app:
 * boot in demo mode → open Quotations → create a quotation → see it in the list.
 * If this fails, something load-bearing broke (routing, auth gate, data
 * adapter, or the quotation money path).
 */

const ONBOARDING = {
  completed: true,
  businessType: "furniture",
  companySize: "11-50",
  painPoints: [],
  enabled_modules: [
    "sales", "production", "inventory", "purchasing",
    "finance", "analytics", "hr", "delivery", "quality",
  ],
  currency: "EGP",
  defaultLanguage: "en",
  companyName: "Smoke Test Co",
  language: "en",
};

test.beforeEach(async ({ page }) => {
  // Demo mode auto-authenticates; the only gate is the onboarding flag.
  await page.addInitScript((data) => {
    localStorage.setItem("thoth_onboarding", JSON.stringify(data));
  }, ONBOARDING);
});

test("app boots into the shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/quotations");
  await expect(page.getByRole("button", { name: /New Quotation/i }).first()).toBeVisible({ timeout: 15_000 });

  expect(errors, `Uncaught page errors: ${errors.join(" | ")}`).toEqual([]);
});

test("create a quotation and see it in the list", async ({ page }) => {
  await page.goto("/quotations");
  await page.getByRole("button", { name: /New Quotation/i }).first().click();

  const modal = page.locator("div.fixed", { hasText: "New Quotation" });
  await expect(modal).toBeVisible();

  const project = `Smoke Project ${Date.now()}`;
  await modal.getByPlaceholder(/Executive Office Fit-out/i).fill(project);
  await modal.getByPlaceholder(/Product name/i).first().fill("Smoke Test Desk");

  // Qty defaults to 1; set a unit price so the quotation carries money.
  const priceInput = modal.locator('input[type="number"][min="0"]').first();
  await priceInput.fill("1500");

  await modal.getByRole("button", { name: /Create Quotation/i }).click();
  await expect(modal).toBeHidden({ timeout: 10_000 });

  // The new quotation appears in the list (demo mode keeps optimistic state).
  await expect(page.getByText(project).first()).toBeVisible({ timeout: 10_000 });
});
