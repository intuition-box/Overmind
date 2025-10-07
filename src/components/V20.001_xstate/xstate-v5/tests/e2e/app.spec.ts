// xstate-v5/tests/e2e/app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Overmind XState v5 Application', () => {
  test('loads application without errors', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');

    // Check for heading
    await expect(page.locator('h1')).toContainText('Hello XState v5');

    // Check no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for potential errors
    await page.waitForTimeout(1000);

    expect(errors.length).toBe(0);
  });

  test('displays application status', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check status is displayed
    const statusText = await page.locator('p').first().textContent();
    expect(statusText).toContain('Status:');
  });

  test('renders debug panel with context', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check for JSON context display
    const preElement = page.locator('pre');
    await expect(preElement).toBeVisible();

    const contextText = await preElement.textContent();
    expect(contextText).toContain('"status"');
  });
});
