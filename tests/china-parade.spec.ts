import { expect, test } from '@playwright/test'

for (const viewport of [{ width: 820, height: 1180 }, { width: 1180, height: 820 }]) {
  test.describe(`China trophy: ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport, hasTouch: true })

    test('opening the envelope leaves the trophy buttons tappable', async ({ page }) => {
      test.setTimeout(60_000)
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto('./#/world/china')
      await page.getByRole('button', { name: /let's play/i }).click()
      await expect.poll(() => page.evaluate(() => !!window.__kayleeWorld)).toBe(true)
      await page.evaluate(() => window.__kayleeWorld?.stampAll())
      await page.goto('./#/world/china/party')
      await page.getByRole('button', { name: 'Skip', exact: true }).click()

      // Walk the dragon around its lantern loop, then play the remaining finale.
      const { cx, cy, rx, ry } = await page.locator('ellipse[stroke-dasharray="2 14"]').evaluate((el) => {
        const loop = el as SVGEllipseElement
        return { cx: loop.cx.baseVal.value, cy: loop.cy.baseVal.value, rx: loop.rx.baseVal.value, ry: loop.ry.baseVal.value }
      })
      await page.mouse.move(cx, cy + ry)
      await page.mouse.down()
      for (let i = 1; i <= 80; i++) {
        const angle = Math.PI / 2 - (i / 80) * Math.PI * 2
        await page.mouse.move(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle))
        await page.waitForTimeout(60)
      }
      await page.mouse.up()
      const drum = page.getByRole('button', { name: 'Drum', exact: true })
      await expect(drum).toBeVisible()
      for (let i = 0; i < 8; i++) await drum.tap()
      const fireworks = page.getByRole('button', { name: 'Fireworks', exact: true })
      await expect(fireworks).toBeVisible()
      for (let i = 0; i < 5; i++) await fireworks.tap()
      await page.getByRole('button', { name: 'Raise the flag', exact: true }).tap()
      const envelope = page.getByRole('button', { name: 'Open the red envelope', exact: true })
      await expect(envelope).toBeVisible()
      // This target keeps wiggling; tap its center without a stability wait.
      const bounds = (await envelope.boundingBox())!
      await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
      await expect(page.getByRole('heading', { name: /you did it, kaylee/i })).toBeVisible()

      // Visibility alone misses overlays intercepting touches (the original bug).
      for (const name of ['Play again', 'My trophies', 'Home']) {
        const button = page.getByRole('button', { name, exact: true })
        await expect.poll(() => button.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
        })).toBe(true)
      }
      await page.getByRole('button', { name: 'Play again', exact: true }).tap()
      await expect(page.getByRole('button', { name: 'World map', exact: true })).toBeVisible()
      await page.goto('./#/world/china/party')
      await expect(page.getByRole('button', { name: 'Skip', exact: true })).toBeVisible()
      await page.evaluate(() => window.__kaylee?.win())
      await page.getByRole('button', { name: 'Home', exact: true }).tap()
      await expect(page.getByRole('button', { name: 'My passport', exact: true })).toBeVisible()
      await page.goto('./#/world/china/party')
      await expect(page.getByRole('button', { name: 'Skip', exact: true })).toBeVisible()
      await page.evaluate(() => window.__kaylee?.win())
      await page.getByRole('button', { name: 'My trophies', exact: true }).tap()
      await expect(page.getByRole('heading', { name: "Kaylee's Trophies" })).toBeVisible()
      await expect(page.getByText('China Explorer', { exact: true })).toBeVisible()
      expect(errors).toEqual([])
    })
  })
}
