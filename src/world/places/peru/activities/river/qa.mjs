// Rosa's Rainy River: QA scenarios. scripts/qa-screens.mjs, qa-motion.mjs and qa-pacing.mjs find every
// src/world/places/*/activities/*/qa.mjs by themselves, so adding an activity never edits those scripts.
// `ctx` is { skip, vp }: skip() closes the story overlay, vp is the viewport being filmed.
export default ({ skip, vp }) => {
  const screens = [
    { name: 'river-story', hash: '#/world/peru/river', reset: true, wait: 400 },
    { name: 'river-play', hash: '#/world/peru/river', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
    // Rosa's Rainy River moments, reached through its QA hook (window.__peruRiverQA): raining on the river, the river
    // view once it's filled, the lagoon, the lily pads with the friends, the rainbow.
    {
      name: 'river-rain',
      hash: '#/world/peru/river',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.evaluate(() => window.__peruRiverQA?.rain(0.5, 12))
        await p.waitForTimeout(3500)
      },
    },
    ...['river', 'lagoon', 'pads', 'rainbow'].map((to) => ({
      name: `river-${to === 'river' ? 'full' : to}`,
      hash: '#/world/peru/river',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.waitForTimeout(500)
        if (to === 'river') await p.evaluate(() => window.__peruRiverQA?.rain(0.5, 40))
        else await p.evaluate((t) => window.__peruRiverQA?.jump(t), to)
        await p.waitForTimeout(to === 'river' ? 30000 : to === 'rainbow' ? 2600 : 3200)
      },
    })),
  ]

  const motion = []
  // Rosa's Rainy River: grab the cloud and squeeze it (it squishes and rains), wiggle it over the river (harder rain, a
  // rumble), then a lily bud unrolling in the lagoon's rain.
  const riverSqueeze = (name, seconds, jump) => ({
    name,
    seconds,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/peru/river`)
      await page.waitForTimeout(600)
      await skip(page)
      if (jump) await page.evaluate((j) => window.__peruRiverQA?.jump(j), jump)
      await page.waitForTimeout(jump ? 3200 : 900)
    },
    act: async (page) => {
      const b = await page.locator('[aria-label="rain cloud"]').first().boundingBox()
      if (!b) throw new Error('no cloud found')
      const x = b.x + b.width / 2
      const y = b.y + b.height / 2
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.waitForTimeout(700)
      for (let i = 0; i < 6; i++) await page.mouse.move(x + (i % 2 ? 60 : -60) + i * 12, y + (i % 2 ? 10 : -10), { steps: 6 })
      await page.waitForTimeout(600)
      await page.mouse.up()
    },
  })
  motion.push(riverSqueeze('river-squeeze', 3.2), riverSqueeze('river-lagoon-rain', 3.2, 'lagoon'))

  const pacing = [
    { name: "peru rosa's rainy river", id: 'river', hash: '#/world/peru/river', reset: true },
  ]

  return { screens, motion, pacing }
}
