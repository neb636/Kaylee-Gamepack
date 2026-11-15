import { expect, test, type Page } from '@playwright/test'

// Thailand's floating 3D maps (the Thailand map, the Krabi map, the Nan map): every one turns like the Thailand map
// (a drag swings the board round, trip/sky.ts boardShot), and no rock on the Krabi map stands half on the beach.
// Read-only state comes from each map's QA hook (no jump hooks: tests open section links).

type MapQA = { mode?: string; yaw?: number; stranded?: string[]; held?: boolean; car?: [number, number] }

const MAPS = [
  { name: 'the Thailand map', link: 'hub/map', key: '__thaiMapQA' },
  { name: 'the Krabi map', link: 'boat-trip/map', key: '__thaiBoatQA' },
  { name: 'the Nan map', link: 'nan-trip/map', key: '__thaiNanQA' },
] as const

// (Three 3D boards on the CI's software renderer: each frame is slow, so each test gets three times as long.)
test.beforeEach(() => test.slow())

const qa = (page: Page, key: string) => page.evaluate((k) => (window as unknown as Record<string, () => MapQA | undefined>)[k]?.(), key)

async function open(page: Page, link: string, key: string) {
  await page.goto('about:blank')
  await page.goto(`./#/world/thailand/${link}`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect.poll(async () => (await qa(page, key))?.mode, { timeout: 20_000 }).toBe('webgl')
  // (The entrance settles first: its camera moves on its own.)
  await page.waitForTimeout(4500)
}

/** A slow drag across the open sky at the side of the board (clear of the pins). */
async function drag(page: Page, dx: number) {
  const { width, height } = page.viewportSize()!
  const x = width * 0.88
  const y = height * 0.3
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + (dx * i) / 8, y)
  await page.mouse.up()
}

for (const map of MAPS) {
  test(`${map.name} turns with a drag`, async ({ page }) => {
    await open(page, map.link, map.key)
    const before = (await qa(page, map.key))!.yaw!
    await drag(page, -220)
    await expect.poll(async () => Math.abs((await qa(page, map.key))!.yaw! - before), { timeout: 15_000 }).toBeGreaterThan(20)
  })
}

test('no rock on the Krabi map stands half on the beach', async ({ page }) => {
  await open(page, 'boat-trip/map', '__thaiBoatQA')
  expect((await qa(page, '__thaiBoatQA'))!.stranded).toEqual([])
})

test("a drag on the Nan map's car drives it instead of turning the board", async ({ page }) => {
  await open(page, 'nan-trip/map', '__thaiNanQA')
  const start = (await qa(page, '__thaiNanQA'))!
  const [x, y] = start.car!
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 1; i <= 16; i++) {
    await page.mouse.move(x + 7 * i, y - 3 * i)
    await page.waitForTimeout(30)
  }
  const mid = (await qa(page, '__thaiNanQA'))!
  await page.mouse.up()
  expect(mid.held).toBe(true)
  expect(mid.yaw).toBe(start.yaw)
})
