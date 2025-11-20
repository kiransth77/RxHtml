const { test, expect } = require('@playwright/test');

test.describe('RxHtmx Search Example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/search/index.html');
  });

  test('should load the search example', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Search with Autocomplete');
    await expect(page.locator('#search-input')).toBeVisible();
    await expect(page.locator('#search-results')).toBeVisible();
  });

  test('should show search suggestions', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const searchResults = page.locator('#search-results');

    // Type a search term
    await searchInput.fill('java');

    // Wait for suggestions to appear (debounced)
    await page.waitForTimeout(500);

    // Check if results are shown
    await expect(searchResults).not.toBeEmpty();
  });

  test('should filter suggestions based on input', async ({ page }) => {
    const searchInput = page.locator('#search-input');

    // Search for specific term
    await searchInput.fill('react');
    await page.waitForTimeout(500);

    // All visible results should contain the search term
    const results = page.locator('.search-suggestion');
    const count = await results.count();

    for (let i = 0; i < count; i++) {
      const result = results.nth(i);
      await expect(result).toContainText(/react/i);
    }
  });

  test('should clear suggestions when input is empty', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    const searchResults = page.locator('#search-results');

    // Type and then clear
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Results should be empty or show placeholder
    const hasResults = await searchResults
      .locator('.search-suggestion')
      .count();
    expect(hasResults).toBe(0);
  });
});
