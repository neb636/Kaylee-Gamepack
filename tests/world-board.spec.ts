import { expect, test } from '@playwright/test'

// The world board (#/world): every country has a pin she can tap, and tapping one flies there.
test('the world board has a pin for every country, and tapping one opens it', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('./#/world?view=map')
  await page.getByRole('button', { name: /let's play/i }).click()
  for (const name of ['Canada', 'Italy', 'Egypt', 'China', 'Thailand', 'Peru', 'Australia', 'The Poles']) await expect(page.getByRole('button', { name, exact: true })).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole('button', { name: 'The Poles, the Arctic', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Australia', exact: true }).click()
  // The balloon flies there, then the country opens.
  await expect(page).toHaveURL(/#\/world\/australia/, { timeout: 15_000 })
})
