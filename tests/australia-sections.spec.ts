import { expect, test } from '@playwright/test'

test('Australia party restores a chosen dance order and carries it through reload', async ({ page }) => {
  await page.goto('./#/world/australia/party/pat?stamps=all&danced=koko,chompy')
  await page.getByRole('button', { name: /let\x27s play/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('pat')
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.params.danced)).toBe('koko,chompy')
  // A dancer already done has just the puppet; an unplayed one also has a floor spotlight.
  await expect(page.getByRole('button', { name: 'Koko', exact: true }).locator(':scope > div')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Chompy', exact: true }).locator(':scope > div')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Pat', exact: true }).locator(':scope > div')).toHaveCount(2)
  await page.getByRole('button', { name: 'Pat', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.params.danced)).toBe('koko,chompy,pat')
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.id)).toBe('mama')
  await page.reload()
  await page.getByRole('button', { name: /let\x27s play/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('mama')
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.params.danced)).toBe('koko,chompy,pat')
  await expect(page.getByRole('button', { name: 'Pat', exact: true }).locator(':scope > div')).toHaveCount(1)
})
