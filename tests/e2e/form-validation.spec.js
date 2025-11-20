const { test, expect } = require('@playwright/test');

test.describe('RxHtmx Form Validation Example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/form-validation/index.html');
  });

  test('should load the form validation example', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Real-time Form Validation');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirm-password')).toBeVisible();
  });

  test('should validate username field', async ({ page }) => {
    const usernameInput = page.locator('#username');
    const usernameValidation = page.locator('#username-validation');

    // Test empty username
    await usernameInput.fill('');
    await usernameInput.blur();
    await expect(usernameValidation).toBeEmpty();

    // Test short username
    await usernameInput.fill('ab');
    await usernameInput.blur();
    await expect(usernameValidation).toContainText(
      'Username must be at least 3 characters'
    );

    // Test valid username
    await usernameInput.fill('validuser');
    await usernameInput.blur();
    await expect(usernameValidation).toContainText('✓ Username looks good');
  });

  test('should validate email field', async ({ page }) => {
    const emailInput = page.locator('#email');
    const emailValidation = page.locator('#email-validation');

    // Test invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await expect(emailValidation).toContainText(
      'Please enter a valid email address'
    );

    // Test valid email
    await emailInput.fill('user@example.com');
    await emailInput.blur();
    await expect(emailValidation).toContainText('✓ Email looks good');
  });

  test('should validate password matching', async ({ page }) => {
    const passwordInput = page.locator('#password');
    const confirmPasswordInput = page.locator('#confirm-password');
    const confirmValidation = page.locator('#confirm-password-validation');

    // Test non-matching passwords
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('different123');
    await confirmPasswordInput.blur();
    await expect(confirmValidation).toContainText('Passwords do not match');

    // Test matching passwords
    await confirmPasswordInput.fill('password123');
    await confirmPasswordInput.blur();
    await expect(confirmValidation).toContainText('✓ Passwords match');
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    const submitBtn = page.locator('.submit-btn');

    // Initially disabled
    await expect(submitBtn).toBeDisabled();

    // Fill all fields with valid data
    await page.locator('#username').fill('validuser');
    await page.locator('#email').fill('user@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');

    // Submit button should be enabled
    await expect(submitBtn).toBeEnabled();
  });
});
