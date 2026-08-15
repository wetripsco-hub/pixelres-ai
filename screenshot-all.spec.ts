import { test, expect } from '@playwright/test';

test('take screenshots of all new pages', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/marketing-new.png', fullPage: true });

  await page.goto('http://localhost:3000/pricing');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/pricing-page.png', fullPage: true });

  await page.goto('http://localhost:3000/studio');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/studio-page.png', fullPage: true });

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
});
