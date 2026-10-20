import { expect, test, type Page } from '@playwright/test'

// The trip falls back to a picture book without WebGL. Scripted 3D play-throughs were
// dropped on 2026-10-20; section links and tap-around still open every leg.

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
test('without WebGL, the trip is a picture book: one tap per leg, the stops as cards, home to Agong and the stamp', async ({ page }) => {
  test.setTimeout(60_000)
  const errors = trackErrors(page)
  // (The big buttons pulse, so they're never still: taps go straight to them.)
  await open(page, 'boat-trip/goodbye', '?gl=off')
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await expect.poll(section(page)).toBe('airport')
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await expect.poll(section(page)).toBe('takeoff')
  await open(page, 'boat-trip/bay', '?gl=off')
  await page.getByRole('button', { name: 'The village' }).click({ force: true })
  await page.getByRole('button', { name: 'The Nail Island' }).click({ force: true })
  await expect.poll(section(page)).toBe('nail')
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Take the photo' }).click({ force: true })
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await expect.poll(section(page)).toBe('sunset')
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Next' }).click({ force: true })
  await expect.poll(section(page)).toBe('home')
  await page.getByRole('button', { name: 'Give Agong the photo' }).click({ force: true })
  // The stamp screen (its button back to the map is the second "Back to the map").
  await expect.poll(() => page.getByRole('button', { name: 'Back to the map' }).count(), { timeout: 20_000 }).toBeGreaterThan(1)
  expect(errors).toEqual([])
})
