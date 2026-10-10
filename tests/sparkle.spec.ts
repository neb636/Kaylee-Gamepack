import { expect, test } from '@playwright/test'

// Menus and older games must share the country puppet, including its three resting expressions.
test('all legacy Mascot poses use the shared Sparkle and unique mouth clips', async ({ page }) => {
  await page.goto('./#/playground')
  await page.getByRole('button', { name: /let's play/i }).click()
  const mascots = page.locator('[data-sparkle="puppet"]')
  expect(await mascots.count()).toBeGreaterThanOrEqual(3)
  expect(await page.locator('img[alt="Sparkle the unicorn"]').count()).toBe(0)
  const ids = await mascots.locator('clipPath').evaluateAll((clips) => clips.map((c) => c.id))
  expect(new Set(ids).size).toBe(ids.length)
})

// Check real filled geometry in every animation frame, rather than just the transform strings.
// The visible base of each ear must stay inside the skull when the head/ears rotate and spring.
for (const id of ['sparkle', 'sparkle-snorkel']) {
  test(`${id}: ear roots stay attached across three rounds of every action`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto(`./#/world/puppets/${id}`)
    await page.getByRole('button', { name: /let's play/i }).click()
    await page.waitForFunction((id) => !!window.__puppets?.[id], id)
    const result = await page.evaluate(async (id) => {
      const puppet = document.querySelector(`[data-puppet="${id}"] svg`)!
      const scalp = puppet.querySelector('[data-sparkle-part="scalp"]') as SVGGeometryElement
      const ears = ['earL', 'earR'].map((name) => puppet.querySelector(`[data-sparkle-part="${name}"]`) as SVGGraphicsElement)
      let samples = 0
      const detached: string[] = []
      let action = 'idle'
      let running = true
      const inspect = () => {
        // Sample the center and both sides of the broad ear base, in scalp coordinates.
        for (const [i, ear] of ears.entries()) {
          const intoScalp = scalp.getCTM()!.inverse().multiply(ear.getCTM()!)
          for (const x of [-12, 0, 12]) {
            const point = new DOMPoint(x, 25).matrixTransform(intoScalp)
            if (!scalp.isPointInFill(point)) detached.push(`${action}: ear ${i}, base ${x}`)
          }
        }
        samples++
        if (running) requestAnimationFrame(inspect)
      }
      inspect()
      for (let round = 0; round < 3; round++) {
        for (action of ['wave', 'cheer', 'hop', 'nod', 'think', 'dance', 'wiggle']) {
          await window.__puppets![id]!.play(action)
        }
      }
      running = false
      return { samples, detached: detached.slice(0, 10) }
    }, id)
    expect(result.samples).toBeGreaterThan(100)
    expect(result.detached).toEqual([])
  })
}

test('Sparkle fits the narrow puppet lab and short splash screen', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto('./')
  await page.waitForTimeout(900)
  const splash = (await page.locator('[data-sparkle="puppet"]').boundingBox())!
  expect(splash.y).toBeGreaterThanOrEqual(0)
  expect(splash.y + splash.height).toBeLessThanOrEqual(390)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: /let's play/i }).click()
  await page.goto('./#/world/puppets/sparkle')
  const lab = (await page.locator('[data-sparkle="puppet"]').boundingBox())!
  expect(lab.x).toBeGreaterThanOrEqual(0)
  expect(lab.x + lab.width).toBeLessThanOrEqual(390)
})
