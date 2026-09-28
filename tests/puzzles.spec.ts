import { test, expect } from '@playwright/test'

for (const viewport of [{ width: 820, height: 1180 }, { width: 1180, height: 820 }, { width: 1024, height: 1366 }]) {
  test(`picture puzzles at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    test.setTimeout(90000)
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('/#/world/puzzles')
    await page.getByRole('button', { name: /let's play/i }).click()
    for (const name of ['Outback Kangaroos', 'Great Barrier Reef', 'Sydney Harbour', 'Pyramids of Giza', 'Sailing the Nile', 'Sphinx and Friends']) {
      await page.getByRole('button', { name, exact: true }).click()
      for (const count of [4, 6, 9, 12]) {
        await page.getByRole('button', { name: `${count} pieces`, exact: true }).click()
        await expect(page.getByRole('img', { name: /^Puzzle piece/ })).toHaveCount(count)
        const piece = page.getByRole('img', { name: 'Puzzle piece 1', exact: true })
        await piece.click()
        const box = await piece.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
        await expect(page.locator('[data-target="slot-0"]')).toBeVisible()
        if (count === 4) {
          for (let n = 0; n < count; n++) {
            const from = await page.getByRole('img', { name: `Puzzle piece ${n + 1}`, exact: true }).boundingBox()
            const to = await page.locator(`[data-target="slot-${n}"]`).boundingBox()
            await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2)
            await page.mouse.down()
            await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 12 })
            await page.mouse.up()
            await expect(page.getByRole('img', { name: `Puzzle piece ${n + 1} (in place)`, exact: true })).toBeVisible()
          }
          await expect(page.getByRole('button', { name: '↻ Play again', exact: true })).toBeVisible()
        }
        if (name === 'Outback Kangaroos' && count === 12) await page.screenshot({ path: `/tmp/puzzle-play-${viewport.width}.png` })
        await page.getByRole('button', { name: '🧩 Pieces', exact: true }).click()
      }
      await page.getByRole('button', { name: 'Back to puzzles' }).click()
      await page.goto('/#/world/puzzles')
    }
    expect(errors).toEqual([])
    await page.screenshot({ path: `/tmp/puzzle-shelf-${viewport.width}.png` })
  })
}
