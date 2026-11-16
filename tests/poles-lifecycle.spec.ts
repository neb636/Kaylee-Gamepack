import { expect, test, type Page } from '@playwright/test'

// Lifecycle contracts for the Poles' ending, The Longest Night (activities/night/): a section link opens straight into
// its act (no film before it), GPU recovery keeps where she was, and leaving an act cancels what it had pending. Every
// act answers on window.__polesNightQA (only one is on screen at a time).
async function open(page: Page, hash: string) {
  await page.goto(`./#/world/poles/night/${hash}`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.waitForFunction(() => window.__polesNightQA?.().mode === 'webgl')
}

async function loseContext(page: Page, wakeLabel: RegExp) {
  await page.locator('canvas[data-engine]').evaluate((canvas: HTMLCanvasElement) => {
    const ext = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')
    if (!ext) throw new Error('GPU context loss is unavailable')
    ext.loseContext()
  })
  await expect(page.getByRole('button', { name: wakeLabel })).toBeVisible()
}

test('an act opens from its link with no film before it', async ({ page }) => {
  await open(page, 'huddle?part=middle')
  await expect(page.locator('[data-story-film]')).toHaveCount(0)
  const q = (await page.evaluate(() => window.__polesNightQA!())) as { section: string; part: string; step: string }
  expect(q.section).toBe('huddle')
  expect(q.part).toBe('middle')
  expect(q.step).toBe('packed')
})

test('flight recovery keeps the stretch of the way she was on', async ({ page }) => {
  await open(page, 'fly?leg=warm')
  await loseContext(page, /to fly again/)
  await page.getByRole('button', { name: /to fly again/ }).click()
  await page.waitForFunction(() => window.__polesNightQA?.().mode === 'webgl')
  const q = (await page.evaluate(() => window.__polesNightQA!())) as { section: string; leg: string }
  expect(q.section).toBe('fly')
  expect(q.leg).toBe('warm')
})

test('leaving the goodbye flight cancels its pending trophy', async ({ page }) => {
  await open(page, 'goodbye')
  await page.evaluate(() => {
    location.hash = '#/world/poles/hub/globe'
  })
  await page.waitForFunction(() => !!window.__polesGlobeQA)
  await page.waitForTimeout(4000)
  await expect(page.getByRole('heading', { name: /You did it/ })).toHaveCount(0)
})
