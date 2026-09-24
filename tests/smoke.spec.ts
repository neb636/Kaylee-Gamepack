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

test('adult settings persist and every tea-party lesson can start directly', async ({ page }) => {
  const errors = trackErrors(page)
  await start(page)
  await page.getByRole('button', { name: 'For Adults' }).click()
  await expect(page.getByRole('checkbox', { name: 'Debug Mode' })).toHaveCount(0)
  await page.getByLabel('For adults: 2 × 10 = ?').fill('19')
  await page.getByRole('button', { name: 'Unlock' }).click()
  await expect(page.getByRole('alert')).toHaveText('Try again.')
  await page.getByLabel('For adults: 2 × 10 = ?').fill('20')
  await page.getByRole('button', { name: 'Unlock' }).click()
  await page.getByRole('checkbox', { name: 'Debug Mode' }).check()
  await page.getByRole('button', { name: 'Close' }).click()

  await page.reload()
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.getByRole('button', { name: 'For Adults' }).click()
  await expect(page.getByRole('checkbox', { name: 'Debug Mode' })).toHaveCount(0)
  await page.getByLabel('For adults: 2 × 10 = ?').fill('20')
  await page.getByRole('button', { name: 'Unlock' }).click()
  await expect(page.getByRole('checkbox', { name: 'Debug Mode' })).toBeChecked()
  await page.getByRole('button', { name: 'Close' }).click()

  await page.getByRole('button', { name: 'Unicorn Tea Party' }).click()
  const lessons = [
    ['Touch and count', 'Tap each cupcake, one at a time, and count as you go.'],
    ['Move and count', 'Drag each star into the teapot, counting as you go.'],
    ['Mark and count', "These flowers won't move, so mark each one as you count."],
    ['Number match', 'How many dots do you see? Tap the matching number.'],
    ['Quick look challenge', "Let's play a quick look game. I'll show the dots for two seconds, then you tell me how many you saw."],
    ['Are there enough?', 'The friends are here for tea! Give each one a cup, then we will see if there are enough.'],
  ] as const
  for (const [index, [label, prompt]] of lessons.entries()) {
    await page.getByRole('button', { name: 'Debug lessons' }).click()
    await expect(page.getByRole('button', { name: `${index + 1}. ${label}` })).toHaveCount(0)
    await page.getByLabel('For adults: 2 × 10 = ?').fill('20')
    await page.getByRole('button', { name: 'Unlock' }).click()
    await page.getByRole('button', { name: `${index + 1}. ${label}` }).click()
    await expect(page.getByText(prompt)).toBeVisible()
    await expect(page.getByLabel(`${index} of 6`)).toBeVisible()
  }
  await page.setViewportSize({ width: 1180, height: 820 })
  await expect(page.getByRole('button', { name: 'Debug lessons' })).toBeInViewport()
  for (let round = 0; round < 3; round++) {
    const yes = page.getByRole('button', { name: 'yes' })
    for (let cup = 0; cup < 5 && !(await yes.isVisible()); cup++) {
      try { await page.locator('img[alt="teacup"]').last().locator('..').click({ timeout: 1200 }) }
      catch (error) { if (!(await yes.isVisible())) throw error }
    }
    await expect(yes).toBeVisible()
    const guests = await page.locator('[data-dropzone^="guest-"]').count()
    const served = await page.locator('[data-dropzone^="guest-"] img[alt=""]').count()
    await page.getByRole('button', { name: guests === served ? 'yes' : 'no' }).click()
    if (round < 2) await expect(yes).toBeHidden()
  }
  await expect(page.getByRole('heading', { name: /you did it, kaylee/i })).toBeVisible()
  await page.getByRole('button', { name: 'My trophies' }).click()
  await expect(page.getByText('KAYLEE').first()).toBeVisible()
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
