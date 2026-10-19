import { expect, test, type Page } from '@playwright/test'

// Captain Kaylee's boat trip, greybox 1 (src/world/places/thailand/activities/boat-trip/): the bay in 3D, driven with a
// real held finger and real taps on the tap targets, through the low cave into the hong, onto the Nail Island beach for
// a photo, the flat version without WebGL, and no leftover GPU memory going back and forth to Agong's house.
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

test('at the cave the family swaps into the canoe, ducks under the low roof and comes out in the hong', async ({ page }) => {
  test.setTimeout(150_000)
  const errors = trackErrors(page)
  await open(page, 'bay')
  await ready(page)
  // The cave is off to the right of where the boat starts: steer round until its glow is on screen, then tap it. The
  // longtail drives there by itself and everyone hops into the canoe.
  const b = (await page.locator('[data-anchor="boat"]').boundingBox())!
  const { width, height } = page.viewportSize()!
  await page.mouse.move(width * 0.94, b.y - height * 0.1)
  await page.mouse.down()
  await expect(page.locator('[data-anchor="glow:cave"]')).toBeVisible({ timeout: 30_000 })
  await page.mouse.up()
  await page.locator('[data-anchor="glow:cave"]').click({ force: true })
  await expect.poll(field(page, 'vehicle'), { timeout: 60_000 }).toBe('canoe')
  await expect.poll(field(page, 'phase'), { timeout: 10_000 }).toBe('drive')
  expect(await page.evaluate(() => window.__kayleeSection?.id)).toBe('cave')
  // Paddle on in: nobody lay down, so every horn bonks the roof (Daddy's first), and in the hong they sit up again.
  await holdAhead(page)
  await expect.poll(field(page, 'where'), { timeout: 60_000 }).toBe('hong')
  await page.mouse.up()
  const q = (await qa(page))!
  expect(q.roof).toEqual({ kaylee: 1, ji: 1, nick: 1 })
  await expect.poll(async () => Object.values((await qa(page))!.lying!).some(Boolean), { timeout: 10_000 }).toBe(false)
  expect(errors).toEqual([])
})

test('tapping someone in the canoe lies them down before the roof, so their horn never bonks', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'cave')
  await ready(page)
  for (const who of ['nick', 'ji', 'kaylee']) {
    await page.locator(`[data-anchor="family:${who}"]`).click({ force: true })
    await expect.poll(async () => (await qa(page))!.lying![who]).toBe(true)
  }
  await holdAhead(page)
  await expect.poll(field(page, 'where'), { timeout: 60_000 }).toBe('hong')
  await page.mouse.up()
  expect((await qa(page))!.roof).toEqual({ kaylee: 0, ji: 0, nick: 0 })
  expect(errors).toEqual([])
})

test('the Nail Island: land on the beach, take a photo, and set off again', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'nail')
  await ready(page)
  // Ko Tapu's buoys stand between the start and the beach: a tap finds its way round them.
  await page.locator('[data-anchor="glow:beach"]').click({ force: true })
  await expect.poll(field(page, 'phase'), { timeout: 60_000 }).toBe('beach')
  await page.getByRole('button', { name: 'Take a photo' }).click({ force: true })
  await expect.poll(field(page, 'photos')).toBe(1)
  await page.locator('[data-anchor="boat"]').click({ force: true })
  await expect.poll(field(page, 'phase'), { timeout: 20_000 }).toBe('drive')
  await expect(page.getByRole('button', { name: 'Take a photo' })).toHaveCount(0)
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
