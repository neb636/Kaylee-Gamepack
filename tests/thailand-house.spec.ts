import { expect, test, type Page } from '@playwright/test'

// Agong's house, Thailand's 3D home base (src/world/places/thailand/activities/hub/): the real WebGL path, the flat
// house a browser without WebGL gets, a walk around with real taps on the house's tap targets, and no leftover GPU
// memory after going back and forth. Read-only state comes from window.__thaiHouseQA (no jump hooks).

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

/** Taps a thing in the house through its tap target (a real pointer down + up, like a finger). */
const tap = (page: Page, id: string) => page.locator(`[data-anchor="${id}"]`).click()

test('Agong\'s house renders in 3D', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'hub/downstairs')
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  await expect(page.locator('[data-anchor="family:agong"]')).toBeVisible()
  expect(errors).toEqual([])
})

test('without WebGL, the flat house still works', async ({ page }) => {
  const errors = trackErrors(page)
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return /webgl/i.test(type) ? null : (get as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest)
    } as typeof get
  })
  await open(page, 'hub/street')
  await expect(page.getByRole('button', { name: 'Upstairs' })).toBeVisible()
  expect(await page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('street')
  await page.getByRole('button', { name: 'Upstairs' }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.id)).toBe('upstairs')
  await page.getByRole('button', { name: 'Mommy' }).click()
  // ?gl=off shows the same flat house (for checking it on a real device).
  await open(page, 'hub/downstairs', '?gl=off')
  await expect(page.getByRole('button', { name: 'Table' })).toBeVisible()
  expect(errors).toEqual([])
})

test('a walk around the house with real taps', async ({ page }) => {
  test.setTimeout(150_000)
  const errors = trackErrors(page)
  await open(page, 'hub/street')
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  // The front door rolls up and she walks in.
  await tap(page, 'shutter')
  await expect.poll(field(page, 'spot'), { timeout: 30_000 }).toBe('downstairs')
  await tap(page, 'table')
  await expect.poll(field(page, 'using'), { timeout: 30_000 }).toBe('table')
  await expect.poll(field(page, 'pose')).toBe('sit')
  await tap(page, 'cabinet')
  await expect.poll(field(page, 'using'), { timeout: 30_000 }).toBe('cabinet')
  // Up the stairs, through the glass doors into her room, and onto the mattress.
  await tap(page, 'stairs-up')
  await expect.poll(field(page, 'spot'), { timeout: 40_000 }).toBe('upstairs')
  await tap(page, 'glass-doors')
  await expect.poll(field(page, 'using'), { timeout: 30_000 }).toBe('glass-doors')
  await tap(page, 'mattress')
  await expect.poll(field(page, 'pose'), { timeout: 30_000 }).toBe('bounce')
  expect(await page.evaluate(() => window.__kayleeSectionLog?.map((s) => s.id))).toEqual(['street', 'downstairs', 'downstairs', 'downstairs', 'upstairs', 'upstairs', 'upstairs'])
  expect(await page.evaluate(() => location.hash)).toBe('#/world/thailand/hub/upstairs?at=mattress')
  expect(errors).toEqual([])
})

test('the family photo: everyone in front of Agong\'s house, and each of them alone', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'hub/family')
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  // Fourteen name pills: the whole family and Kaylee.
  for (const id of ['kaylee', 'ji', 'nick', 'agong', 'jum', 'joy', 'bird', 'ja', 'sri', 'gan', 'ken', 'bb', 'putto', 'putter']) await expect(page.locator(`[data-anchor="family:${id}"]`)).toBeVisible()
  await tap(page, 'family:putter')
  await open(page, 'hub/family?who=ja')
  await expect(page.locator('[data-anchor="family:ja"]')).toBeVisible()
  await expect(page.locator('[data-anchor="family:agong"]')).toBeHidden()
  expect(await page.evaluate(() => window.__kayleeSection)).toMatchObject({ id: 'family', params: { who: 'ja' } })
  expect(errors).toEqual([])
})

test('going to the party and back leaves no GPU memory behind', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'hub/downstairs')
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  const roundTrip = async () => {
    await page.getByRole('button', { name: 'Party' }).click({ force: true })
    await expect(page.getByRole('button', { name: 'Back to the map' })).toBeVisible()
    await page.getByRole('button', { name: 'Back to the map' }).click()
    await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
    // Back where she was.
    await expect.poll(field(page, 'spot')).toBe('downstairs')
    await page.waitForTimeout(1500)
  }
  await roundTrip()
  const before = (await qa(page))!.memory!
  for (let i = 0; i < 4; i++) await roundTrip()
  const after = (await qa(page))!.memory!
  expect(after.geometries).toBeLessThanOrEqual(before.geometries + 2)
  expect(after.textures).toBeLessThanOrEqual(before.textures)
  expect(errors).toEqual([])
})
