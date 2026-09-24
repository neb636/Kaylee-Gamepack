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
