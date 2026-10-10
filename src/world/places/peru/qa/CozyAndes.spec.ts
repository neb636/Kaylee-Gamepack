import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
const out = 'qa-output/peru'
mkdirSync(out, { recursive: true })
const sizes = [
  ['ipad-portrait', 820, 1180], ['ipad-landscape', 1180, 820], ['ipadpro-portrait', 1024, 1366], ['ipadpro-landscape', 1366, 1024],
  ['iphone-portrait', 390, 844], ['iphone-landscape', 844, 390], ['iphonemax-portrait', 430, 932],
] as const
async function open(page: Page, route = 'cozy-andes') {
  await page.goto(`/#/world/peru/${route}`)
  const play = page.getByRole('button', { name: /let's play/i })
  if (await play.isVisible()) await play.click()
  const skip = page.getByRole('button', { name: 'Skip', exact: true })
  if (await skip.isVisible()) await skip.click()
  await expect(page.getByRole('button', { name: 'Hear it again' })).toBeVisible()
}
async function drag(page: Page, label: string, target: string) {
  const from = (await page.getByLabel(label, { exact: true }).boundingBox())!
  const to = (await page.locator(`[data-target="${target}"]`).boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 })
  await page.mouse.up()
}
async function zip(page: Page, miss = false) {
  const b = (await page.getByRole('button', { name: "Zip Luna's jacket" }).boundingBox())!
  const slot = (await page.locator('.peru-luna-slot').boundingBox())!
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - slot.height * (miss ? .025 : .113), { steps: 10 })
  await page.mouse.up()
}
for (const [name, width, height] of sizes) test(`Cozy Andes gestures and layout: ${name}`, async ({ page }) => {
  await page.setViewportSize({ width, height })
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await open(page)
  await page.screenshot({ path: `${out}/${name}-hat.png` })
  if (name.startsWith('ipad')) {
    const hat = (await page.getByLabel('Warm hat', { exact: true }).boundingBox())!
    expect(hat.width).toBeGreaterThanOrEqual(88); expect(hat.height).toBeGreaterThanOrEqual(88)
  }
  await drag(page, 'Warm hat', 'hat')
  await expect(page.getByLabel('Scarf', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Beach hat', exact: true }).click()
  await page.getByRole('button', { name: 'Beach hat', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Beach hat', exact: true })).toHaveCount(0)
  await page.screenshot({ path: `${out}/${name}-help.png` })
  await drag(page, 'Scarf', 'scarf')
  await expect(page.getByLabel('Warm jacket', { exact: true })).toBeVisible()
  await drag(page, 'Warm jacket', 'jacket')
  await expect(page.getByRole('button', { name: "Zip Luna's jacket" })).toBeVisible()
  await zip(page, true)
  await expect(page.getByRole('button', { name: "Zip Luna's jacket" })).toBeVisible()
  await page.screenshot({ path: `${out}/${name}-zip.png` })
  await zip(page)
  await page.screenshot({ path: `${out}/${name}-dressed.png` })
  await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toHaveCount(2)
  await page.getByRole('button', { name: 'Back to the map', exact: true }).last().click()
  await expect(page.getByLabel('Warm alpaca journal picture earned')).toBeVisible()
  await page.screenshot({ path: `${out}/${name}-hub.png` })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight)
  expect(overflow).toBe(false)
  expect(errors).toEqual([])
})
test('Tap alternatives, persistence, rotation, cancellation and partial finale', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await open(page)
  // Off-target drag is recoverable.
  const hat = (await page.getByLabel('Warm hat', { exact: true }).boundingBox())!
  await page.mouse.move(hat.x + hat.width / 2, hat.y + hat.height / 2); await page.mouse.down()
  await page.mouse.move(15, 300, { steps: 10 }); await page.mouse.up()
  await expect(page.getByLabel('Warm hat', { exact: true })).toBeVisible()
  await page.getByLabel('Warm hat', { exact: true }).click()
  await page.setViewportSize({ width: 1180, height: 820 })
  await page.getByLabel('Scarf', { exact: true }).click()
  await page.getByLabel('Warm jacket', { exact: true }).click()
  const pull = page.getByRole('button', { name: "Zip Luna's jacket" })
  const start = (await pull.boundingBox())!
  await pull.dispatchEvent('pointerdown', { pointerId: 55, pointerType: 'touch', clientX: start.x + 40, clientY: start.y + 40 })
  await pull.dispatchEvent('pointermove', { pointerId: 55, pointerType: 'touch', clientX: start.x + 40, clientY: start.y + 20 })
  await pull.dispatchEvent('pointercancel', { pointerId: 55, pointerType: 'touch' })
  expect((await pull.boundingBox())!.y).toBeCloseTo(start.y, 0)
  await pull.click()
  await expect(page.getByRole('button', { name: 'Back to the map', exact: true })).toHaveCount(2)
  await page.getByRole('button', { name: 'Back to the map', exact: true }).last().click()
  await page.reload()
  const play = page.getByRole('button', { name: /let's play/i }); if (await play.isVisible()) await play.click()
  await expect(page.getByLabel('Warm alpaca journal picture earned')).toBeVisible()
  await page.getByRole('button', { name: 'Party', exact: true }).click()
  await expect(page.getByText('Our expedition opens soon!', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: /you did it/i })).toHaveCount(0)
  await page.getByRole('button', { name: 'Return to Peru' }).click()
  await page.getByRole('button', { name: 'Rainbow Weaving coming soon' }).click()
  await expect(page.getByRole('button', { name: 'Cozy Andes', exact: true })).toBeVisible()
})
test('Luna reference and three motion review rounds', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 })
  await page.goto('/#/world/puppets/peru-luna')
  const play = page.getByRole('button', { name: /let's play/i }); if (await play.isVisible()) await play.click()
  await expect(page.locator('[data-puppet="peru-luna"]')).toBeVisible()
  await page.screenshot({ path: `${out}/luna-puppet.png` })
  const actions = ['wave', 'shiver', 'snuggle', 'reach', 'nod', 'cheer', 'giggle', 'shake']
  for (let round = 1; round <= 3; round++) for (const action of actions) {
    await page.getByRole('button', { name: `peru-luna ${action}`, exact: true }).click()
    const frames: Buffer[] = []
    for (let i = 0; i < 6; i++) { frames.push(await page.locator('[data-puppet="peru-luna"] > div').first().screenshot()); await page.waitForTimeout(150) }
    const parts = await Promise.all(frames.map(f => sharp(f).resize(180, 240, { fit: 'contain', background: '#FFF7F0' }).png().toBuffer()))
    await sharp({ create: { width: 1080, height: 240, channels: 4, background: '#FFF7F0' } }).composite(parts.map((input, i) => ({ input, left: i * 180, top: 0 }))).png().toFile(`${out}/motion-${round}-${action}.png`)
  }
  writeFileSync(`${out}/motion-report.txt`, 'Three rounds of all eight Luna actions captured for visual inspection. Audio/lip sync needs iPad listening.\n')
})
