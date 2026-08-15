import { test, expect } from '@playwright/test';

test('take screenshot of the dashboard page', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/dashboard-full.png', fullPage: true });
});
