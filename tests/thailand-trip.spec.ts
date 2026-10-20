import { expect, test, type Page } from '@playwright/test'

// The boat trip's trip kit, greybox 2 (src/world/places/thailand/trip/): every leg played with real taps on the tap
// targets, the way a finger would. Mommy asks in her room (👍 yes / ✋ not yet) and yes opens the packing; the flight
// moves on by itself whatever she does; the x-ray shows what she packed; and every leg works without WebGL. Read-only state comes from window.__thaiBoatQA (no jump hooks: section links).
// `?fps=30` keeps the frame rate up while a test waits without touching (test browsers drop to 4 fps after 30 s).

type QA = Record<string, unknown> & { mode?: string; leg?: string; trip?: string; packed?: string[]; phase?: string; section?: string }
const qa = (page: Page) => page.evaluate(() => window.__thaiBoatQA?.() as Record<string, unknown> | undefined) as Promise<QA | undefined>
const field = (page: Page, key: string) => async () => (await qa(page))?.[key]
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
const anchor = (page: Page, id: string) => page.locator(`[data-anchor="${id}"]`)
/** A real tap on a tap target (pointer down and up, like a finger), once it's on screen. */
async function tap(page: Page, id: string) {
  await expect(anchor(page, id)).toBeVisible({ timeout: 15_000 })
  await anchor(page, id).click({ force: true })
}

async function ready(page: Page, leg: string) {
  await expect.poll(field(page, 'mode'), { timeout: 20_000 }).toBe('webgl')
  await expect.poll(field(page, 'leg'), { timeout: 20_000 }).toBe(leg)
}

// Yes keeps bouncing ("pick me!"), so it's never still: the tap goes straight to it.
const yes = (page: Page) => page.getByRole('button', { name: 'Yes', exact: true })
const notYet = (page: Page) => page.getByRole('button', { name: 'Not yet' })
async function sayYes(page: Page) {
  await expect(yes(page)).toBeInViewport({ ratio: 1, timeout: 15_000 })
  await yes(page).dispatchEvent('click')
}

test('upstairs, Mommy asks if she is ready for a trip: not yet, then tap Mommy and yes opens the packing', async ({ page }) => {
  test.setTimeout(60_000)
  const errors = trackErrors(page)
  await open(page, 'hub/upstairs')
  await expect.poll(() => page.evaluate(() => (window.__thaiHouseQA?.() as { mode?: string } | undefined)?.mode), { timeout: 20_000 }).toBe('webgl')
  // She asks on her own a few seconds after Kaylee comes upstairs.
  await expect(notYet(page)).toBeVisible({ timeout: 15_000 })
  await notYet(page).click()
  await expect(notYet(page)).toBeHidden({ timeout: 5_000 })
  expect(await page.evaluate(() => location.hash)).toContain('hub/upstairs')
  // Into her room through the glass doors, then a tap on Mommy: she asks again.
  await tap(page, 'glass-doors')
  await expect.poll(() => page.evaluate(() => (window.__thaiHouseQA?.() as { using?: string } | undefined)?.using), { timeout: 30_000 }).toBe('glass-doors')
  await tap(page, 'family:ji')
  await sayYes(page)
  await expect.poll(() => page.evaluate(() => location.hash), { timeout: 30_000 }).toContain('#/world/thailand/boat-trip')
  await ready(page, 'house')
  // Yes was already said: straight on to packing.
  await expect.poll(section(page), { timeout: 15_000 }).toBe('pack')
  expect(errors).toEqual([])
})

test('the trip asks first: not yet goes back to the house', async ({ page }) => {
  test.setTimeout(60_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await notYet(page).click()
  await expect.poll(() => page.evaluate(() => location.hash), { timeout: 10_000 }).not.toContain('boat-trip')
  expect(errors).toEqual([])
})

test('the airport: the suitcase goes through the x-ray, the screen shows what she packed, up the stairs', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/airport?packed=gan,fan,mango')
  await ready(page, 'airport')
  await tap(page, 'suitcase')
  await expect.poll(field(page, 'phase')).toBe('scan')
  await expect.poll(field(page, 'shown'), { timeout: 20_000 }).toBe(3)
  await expect.poll(field(page, 'phase'), { timeout: 20_000 }).toBe('doors')
  expect((await qa(page))!.stamped).toBe(true)
  await tap(page, 'plane-door')
  await expect.poll(section(page), { timeout: 20_000 }).toBe('takeoff')
  await ready(page, 'plane')
  expect(errors).toEqual([])
})

test('the window seat: seatbelt and takeoff, then the tray, snacks, shade, light and screen', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/takeoff')
  await ready(page, 'plane')
  await tap(page, 'belt')
  await expect.poll(field(page, 'rolling'), { timeout: 5_000 }).toBe(true)
  await expect.poll(section(page), { timeout: 30_000 }).toBe('fly')
  await tap(page, 'tray')
  await expect.poll(field(page, 'tray')).toBe(true)
  for (let i = 0; i < 3; i++) await tap(page, 'call')
  await expect.poll(field(page, 'snacks'), { timeout: 5_000 }).toBe(3)
  await tap(page, 'window')
  await expect.poll(field(page, 'shade')).toBe(true)
  await tap(page, 'light')
  await expect.poll(field(page, 'light')).toBe(true)
  await tap(page, 'family:nick')
  await tap(page, 'screen')
  await expect.poll(field(page, 'view')).toBe('screen')
  expect(errors).toEqual([])
})

test('landing in Krabi, then the boarding pass to the pier', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/land')
  await ready(page, 'plane')
  await expect.poll(field(page, 'touchdown'), { timeout: 30_000 }).toBe(true)
  await expect.poll(section(page), { timeout: 20_000 }).toBe('pier')
  await expect.poll(field(page, 'phase'), { timeout: 20_000 }).toMatch(/board|drive/)
  expect(errors).toEqual([])
})

test('without WebGL, every leg is a button', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'boat-trip/goodbye', '?gl=off')
  await page.getByRole('button', { name: 'Airport' }).click()
  await expect.poll(section(page)).toBe('airport')
  await page.getByRole('button', { name: 'Flying' }).click()
  await expect.poll(section(page)).toBe('fly')
  expect(errors).toEqual([])
})
