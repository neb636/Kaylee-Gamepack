import { expect, test, type Page } from '@playwright/test'

// The boat trip's trip kit, greybox 2 (src/world/places/thailand/trip/): without WebGL, every leg is a button. (The
// scripted play-throughs were dropped on 2026-10-20: the game changes too often for them. Section links and
// tap-around still open every leg.)

const section = (page: Page) => () => page.evaluate(() => window.__kayleeSection?.id)

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  return errors
}

async function open(page: Page, link: string, query = '?fps=30') {
  await page.goto('about:blank')
  await page.goto(`./${query}#/world/thailand/${link}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}
test('without WebGL, every leg is a button', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'boat-trip/goodbye', '?gl=off')
  await page.getByRole('button', { name: 'Airport' }).click()
  await expect.poll(section(page)).toBe('airport')
  await page.getByRole('button', { name: 'Flying' }).click()
  await expect.poll(section(page)).toBe('fly')
  expect(errors).toEqual([])
})
