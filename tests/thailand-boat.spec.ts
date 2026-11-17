import { expect, test, type Page } from '@playwright/test'

// Captain Kaylee's boat trip, greybox 1 (src/world/places/thailand/activities/boat-trip/): the bay in 3D with every
// section link.
// Read-only state comes from window.__thaiBoatQA (no jump hooks: tests open section links).

type BoatQA = {
  mode: string
  section?: string
  phase?: string
  vehicle?: string
  where?: string
  pos?: [number, number]
  speed?: number
  boost?: boolean
  looking?: boolean
  lying?: Record<string, boolean>
  roof?: Record<string, number>
  photos?: number
  memory?: { geometries: number; textures: number }
}
const qa = (page: Page) => page.evaluate(() => window.__thaiBoatQA?.() as BoatQA | undefined)
const field = <K extends keyof BoatQA>(page: Page, key: K) => async () => (await qa(page))?.[key]

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  return errors
}

async function open(page: Page, section: string, query = '') {
  await page.goto('about:blank')
  await page.goto(`./${query}#/world/thailand/boat-trip/${section}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}

test('the bay renders in 3D and every section link lands', async ({ page }) => {
  const errors = trackErrors(page)
  for (const s of ['pier', 'bay', 'cave', 'nail']) {
    await open(page, s)
    await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
    expect(await page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe(s)
  }
  expect(errors).toEqual([])
})
