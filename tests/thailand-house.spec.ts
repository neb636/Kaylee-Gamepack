import { expect, test, type Page } from '@playwright/test'

// Agong's house, Thailand's 3D home base (src/world/places/thailand/activities/hub/): it renders in WebGL.
// Read-only state comes from window.__thaiHouseQA (no jump hooks).

type HouseQA = { mode: string; spot?: string; floor?: number; pose?: string; using?: string | null; memory?: { geometries: number; textures: number } }
const qa = (page: Page) => page.evaluate(() => window.__thaiHouseQA?.() as HouseQA | undefined)
const field = <K extends keyof HouseQA>(page: Page, key: K) => async () => (await qa(page))?.[key]

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  return errors
}

async function open(page: Page, link: string, query = '') {
  // A fresh page each time (a hash-only change wouldn't reload, and the "Let's play" splash wouldn't show).
  await page.goto('about:blank')
  await page.goto(`./${query}#/world/thailand/${link}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}

test('Agong\'s house renders in 3D', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'hub/downstairs')
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  await expect(page.locator('[data-anchor="family:agong"]')).toBeVisible()
  expect(errors).toEqual([])
})
