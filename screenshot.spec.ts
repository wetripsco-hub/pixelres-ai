import { test, expect } from '@playwright/test';

test('take screenshots of the marketing page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000); // Wait for animations and external images
  await page.screenshot({ path: 'screenshots/marketing-full.png', fullPage: true });
});
