import { expect, test, type Page } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'

// Every folder in src/games with a meta.ts + Game.tsx is a game.
const gameIds = readdirSync('src/games', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/games/${d.name}/meta.ts`) && existsSync(`src/games/${d.name}/Game.tsx`))
  .map((d) => d.name)

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

async function start(page: Page, hash = '') {
  await page.goto(`./${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click()
}

test('home screen lists every game', async ({ page }) => {
  const errors = trackErrors(page)
  await start(page)
  await expect(page.getByRole('heading', { name: 'Hi Kaylee!' })).toBeVisible()
  await expect(page.getByRole('button', { name: /my trophies/i })).toBeVisible()
  expect(gameIds.length).toBeGreaterThan(0)
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

test('SDK playground renders', async ({ page }) => {
  const errors = trackErrors(page)
  await start(page, '#/playground')
  await expect(page.getByRole('heading', { name: 'SDK playground' })).toBeVisible()
  expect(errors).toEqual([])
})

for (const id of gameIds) {
  test(`game "${id}" loads, plays, and awards a trophy`, async ({ page }) => {
    const errors = trackErrors(page)
    await start(page, `#/game/${id}`)
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
    // Let the game render and settle, then make sure it shows something tappable.
    await page.waitForTimeout(1500)
    expect(await page.locator('button').count()).toBeGreaterThan(1)
    expect(errors).toEqual([])

    // Jump to the end through the test hook and check the trophy ceremony + trophy room.
    await page.evaluate(() => window.__kaylee?.win())
    await expect(page.getByRole('heading', { name: /you did it, kaylee/i })).toBeVisible()
    await page.getByRole('button', { name: 'My trophies' }).click()
    await expect(page.getByRole('heading', { name: "Kaylee's Trophies" })).toBeVisible()
    await expect(page.getByText('KAYLEE').first()).toBeVisible()

    // Trophies survive a reload.
    await page.reload()
    await page.getByRole('button', { name: /let's play/i }).click()
    await expect(page.getByText('KAYLEE').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}

// Around the World: every folder in src/world/places with a meta.ts + Place.tsx is a country.
const placeIds = readdirSync('src/world/places', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/world/places/${d.name}/meta.ts`) && existsSync(`src/world/places/${d.name}/Place.tsx`))
  .map((d) => d.name)

test('Around the World: map, passport and coloring book open', async ({ page }) => {
  const errors = trackErrors(page)
  await start(page)
  await page.getByRole('button', { name: 'Around the World' }).click()
  await expect(page.getByRole('button', { name: 'My passport' })).toBeVisible()
  await page.getByRole('button', { name: 'africa' }).click({ force: true })
  await page.getByRole('button', { name: 'My passport' }).click({ force: true })
  await expect(page.getByText('My Passport')).toBeVisible()
  await page.goto('./#/world/coloring')
  await page.locator('button[aria-label^="color page"]').first().click()
  await expect(page.getByLabel('coloring page')).toBeVisible()
  expect(errors).toEqual([])
})

for (const id of placeIds) {
  test(`place "${id}": every activity loads, stamps save, and the finale awards a trophy`, async ({ page }) => {
    const errors = trackErrors(page)
    await start(page, `#/world/${id}`)
    await expect(page.getByRole('button', { name: 'World map' })).toBeVisible()
    await page.getByRole('button', { name: 'Skip' }).click({ force: true }).catch(() => {})

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

    // Collect every stamp through the dev hook; stamps survive a reload.
    await page.evaluate(() => window.__kayleeWorld?.stampAll())
    await page.reload()
    await page.getByRole('button', { name: /let's play/i }).click()
    await expect(page.getByRole('button', { name: 'Party' })).toBeVisible()
    await page.getByRole('button', { name: 'Party' }).click({ force: true })
    await expect(page.getByRole('button', { name: 'Back to the map' })).toBeVisible()

    await page.evaluate(() => window.__kaylee?.win())
    await expect(page.getByRole('heading', { name: /you did it, kaylee/i })).toBeVisible()
    await page.getByRole('button', { name: 'My trophies' }).click()
    await expect(page.getByText('KAYLEE').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}
