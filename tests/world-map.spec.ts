import { expect, test } from '@playwright/test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

// Every country on the map, from its own meta.ts, so a new one is checked without touching this file.
const names = readdirSync('src/world/places', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/world/places/${d.name}/meta.ts`))
  .map((d) => /^\s*name: ['"](.+?)['"],$/m.exec(readFileSync(`src/world/places/${d.name}/meta.ts`, 'utf8'))![1])

const SCREENS = [
  { name: 'iPad landscape', viewport: { width: 1180, height: 820 }, target: 88 },
  { name: 'iPad portrait', viewport: { width: 820, height: 1180 }, target: 88 },
  { name: 'small iPad landscape', viewport: { width: 1024, height: 768 }, target: 88 },
  { name: 'iPhone landscape', viewport: { width: 844, height: 390 }, target: 64 },
  { name: 'iPhone portrait', viewport: { width: 390, height: 844 }, target: 64 },
]

for (const { name, viewport, target } of SCREENS) {
  test(`world map on ${name}: every country has a big tap target and none overlap`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('./#/world?view=map')
    await page.getByRole('button', { name: /let's play/i }).click()
    const boxes = await Promise.all(names.map(async (n) => ({ n, box: (await page.getByRole('button', { name: n, exact: true }).boundingBox())! })))
    for (const { n, box } of boxes) expect(box.width, `${n} is big enough`).toBeGreaterThanOrEqual(target - 0.5)
    for (const a of boxes)
      for (const b of boxes) {
        if (a.n >= b.n) continue
        const apart = Math.hypot(a.box.x - b.box.x, a.box.y - b.box.y)
        expect(apart, `${a.n} and ${b.n} don't overlap`).toBeGreaterThanOrEqual((a.box.width + b.box.width) / 2)
      }
  })
}

test('tapping a country flies there', async ({ page }) => {
  await page.goto('./#/world?view=map')
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.getByRole('button', { name: 'Italy', exact: true }).click()
  await expect(page).toHaveURL(/#\/world\/italy/, { timeout: 10_000 })
})
