import { expect, test, type Page } from '@playwright/test'

// Lifecycle contracts: a departed finale cannot win, and GPU recovery keeps earned progress.
async function open(page: Page, section: string) {
  await page.goto(`./#/world/poles/party/${section}${section.includes('?') ? '&' : '?'}stamps=all`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.waitForFunction(() => window.__polesPartyQA?.().mode === 'webgl')
}

async function loseContext(page: Page) {
  await page.locator('canvas[data-engine]').evaluate((canvas: HTMLCanvasElement) => {
    const ext = canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')
    if (!ext) throw new Error('GPU context loss is unavailable')
    ext.loseContext()
  })
  await expect(page.getByRole('button', { name: /wake the sky/i })).toBeVisible()
}

async function wake(page: Page) {
  await page.getByRole('button', { name: /wake the sky/i }).click()
  await expect(page.getByRole('button', { name: /wake the sky/i })).toHaveCount(0)
  await page.waitForFunction(() => window.__polesPartyQA?.().mode === 'webgl')
}

const trophy = (page: Page) => page.getByRole('heading', { name: /You did it/ })

test('leaving the badge cancels its pending trophy', async ({ page }) => {
  await open(page, 'badge')
  await page.evaluate(() => { location.hash = '#/world/poles/hub/globe' })
  await page.waitForFunction(() => !!window.__polesGlobeQA)
  await page.waitForTimeout(5000)
  await expect(trophy(page)).toHaveCount(0)
})

test('flight recovery keeps the current position and catches', async ({ page }) => {
  await open(page, 'fly?leg=warm')
  await page.waitForFunction(() => Number(window.__polesPartyQA?.().along) > 0.3)
  await loseContext(page)
  const before = await page.evaluate(() => window.__polesPartyQA!())
  await wake(page)
  const after = await page.evaluate(() => window.__polesPartyQA!())
  expect(after.section).toBe('fly')
  expect(after.leg).toBe(before.leg)
  expect(Number(after.along)).toBeCloseTo(Number(before.along), 1)
  expect(after.fish).toBe(before.fish)
})

test('quiz recovery keeps a newly earned star and advances past its answered question', async ({ page }) => {
  await open(page, 'quiz?q=tern&stars=2')
  // Terry is the third real piece in this question.
  await expect(page.locator('[data-anchor="opt2"]')).toBeVisible()
  await page.locator('[data-anchor="opt2"]').click({ force: true })
  await page.waitForFunction(() => window.__polesPartyQA?.().stars === 3)
  await loseContext(page)
  await wake(page)
  const q = await page.evaluate(() => window.__polesPartyQA!())
  expect(q.section).toBe('quiz')
  expect(q.stars).toBe(3)
  expect(q.question).not.toBe('tern')
  expect(q.state).toBe('ask')
})

test('recovery after delivery stays in the quiz', async ({ page }) => {
  await open(page, 'deliver')
  await page.waitForFunction(() => window.__polesPartyQA?.().section === 'quiz', null, { timeout: 15000 })
  await loseContext(page)
  const before = await page.evaluate(() => window.__polesPartyQA!())
  await wake(page)
  const after = await page.evaluate(() => window.__polesPartyQA!())
  expect(after.section).toBe('quiz')
  expect(after.question).toBe(before.question)
  expect(after.stars).toBe(before.stars)
})

test('lost badge waits for recovery before opening the trophy', async ({ page }) => {
  await open(page, 'badge')
  await loseContext(page)
  await page.waitForTimeout(5000)
  await expect(trophy(page)).toHaveCount(0)
  await wake(page)
  expect(await page.evaluate(() => window.__polesPartyQA?.().section)).toBe('badge')
  await page.getByRole('button', { name: 'The trophy', exact: true }).click()
  await expect(trophy(page)).toBeVisible()
})
