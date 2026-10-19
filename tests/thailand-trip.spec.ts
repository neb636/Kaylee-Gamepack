import { expect, test, type Page } from '@playwright/test'

// The boat trip's trip kit, greybox 2 (src/world/places/thailand/trip/): every leg played with real taps on the tap
// targets, the way a finger would. Mommy asks in her room (👍 yes / ✋ not yet); yes opens the suitcase; she packs
// (taps, a drag, a cousin), sits on it to close it (or the ✅ button) and walks down to the goodbye; Aunty Sri's van
// pulls up, everyone hops in and it pulls away to the airport; the flight moves on by itself whatever she does; the
// x-ray shows what she packed; and a half-done trip offers to keep going. Read-only state comes from window.__thaiBoatQA (no jump hooks: section links).
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

test('yes opens the suitcase; she packs by tapping and dragging, packs Gan, and sits on it to close it', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await sayYes(page)
  await expect.poll(section(page), { timeout: 10_000 }).toBe('pack')
  await expect.poll(field(page, 'trip'), { timeout: 10_000 }).toBe('pack')
  // Nothing in it yet: no close button, just the empty slots.
  await expect(page.getByRole('button', { name: 'Close the suitcase' })).toBeHidden()
  // Too empty to close: the suitcase gulps for more.
  await tap(page, 'trip:suitcase')
  expect((await qa(page))!.trip).toBe('pack')
  for (const id of ['sunglasses', 'floaties', 'duck', 'teddy', 'mango']) {
    await tap(page, `trip:item:${id}`)
    await page.waitForTimeout(250)
  }
  await expect.poll(async () => (await qa(page))!.packed!.length).toBe(5)
  await expect(page.getByRole('button', { name: 'Close the suitcase' })).toBeVisible()
  // One out again, one in by dragging it across the room into the suitcase.
  await tap(page, 'trip:item:mango')
  await expect.poll(async () => (await qa(page))!.packed!.includes('mango')).toBe(false)
  const from = (await anchor(page, 'trip:item:bucket').boundingBox())!
  const to = (await anchor(page, 'trip:suitcase').boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 })
  await page.mouse.up()
  await expect.poll(async () => (await qa(page))!.packed!.includes('bucket'), { timeout: 5_000 }).toBe(true)
  // Gan, asleep on the mattress, goes in too: six things now, too full, so three hops.
  await tap(page, 'family:gan')
  await expect.poll(async () => (await qa(page))!.packed!.length).toBe(6)
  await tap(page, 'trip:suitcase')
  await expect.poll(field(page, 'trip'), { timeout: 10_000 }).toBe('sitting')
  await expect.poll(field(page, 'hops'), { timeout: 15_000 }).toBe(1)
  // Hop again on the suitcase, and once with the ✅ button.
  await page.waitForTimeout(500)
  await tap(page, 'trip:suitcase')
  await expect.poll(field(page, 'hops'), { timeout: 5_000 }).toBe(2)
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Close the suitcase' }).click({ force: true })
  await expect.poll(field(page, 'hops'), { timeout: 5_000 }).toBe(3)
  // Click! Mommy tucks in sunscreen and her spare sun hat; then down the stairs, and the boarding pass to the goodbye.
  await expect.poll(field(page, 'closed'), { timeout: 5_000 }).toBe(true)
  expect((await qa(page))!.packed).toEqual(expect.arrayContaining(['sunscreen', 'sunhat', 'gan', 'bucket']))
  await expect.poll(section(page), { timeout: 30_000 }).toBe('goodbye')
  expect(await page.evaluate(() => location.hash)).toContain('packed=')
  expect(await page.evaluate(() => location.hash)).toContain('gan')
  expect(errors).toEqual([])
})

test("the goodbye: a hug for Jum, Aunty Sri's van pulls up, tap it, everyone hops in and it pulls away to the airport", async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/goodbye?packed=gan,fan,mango')
  await ready(page, 'house')
  // Gan is in the suitcase, so he isn't at the shutter.
  await expect(anchor(page, 'family:agong')).toBeVisible()
  await expect(anchor(page, 'family:gan')).toBeHidden()
  await tap(page, 'family:jum')
  await expect.poll(field(page, 'hugs')).toBe(1)
  await expect(anchor(page, 'trip:van')).toBeVisible({ timeout: 15_000 })
  await tap(page, 'trip:van')
  await expect.poll(field(page, 'trip'), { timeout: 10_000 }).toBe('gone')
  await expect.poll(section(page), { timeout: 20_000 }).toBe('airport')
  await ready(page, 'airport')
  expect(errors).toEqual([])
})

test('nobody taps the van: everyone gets in anyway', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/goodbye')
  await ready(page, 'house')
  // (Test browsers draw slowly, so the van's few seconds run long here.)
  await expect.poll(section(page), { timeout: 50_000 }).toBe('airport')
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

test('a half-done trip: yes offers to keep going from where she stopped', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  // Finish the goodbye (the trip saves: next time it starts at the airport).
  await open(page, 'boat-trip/goodbye')
  await ready(page, 'house')
  await expect(anchor(page, 'trip:van')).toBeVisible({ timeout: 15_000 })
  await tap(page, 'trip:van')
  await expect.poll(section(page), { timeout: 20_000 }).toBe('airport')
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await sayYes(page)
  // The boarding pass slides up from below first.
  await expect(page.getByRole('button', { name: 'Keep going' })).toBeInViewport({ ratio: 1 })
  await page.getByRole('button', { name: 'Keep going' }).click()
  await expect.poll(section(page), { timeout: 20_000 }).toBe('airport')
  await ready(page, 'airport')
  // And "a new trip" starts packing again.
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await sayYes(page)
  // The boarding pass slides up from below first.
  await expect(page.getByRole('button', { name: 'A new trip' })).toBeInViewport({ ratio: 1 })
  await page.getByRole('button', { name: 'A new trip' }).click()
  await expect.poll(section(page), { timeout: 10_000 }).toBe('pack')
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
