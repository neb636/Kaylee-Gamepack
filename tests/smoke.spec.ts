import { expect, test, type Page } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'

function trackErrors(page: Page) {
  const errors: string[] = []
  // The Theater's YouTube embed (loaded ahead of the tap) reports its own noise; only our errors count.
  page.on('pageerror', (e) => {
    if (!/youtube/i.test(e.message)) errors.push(`pageerror: ${e.message}`)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !/youtube/i.test(`${m.text()} ${m.location().url}`)) errors.push(`console: ${m.text()}`)
  })
  return errors
}

async function start(page: Page, hash = '') {
  await page.goto(`./${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}

test("Let's play lands on the world map, with the dock and country pins", async ({ page }) => {
  const errors = trackErrors(page)
  await start(page)
  await expect(page.getByRole('button', { name: 'My passport' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Coloring book' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Australia', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /tea party/i })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('first tap plays a generated Sparkle voice clip', async ({ page }) => {
  const errors = trackErrors(page)
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false })
    const observed = window as unknown as { __voiceStarts: number }
    observed.__voiceStarts = 0
    const original = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      observed.__voiceStarts++
      return original.apply(this, args)
    }
  })
  await start(page)
  await expect.poll(() => page.evaluate(() => (window as unknown as { __voiceStarts: number }).__voiceStarts)).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

// Around the World: every folder in src/world/places with a meta.ts + Place.tsx is a country.
const placeIds = readdirSync('src/world/places', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/world/places/${d.name}/meta.ts`) && existsSync(`src/world/places/${d.name}/Place.tsx`))
  .map((d) => d.name)

test('Around the World: map, passport and coloring book open', async ({ page }) => {
  const errors = trackErrors(page)
  await start(page)
  await expect(page.getByRole('button', { name: 'My passport' })).toBeVisible()
  await page.getByRole('button', { name: 'africa' }).click({ force: true })
  await page.getByRole('button', { name: 'My passport' }).click({ force: true })
  await expect(page.getByText('My Passport')).toBeVisible()
  await page.goto('./#/world/coloring')
  await page.locator('button[aria-label^="color page"]').first().click()
  await expect(page.getByLabel('coloring page')).toBeVisible()
  // Theater: ticket cards open a poster with a big play button (the video itself isn't played in tests).
  await page.goto('./#/world/theater')
  await page.getByRole('button', { name: /^Watch / }).first().click()
  await expect(page.getByRole('button', { name: 'Play the video' })).toBeVisible()
  await page.getByRole('button', { name: 'All videos' }).click()
  await expect(page.getByRole('button', { name: /^Watch / }).first()).toBeVisible()
  expect(errors).toEqual([])
})

for (const id of placeIds) {
  test(`place "${id}": every activity loads, stamps save, and the finale awards a trophy`, async ({ page }) => {
    // A 3D country opens 8-10 activities here, each a 3D scene in a browser with no GPU.
    test.setTimeout(2 * 60_000)
    const errors = trackErrors(page)
    await start(page, `#/world/${id}`)
    await expect(page.getByRole('button', { name: 'World map' })).toBeVisible()
    // A country with an opening story shows Skip; the 3D ones (Canada, the Poles, Thailand) open on their map, so
    // don't wait for it (with no timeout this click waited out the whole test).
    await page.getByRole('button', { name: 'Skip' }).click({ force: true, timeout: 3000 }).catch(() => {})

    // Open each activity spot (the glowing buttons on the country map) and come back.
    await page.waitForTimeout(800)
    for (const activity of await page.evaluate(() => [...document.querySelectorAll('[class*="world-glow"][aria-label]')].map((b) => b.getAttribute('aria-label')))) {
      if (!activity || activity === 'Party') continue
      await page.getByRole('button', { name: activity }).click({ force: true })
      await expect(page.getByRole('button', { name: 'Back to the map' })).toBeVisible()
      await page.waitForTimeout(800)
      expect(await page.locator('button').count()).toBeGreaterThan(1)
      await page.getByRole('button', { name: 'Back to the map' }).click()
      await page.waitForTimeout(400)
    }

    // The Theater button in the country's top bar (if it has videos) opens its ticket shelf.
    const theater = page.getByRole('button', { name: 'Theater', exact: true })
    if (await theater.count()) {
      await theater.click({ force: true })
      await expect(page.getByRole('button', { name: /^Watch / }).first()).toBeVisible()
      await page.getByRole('button', { name: 'Back to the map' }).click()
      await page.waitForTimeout(400)
    }

    // Collect every stamp through the dev hook; stamps survive a reload.
    await page.evaluate(() => window.__kayleeWorld?.stampAll())
    await page.reload()
    await page.getByRole('button', { name: /let's play/i }).click()
    // The finale's button: "Party" on most maps; on the 3D ones it's named for the place (Canada's Pond Hockey pin,
    // the Poles' "Pole to Pole" spot), so find it by its activity id there.
    const finale = page.locator('button[aria-label="Party"], button[data-anchor="go:party"], button[data-activity="party"]').first()
    // Canada's pins stay hidden until the 3D scene has compiled its shaders: wait for it to show, not just exist.
    await expect(finale).toBeVisible({ timeout: 20_000 })
    await finale.click({ force: true })
    await expect(page.getByRole('button', { name: 'Back to the map' })).toBeVisible()

    await page.evaluate(() => window.__kaylee?.win())
    await expect(page.getByRole('heading', { name: /you did it!/i })).toBeVisible()
    await expect(page.getByText('KAYLEE', { exact: true })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('Italy ignores retired saved stamps and keeps current activities', async ({ page }) => {
  const errors = trackErrors(page)
  await page.addInitScript(() => {
    localStorage.setItem('kaylee-gamepack:/:world', JSON.stringify({ visited: ['italy'], stamps: { italy: ['retired-activity', 'pizzeria'] } }))
  })
  await start(page, '#/world/italy')
  await expect(page.getByText('1/6', { exact: true })).toBeVisible()
  for (const name of ['Pizzeria in Naples', 'Olive Grove', 'The Colosseum', 'Venice', 'Trevi Fountain', 'Snow on a Volcano']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
  }
  expect(await page.locator('button[aria-label]').evaluateAll((buttons) => buttons.filter((b) => b.getAttribute('aria-label')?.includes('Tower')).length)).toBe(0)
  expect(errors).toEqual([])
})

const KEY = 'kaylee-gamepack:/:world'
const saved = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), KEY)

test('a broken link opens the home screen instead of stopping the app', async ({ page }) => {
  const errors = trackErrors(page)
  await page.goto('./#/world/%')
  await expect(page.getByRole('button', { name: /let's play/i })).toBeVisible()
  expect(errors).toEqual([])
})

test("a finale test link doesn't save stamps to the real passport", async ({ page }) => {
  await start(page, '#/world/australia/party/story?stamps=all')
  await page.waitForTimeout(500)
  expect((await saved(page)).stamps?.australia ?? []).toEqual([])
})

test("a second tab can't erase stamps the first tab saved", async ({ context }) => {
  const a = await context.newPage()
  const b = await context.newPage()
  // Both tabs read the passport before either saves.
  await start(a, '#/world/australia')
  await start(b, '#/world/italy')
  await a.waitForFunction(() => window.__kayleeWorld)
  await b.waitForFunction(() => window.__kayleeWorld)
  await a.evaluate(() => window.__kayleeWorld!.stampAll())
  await b.evaluate(() => window.__kayleeWorld!.stampAll())
  const data = await saved(b)
  expect(data.stamps.australia?.length).toBeGreaterThan(0)
  expect(data.stamps.italy?.length).toBeGreaterThan(0)
})
