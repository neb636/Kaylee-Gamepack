import { expect, test, type Page } from '@playwright/test'

async function start(page: Page) {
  await page.goto('./#/world/italy/trevi')
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect(page.getByRole('img', { name: 'Tall arch', exact: true })).toBeVisible()
}
async function drag(page: Page, piece: string, target: string) {
  const a = (await page.getByRole('img', { name: piece, exact: true }).boundingBox())!
  const b = (await page.locator(`[data-target="${target}"]`).boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 })
  await page.mouse.up()
}

for (const viewport of [{ width: 820, height: 1180 }, { width: 1180, height: 820 }, { width: 1024, height: 1366 }, { width: 1366, height: 1024 }]) {
  test(`build, toss, earn stamp and replay at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await start(page)
    await page.getByRole('img', { name: 'Short arch', exact: true }).tap()
    await expect(page.locator('[data-filled="true"]')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.__kayleeSpeech?.some(l => l.text === 'Try the tallest arch. It glows!'))).toBe(true)
    await page.screenshot({ path: info.outputPath('build-hint.png') })
    await drag(page, 'Tall arch', 'arch-0')
    await expect(page.locator('[data-filled="true"]')).toHaveCount(1)
    await page.getByRole('img', { name: 'Medium arch', exact: true }).tap()
    await drag(page, 'Short arch', 'arch-2')
    await page.getByRole('button', { name: 'Let the water flow', exact: true }).tap()
    await expect(page.getByLabel('Water flowing downhill')).toBeVisible()
    await page.waitForTimeout(1900)
    await page.screenshot({ path: info.outputPath('water.png') })
    await page.getByRole('button', { name: 'Visit Trevi Fountain', exact: true }).tap()
    await page.waitForTimeout(500)
    await page.screenshot({ path: info.outputPath('fountain.png') })
    await drag(page, 'Wishing coin', 'fountain')
    await expect(page.getByLabel('1 of 3 coins')).toBeVisible()
    await page.getByRole('img', { name: 'Wishing coin', exact: true }).tap()
    await expect(page.getByLabel('2 of 3 coins')).toBeVisible()
    await page.getByRole('img', { name: 'Wishing coin', exact: true }).tap()
    await page.getByRole('button', { name: 'Give Lupa her wishing star', exact: true }).tap()
    await expect(page.getByText('Wolves live in Italy!', { exact: true })).toBeVisible()
    await page.screenshot({ path: info.outputPath('stamp.png') })
    await page.getByRole('button', { name: 'Back to the map', exact: true }).tap()
    await page.getByRole('button', { name: 'Trevi Fountain', exact: true }).tap()
    await expect(page.getByRole('img', { name: 'Tall arch', exact: true })).toBeVisible()
    await expect(page.locator('[data-filled="true"]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('wrong drop stays playable and rotation preserves the bridge', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await start(page)
  await drag(page, 'Tall arch', 'arch-2')
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0)
  // The hinted arch pulses continuously; tap its visible center as a child would.
  const arch = (await page.getByRole('img', { name: 'Tall arch', exact: true }).boundingBox())!
  await page.touchscreen.tap(arch.x + arch.width / 2, arch.y + arch.height / 2)
  await page.setViewportSize({ width: 1180, height: 820 })
  await expect(page.locator('[data-filled="true"]')).toHaveCount(1)
  await drag(page, 'Medium arch', 'arch-1')
  await drag(page, 'Short arch', 'arch-2')
  await expect(page.getByRole('button', { name: 'Let the water flow', exact: true })).toBeVisible()
})
