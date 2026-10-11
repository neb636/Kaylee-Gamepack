// Coco's Canyon Glide: QA scenarios. scripts/qa-screens.mjs, qa-motion.mjs and qa-pacing.mjs find every
// src/world/places/*/activities/*/qa.mjs by themselves, so adding an activity never edits those scripts.
// `ctx` is { skip, vp }: skip() closes the story overlay, vp is the viewport being filmed.
export default ({ skip, vp }) => {
  const screens = [
    { name: 'condor-story', hash: '#/world/peru/condor', reset: true, wait: 400 },
    { name: 'condor-start', hash: '#/world/peru/condor', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1500) } },
    // Coco's Canyon Glide moments, reached through its QA hook (window.__canyonQA.jump): leading Pluma to the places,
    // the sun on the other wall (the ridge), Pluma flying by herself, the condor circle at the end.
    ...['follow', 'ridge', 'solo', 'finale'].map((to) => ({
      name: `condor-${to}`,
      hash: '#/world/peru/condor',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.waitForTimeout(500)
        await p.evaluate((t) => window.__canyonQA?.jump(t), to)
        await p.waitForTimeout(to === 'finale' ? 1200 : 3000)
      },
    })),
  ]

  const motion = []
  // Coco's Canyon Glide: hold a finger in the sky and Coco banks after it, sinking slowly in plain air; steer him into a
  // swirl of warm air and he circles up (wings up, fingers spread); pull down for a dive (wings fold) and a swoop.
  const canyonFly = (name, seconds, jump, path) => ({
    name,
    seconds,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/peru/condor`)
      await page.waitForTimeout(600)
      await skip(page)
      if (jump) await page.evaluate((j) => window.__canyonQA?.jump(j), jump)
      await page.waitForTimeout(900)
    },
    act: async (page) => {
      const vp = page.viewportSize()
      // `path`: world targets [x, y, ms]; the finger sits where that point is on screen (clamped to the screen).
      let down = false
      for (const [x, y, ms] of path) {
        const end = Date.now() + ms
        while (Date.now() < end) {
          const w = await page.evaluate(() => window.__canyonQA?.where())
          if (!w) break
          const sx = Math.min(vp.width - 20, Math.max(20, (x - w.cam.x) * w.s))
          const sy = Math.min(vp.height - 20, Math.max(140, (y - w.cam.y) * w.s))
          if (!down) {
            await page.mouse.move(sx, sy)
            await page.mouse.down()
            down = true
          } else await page.mouse.move(sx, sy)
          await page.waitForTimeout(100)
        }
      }
      await page.mouse.up()
    },
  })
  motion.push(
    canyonFly('canyon-ride', 4, null, [[1340, 1800, 1500], [1340, 900, 2500]]),
    canyonFly('canyon-dive', 3.2, 'follow', [[1700, 2600, 2000], [2000, 2100, 1200]]),
  )

  const pacing = [
    { name: "peru coco's canyon glide", id: 'condor', hash: '#/world/peru/condor', reset: true },
  ]

  return { screens, motion, pacing }
}
