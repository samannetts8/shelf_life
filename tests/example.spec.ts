import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page).toHaveTitle(/ShelfLife/);
});


test('has Log In button', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const loginButton = page.locator('button', { hasText: /Log In/i });
  
  await expect(loginButton).toBeVisible();
});


test('has Sign Up button', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const signUpButton = page.locator('button', { hasText: /Sign Up/i });

  await expect(signUpButton).toBeVisible();
});

test('has email and password fields', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const emailField = page.getByRole('textbox', { name: /email/i });
  await expect(emailField).toBeVisible();

  const passwordField = page.getByRole('textbox', { name: /password/i });
  await expect(passwordField).toBeVisible();
});

test('test with environment variables for sensitive data', async ({ page }) => {
  const email: string = process.env.TEST_EMAIL || '';  
  const password: string = process.env.TEST_PASSWORD || '';  

  if (!email || !password) {
    throw new Error('Environment variables TEST_EMAIL or TEST_PASSWORD are not set');
  }

  await page.goto('http://localhost:3000', { timeout: 0 });
  const emailField = page.getByRole('textbox', { name: 'Email:' });
  await emailField.fill(email);

  const passwordField = page.getByRole('textbox', { name: 'Password:' });
  await passwordField.fill(password);

  const loginButton = page.getByRole('button', { name: 'Log in' });
  await loginButton.click();

  await page.waitForLoadState('networkidle', { timeout: 0 });

  await page.goto('http://localhost:3000/dashboard', { timeout: 0 });
});
