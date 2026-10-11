import { expect, test } from '@playwright/test'

const letters = 'vulture,basket,reeds,lion,reed,reed'

test('Egypt Scribe carries written glyphs through the last letter and reload', async ({ page }) => {
  await page.goto(`./#/world/egypt/scribe/e-2?letters=${letters}`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('e-2')
  // The first written glyph comes from the URL, rather than the usual basket for K.
  const glyph = page.locator('svg[viewBox="0 0 100 100"]').first()
  await expect(glyph.locator('path').first()).toHaveAttribute('d', /^M22 60/)
  const reed = page.getByRole('button', { name: 'reed stamp', exact: true })
  const box = await reed.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.id)).toBe('framed')
  await page.mouse.up()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.params.letters)).toBe(letters)
  const hash = await page.evaluate(() => location.hash)
  await page.reload()
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('framed')
  await expect(glyph.locator('path').first()).toHaveAttribute('d', /^M22 60/)
  expect(new URLSearchParams(hash.split('?')[1]).get('letters')).toBe(letters)
})

test('Egypt finale restores colored monuments and continues from the flag to fireworks', async ({ page }) => {
  const lights = 'big:2,left:4,sphinx:1,right:0,big:3,left:5'
  await page.goto(`./#/world/egypt/party/flag?stamps=all&lights=${lights}`)
  await page.getByRole('button', { name: /let's play/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSectionLog?.[0]?.id)).toBe('flag')
  await expect(page.locator('polygon[points="875,215 1215,627 510,627"]').first()).toHaveAttribute('fill', '#A8DCFF')
  await expect(page.locator('polygon[points="528,395 683,627 368,627"]').first()).toHaveAttribute('fill', '#FF8FB8')
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /rope/i }).click()
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.id)).toBe('fireworks')
  await expect.poll(() => page.evaluate(() => window.__kayleeSection?.params.lights)).toBe(lights)
})
