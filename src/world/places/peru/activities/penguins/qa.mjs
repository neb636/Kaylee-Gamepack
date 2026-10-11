// Pepa's Penguin Cliff: QA scenarios. scripts/qa-screens.mjs, qa-motion.mjs and qa-pacing.mjs find every
// src/world/places/*/activities/*/qa.mjs by themselves, so adding an activity never edits those scripts.
// `ctx` is { skip, vp }: skip() closes the story overlay, vp is the viewport being filmed.
export default ({ skip, vp }) => {
  const screens = [
    { name: 'penguins-story', hash: '#/world/peru/penguins', reset: true, wait: 400 },
    { name: 'penguins-play', hash: '#/world/peru/penguins', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1500) } },
    // Pepa's Penguin Cliff moments, reached through its QA hook (window.__penguinQA.jump): the fish schools, feeding the
    // chicks, the twist (third chick, swell, pelican), the chicks' first swim, the family parade.
    ...['fish', 'feed', 'twist', 'swim', 'parade'].map((to) => ({
      name: `penguins-${to}`,
      hash: '#/world/peru/penguins',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.waitForTimeout(500)
        await p.evaluate((t) => window.__penguinQA?.jump(t), to)
        await p.waitForTimeout(to === 'parade' ? 3200 : to === 'twist' ? 2400 : 1800)
      },
    })),
  ]

  const motion = []
  // Pepa's Penguin Cliff: grab the front penguin on the launch rock, pull it back (it crouches, the dotted arc shows the
  // splash spot), let go: the leap, the splash, the underwater swim. `jump` starts later (fish schools, the chicks' swim).
  const penguinLaunch = (name, seconds, jump, pull) => ({
    name,
    seconds,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/peru/penguins`)
      await page.waitForTimeout(600)
      await skip(page)
      await page.waitForSelector('[aria-label="penguin"]', { timeout: 20000 })
      if (jump) await page.evaluate((j) => window.__penguinQA?.jump(j), jump)
      await page.waitForTimeout(jump === 'swim' ? 3200 : 900)
    },
    act: async (page) => {
      const boxes = await page.$$eval('[aria-label="penguin"], [aria-label="penguin chick"]', (els) =>
        els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => {
          const r = e.getBoundingClientRect()
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
        }),
      )
      const front = boxes.sort((a, b) => b.x - a.x)[0]
      if (!front) throw new Error('no penguin found')
      await page.mouse.move(front.x, front.y)
      await page.mouse.down()
      await page.mouse.move(front.x - pull * vp.width, front.y + pull * vp.height * 0.5, { steps: 12 })
      await page.waitForTimeout(400)
      await page.mouse.up()
    },
  })
  motion.push(penguinLaunch('penguin-launch', 8, null, 0.13), penguinLaunch('penguin-fish', 5, 'fish', 0.09), penguinLaunch('penguin-chick-swim', 4.5, 'swim', 0.08))

  const pacing = [
    { name: "peru pepa's penguin cliff", id: 'penguins', hash: '#/world/peru/penguins', reset: true },
  ]

  return { screens, motion, pacing }
}
