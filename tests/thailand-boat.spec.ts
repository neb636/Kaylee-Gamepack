import { expect, test, type Page } from '@playwright/test'

// Captain Kaylee's boat trip, greybox 1 (src/world/places/thailand/activities/boat-trip/): the bay in 3D, driven with a
// real held finger and real taps on the tap targets, onto the Nail Island beach for a photo, the flat version without WebGL, and no leftover GPU memory going back and forth to Agong's house.
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

async function ready(page: Page) {
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  await expect(page.locator('[data-anchor="boat"]')).toBeVisible()
  // A bay link opens on Daddy's "where to?" look over the bay (the camera up high): let it come back down first.
  await expect.poll(field(page, 'looking'), { timeout: 10_000 }).toBeFalsy()
}

/** Holds a finger on the water ahead of the boat (above it on the screen). */
async function holdAhead(page: Page) {
  const b = (await page.locator('[data-anchor="boat"]').boundingBox())!
  const { height } = page.viewportSize()!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - height * 0.25)
  await page.mouse.down()
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

test('a finger on the water drives the longtail; letting go coasts; tapping the boat is a VROOM', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'bay')
  await ready(page)
  const start = (await qa(page))!.pos!
  await holdAhead(page)
  await expect.poll(field(page, 'speed'), { timeout: 15_000 }).toBeGreaterThan(5)
  // Up to speed: keep going a moment (it covers ~3 m getting there), then let go.
  await page.waitForTimeout(1200)
  await page.mouse.up()
  const moved = (await qa(page))!.pos!
  expect(Math.hypot(moved[0] - start[0], moved[1] - start[1])).toBeGreaterThan(8)
  // Let go: it coasts and slows down by itself.
  const fast = (await qa(page))!.speed!
  await expect.poll(field(page, 'speed'), { timeout: 10_000 }).toBeLessThan(fast - 1)
  await page.locator('[data-anchor="boat"]').click({ force: true })
  await expect.poll(field(page, 'boost'), { timeout: 5_000 }).toBe(true)
  expect(errors).toEqual([])
})

test('the Nail Island: land on the beach, pose for a photo, and set off again', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'nail')
  await ready(page)
  // Ko Tapu's buoys stand between the start and the beach: a tap finds its way round them.
  await page.locator('[data-anchor="glow:beach"]').click({ force: true })
  await expect.poll(field(page, 'phase'), { timeout: 60_000 }).toBe('beach')
  // A pose button: everyone strikes it, then the photo drops into the album.
  await page.getByRole('button', { name: 'Wave pose' }).click({ force: true })
  await expect.poll(field(page, 'photos'), { timeout: 10_000 }).toBe(1)
  await page.locator('[data-anchor="boat"]').click({ force: true })
  await expect.poll(field(page, 'phase'), { timeout: 20_000 }).toBe('drive')
  await expect(page.getByRole('button', { name: 'Wave pose' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('without WebGL, the flat stops still work', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'bay', '?gl=off')
  await page.getByRole('button', { name: 'The cave' }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.id)).toBe('cave')
  expect(errors).toEqual([])
})

test('going back and forth to Agong\'s house leaves no GPU memory behind', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'bay')
  await ready(page)
  const roundTrip = async () => {
    await page.getByRole('button', { name: 'Back to the map' }).click()
    await expect.poll(() => page.evaluate(() => (window.__thaiHouseQA?.() as { mode?: string } | undefined)?.mode), { timeout: 20_000 }).toBe('webgl')
    await page.evaluate(() => (location.hash = '#/world/thailand/boat-trip/bay'))
    await ready(page)
    await page.waitForTimeout(1000)
  }
  await roundTrip()
  const before = (await qa(page))!.memory!
  for (let i = 0; i < 3; i++) await roundTrip()
  const after = (await qa(page))!.memory!
  expect(after.geometries).toBeLessThanOrEqual(before.geometries + 2)
  expect(after.textures).toBeLessThanOrEqual(before.textures)
  expect(errors).toEqual([])
})
