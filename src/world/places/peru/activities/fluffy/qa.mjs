// Luna's Fluffy Day: QA scenarios. scripts/qa-screens.mjs, qa-motion.mjs and qa-pacing.mjs find every
// src/world/places/*/activities/*/qa.mjs by themselves, so adding an activity never edits those scripts.
// `ctx` is { skip, vp }: skip() closes the story overlay, vp is the viewport being filmed.
export default ({ skip, vp }) => {
  const screens = [
    { name: 'alpaca-story', hash: '#/world/peru/alpaca', reset: true, wait: 400 },
    { name: 'alpaca-play', hash: '#/world/peru/alpaca', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
    // Luna's Fluffy Day moments, reached through its QA hook (window.__peruQA.jump): the clippers, the family's turn,
    // the yarn and the cactus, the hats tray, the journal photo.
    ...['clip', 'family', 'yarn', 'hats', 'photo'].map((to) => ({
      name: `alpaca-${to}`,
      hash: '#/world/peru/alpaca',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.waitForTimeout(500)
        await p.evaluate((t) => window.__peruQA?.jump(t), to)
        await p.waitForTimeout(to === 'family' ? 2400 : 1500)
      },
    })),
  ]

  const motion = []
  // Luna's Fluffy Day: rub the brush over Luna's fleece (tangles turn shiny, sparkles, things pop out), then the
  // clippers (puffs snip off and float into the basket).
  const fluffyRub = (name, seconds, jump) => ({
    name,
    seconds,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/peru/alpaca`)
      await page.waitForTimeout(600)
      await skip(page)
      if (jump) await page.evaluate((j) => window.__peruQA?.jump(j), jump)
      await page.waitForTimeout(900)
    },
    act: async (page) => {
      const b = await page.locator('[aria-label="Luna"]').first().boundingBox()
      if (!b) throw new Error('no Luna found')
      await page.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.5)
      await page.mouse.down()
      for (let i = 0; i < 5; i++) await page.mouse.move(b.x + b.width * (i % 2 ? 0.2 : 0.75), b.y + b.height * (0.48 + i * 0.05), { steps: 10 })
      await page.mouse.up()
    },
  })
  motion.push(fluffyRub('fluffy-brush', 2.4), fluffyRub('fluffy-clip', 2.6, 'clip'))

  const pacing = [
    { name: "peru luna's fluffy day", id: 'alpaca', hash: '#/world/peru/alpaca', reset: true },
  ]

  return { screens, motion, pacing }
}
