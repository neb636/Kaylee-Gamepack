// Tika's Mountain Terraces: QA scenarios. scripts/qa-screens.mjs, qa-motion.mjs and qa-pacing.mjs find every
// src/world/places/*/activities/*/qa.mjs by themselves, so adding an activity never edits those scripts.
// `ctx` is { skip, vp }: skip() closes the story overlay, vp is the viewport being filmed.
export default ({ skip, vp }) => {
  const screens = [
    { name: 'terraces-story', hash: '#/world/peru/machu-picchu', reset: true, wait: 400 },
    { name: 'terraces-play', hash: '#/world/peru/machu-picchu', reset: true, act: async (p) => { await skip(p); await p.waitForTimeout(1800) } },
    // Tika's Mountain Terraces, reached through its QA hook (window.__terracesQA.jump): the second and third walls, the
    // last wall in the clouds, and the photobomb at the top.
    ...[1, 2, 3, 'photo'].map((to) => ({
      name: `terraces-${to === 'photo' ? 'photo' : `wall${to}`}`,
      hash: '#/world/peru/machu-picchu',
      reset: true,
      act: async (p) => {
        await skip(p)
        await p.waitForTimeout(500)
        await p.evaluate((t) => window.__terracesQA?.jump(t), to)
        await p.waitForTimeout(1500)
      },
    })),
  ]

  const motion = []
  // Tika's Mountain Terraces: drag a stone off the pile into its own gap (magnetic pull, clonk, dust, shake), then one
  // into a wrong gap (bonk, rolls back). `jump` starts on a later wall.
  const terracesStone = (name, seconds, wrong, jump) => ({
    name,
    seconds,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/peru/machu-picchu`)
      await page.waitForTimeout(600)
      await skip(page)
      if (jump) await page.evaluate((j) => window.__terracesQA?.jump(j), jump)
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const r = await page.evaluate((wrong) => {
        const el = document.querySelector('[data-stone]')
        if (!el) return null
        const gaps = [...document.querySelectorAll('[data-gap]')]
        const gap = gaps.find((g) => (g.dataset.gap === el.dataset.stone) !== wrong)
        if (!gap) return null
        const b = el.getBoundingClientRect()
        const t = gap.getBoundingClientRect()
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: t.left + t.width / 2, ty: t.top + t.height / 2 }
      }, wrong)
      if (!r) throw new Error('no stone or gap found')
      await page.mouse.move(r.x, r.y)
      await page.mouse.down()
      for (let i = 1; i <= 12; i++) {
        await page.mouse.move(r.x + ((r.tx - r.x) * i) / 12, r.y + ((r.ty - r.y) * i) / 12)
        await page.waitForTimeout(40)
      }
      await page.mouse.up()
    },
  })
  motion.push(terracesStone('terraces-clonk', 2.4, false), terracesStone('terraces-bonk', 2.4, true), terracesStone('terraces-clouds', 2.4, false, 3))

  const pacing = [
    { name: "peru tika's mountain terraces", id: 'machu-picchu', hash: '#/world/peru/machu-picchu', reset: true },
  ]

  return { screens, motion, pacing }
}
