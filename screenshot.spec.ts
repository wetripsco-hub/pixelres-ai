import { test, expect } from '@playwright/test';

test('take screenshots of the marketing page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/marketing-full.png', fullPage: true });

  // Test selecting a different tier
  const webTier = page.getByText('Web & Social');
  if (await webTier.isVisible()) {
      await webTier.click();
      await page.waitForTimeout(500); // Wait for transition
      await page.screenshot({ path: 'screenshots/marketing-tier-web.png' });
  }
});
