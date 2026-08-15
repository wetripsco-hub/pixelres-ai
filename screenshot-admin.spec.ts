import { test, expect } from '@playwright/test';

test('take screenshot of the admin page', async ({ page }) => {
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(2000); // Wait for redirect to login
  await page.screenshot({ path: 'screenshots/admin-unauth-redirect.png' });
});
