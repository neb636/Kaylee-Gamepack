import { expect, test, type Page } from '@playwright/test'

// The boat trip's trip kit, greybox 2 (src/world/places/thailand/trip/): every leg played with real taps on the tap
// targets, the way a finger would. The elephant map in her room opens the trip; the boat pin opens the suitcase; she
// packs (taps, a drag, a cousin), sits on it to close it and walks down to the goodbye; Aunty Sri's car pulls up; the
// car ride and the flight move on by themselves whatever she does; the x-ray shows what she packed; and a half-done
// trip offers to keep going. Read-only state comes from window.__thaiBoatQA (no jump hooks: section links).
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

test('the elephant map in her room opens the boat trip', async ({ page }) => {
  test.setTimeout(60_000)
  const errors = trackErrors(page)
  await open(page, 'hub/upstairs')
  await expect.poll(() => page.evaluate(() => (window.__thaiHouseQA?.() as { mode?: string } | undefined)?.mode), { timeout: 20_000 }).toBe('webgl')
  // Into her room through the glass doors, then up to the map above her suitcase.
  await tap(page, 'glass-doors')
  await expect.poll(() => page.evaluate(() => (window.__thaiHouseQA?.() as { using?: string } | undefined)?.using), { timeout: 30_000 }).toBe('glass-doors')
  await tap(page, 'map')
  await expect.poll(() => page.evaluate(() => location.hash), { timeout: 30_000 }).toContain('#/world/thailand/boat-trip')
  await ready(page, 'house')
  expect(await page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('invite')
  await expect(anchor(page, 'trip:pin')).toBeVisible()
  expect(errors).toEqual([])
})

test('the boat pin opens the suitcase; she packs by tapping and dragging, packs Gan, and sits on it to close it', async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await tap(page, 'trip:pin')
  await expect.poll(section(page), { timeout: 10_000 }).toBe('pack')
  await expect.poll(field(page, 'trip'), { timeout: 10_000 }).toBe('pack')
  // Too empty to close: the suitcase gulps for more.
  await tap(page, 'trip:suitcase')
  expect((await qa(page))!.trip).toBe('pack')
  for (const id of ['sunglasses', 'floaties', 'duck', 'teddy', 'mango']) {
    await tap(page, `trip:item:${id}`)
    await page.waitForTimeout(250)
  }
  await expect.poll(async () => (await qa(page))!.packed!.length).toBe(5)
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
  for (const n of [2, 3]) {
    await page.waitForTimeout(500)
    await tap(page, 'trip:suitcase')
    await expect.poll(field(page, 'hops'), { timeout: 5_000 }).toBe(n)
  }
  // Click! Mommy tucks in sunscreen and her spare sun hat; then down the stairs, and the boarding pass to the goodbye.
  await expect.poll(field(page, 'closed'), { timeout: 5_000 }).toBe(true)
  expect((await qa(page))!.packed).toEqual(expect.arrayContaining(['sunscreen', 'sunhat', 'gan', 'bucket']))
  await expect.poll(section(page), { timeout: 30_000 }).toBe('goodbye')
  expect(await page.evaluate(() => location.hash)).toContain('packed=')
  expect(await page.evaluate(() => location.hash)).toContain('gan')
  expect(errors).toEqual([])
})

test('the goodbye: a hug for Jum, the car pulls up, tap it and everyone hops in', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/goodbye?packed=gan,fan,mango')
  await ready(page, 'house')
  // Gan is in the suitcase, so he isn't at the shutter.
  await expect(anchor(page, 'family:agong')).toBeVisible()
  await expect(anchor(page, 'family:gan')).toBeHidden()
  await tap(page, 'family:jum')
  await expect.poll(field(page, 'hugs')).toBe(1)
  await expect(anchor(page, 'trip:car')).toBeVisible({ timeout: 15_000 })
  await tap(page, 'trip:car')
  await expect.poll(section(page), { timeout: 20_000 }).toBe('car')
  await ready(page, 'car')
  expect(errors).toEqual([])
})

test("Aunty Sri's car: seatbelt, window, radio, horn and waving, and it gets to the airport by itself", async ({ page }) => {
  test.setTimeout(120_000)
  const errors = trackErrors(page)
  await open(page, 'boat-trip/car')
  await ready(page, 'car')
  // Uncle Bird rides alongside on his motorbike as they set off: wave at him.
  await tap(page, 'out:bird')
  await expect.poll(field(page, 'waves')).toBe(1)
  await tap(page, 'belt')
  await expect.poll(field(page, 'belt')).toBe(true)
  await tap(page, 'window')
  await expect.poll(field(page, 'window')).toBe(true)
  await tap(page, 'radio')
  await expect.poll(field(page, 'radio')).toBe(true)
  await tap(page, 'horn')
  await expect.poll(field(page, 'horns')).toBe(1)
  await expect(anchor(page, 'out:tuk')).toBeVisible({ timeout: 30_000 })
  await tap(page, 'out:tuk')
  await expect.poll(field(page, 'waves')).toBe(2)
  // Nothing else to do: it drives on and stops at the airport.
  await expect.poll(section(page), { timeout: 70_000 }).toBe('airport')
  await ready(page, 'airport')
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

test('a half-done trip: the boat pin offers to keep going from where she stopped', async ({ page }) => {
  test.setTimeout(90_000)
  const errors = trackErrors(page)
  // Finish the goodbye (the trip saves: next time it starts in the car).
  await open(page, 'boat-trip/goodbye')
  await ready(page, 'house')
  await expect(anchor(page, 'trip:car')).toBeVisible({ timeout: 15_000 })
  await tap(page, 'trip:car')
  await expect.poll(section(page), { timeout: 20_000 }).toBe('car')
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await tap(page, 'trip:pin')
  await page.getByRole('button', { name: 'Keep going' }).click()
  await expect.poll(section(page), { timeout: 20_000 }).toBe('car')
  await ready(page, 'car')
  // And "a new trip" starts packing again.
  await open(page, 'boat-trip/invite')
  await ready(page, 'house')
  await tap(page, 'trip:pin')
  await page.getByRole('button', { name: 'A new trip' }).click()
  await expect.poll(section(page), { timeout: 10_000 }).toBe('pack')
  expect(errors).toEqual([])
})

test('without WebGL, every leg is a button', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page, 'boat-trip/car', '?gl=off')
  await page.getByRole('button', { name: 'Airport' }).click()
  await expect.poll(section(page)).toBe('airport')
  await page.getByRole('button', { name: 'Flying' }).click()
  await expect.poll(section(page)).toBe('fly')
  expect(errors).toEqual([])
})
